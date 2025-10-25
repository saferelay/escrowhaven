// app/api/escrow/cancel/route.ts
// Complete version that works with ALL columns now in your database
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { ethers } from 'ethers';
import { getConfig } from '@/lib/config';

const config = getConfig();

// Use service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      escrowId, 
      userEmail,
      action = 'cancel' // 'cancel', 'request', or 'withdraw'
    } = await request.json();
    
    console.log('[Cancel API] Request received:', { escrowId, userEmail, action });
    
    if (!escrowId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get escrow with service role to bypass RLS
    const { data: escrow, error: fetchError } = await supabaseAdmin
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
    
    if (fetchError || !escrow) {
      console.error('[Cancel API] Escrow not found:', escrowId, fetchError);
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    console.log('[Cancel API] Current escrow status:', escrow.status);

    // Determine user role
    const isPayer = userEmail.toLowerCase() === escrow.client_email?.toLowerCase();
    const isRecipient = userEmail.toLowerCase() === escrow.freelancer_email?.toLowerCase();
    const isInitiator = escrow.initiator_email ? 
      userEmail.toLowerCase() === escrow.initiator_email.toLowerCase() : 
      isPayer; // Default to payer if no initiator_email
    
    if (!isPayer && !isRecipient) {
      console.error('[Cancel API] User not authorized');
      return NextResponse.json(
        { error: 'Not authorized for this escrow' },
        { status: 403 }
      );
    }

    // HANDLE NON-FUNDED ESCROWS (INITIATED or ACCEPTED)
    if (escrow.status === 'INITIATED' || escrow.status === 'ACCEPTED') {
      console.log('[Cancel API] Processing non-funded escrow cancellation');
      
      // For INITIATED status, non-initiators decline instead of cancel
      if (escrow.status === 'INITIATED' && !isInitiator) {
        console.log('[Cancel API] Non-initiator declining escrow');
        
        const { error: declineError } = await supabaseAdmin
          .from('escrows')
          .update({
            status: 'DECLINED',
            declined_at: new Date().toISOString(),
            declined_by: userEmail,
            declined_reason: 'Invitation declined'
          })
          .eq('id', escrowId)
          .eq('status', 'INITIATED'); // Ensure status hasn't changed
        
        if (declineError) {
          console.error('[Cancel API] Decline error:', declineError);
          return NextResponse.json(
            { error: 'Failed to decline escrow' },
            { status: 500 }
          );
        }

        // Send notification to initiator
        const initiatorEmail = escrow.initiator_email || escrow.client_email;
        await sendEmail({
          to: initiatorEmail,
          subject: 'Escrow Invitation Declined',
          html: `
            <p>Your escrow invitation has been declined by ${userEmail}.</p>
            <p>Amount: $${(escrow.amount_cents / 100).toFixed(2)}</p>
            <p>Description: ${escrow.description || 'N/A'}</p>
          `
        }).catch(err => console.error('[Cancel API] Email failed:', err));

        console.log('[Cancel API] Escrow declined successfully');
        return NextResponse.json({
          success: true,
          status: 'DECLINED',
          message: 'Escrow invitation declined'
        });
      }
      
      // For cancellation (initiator cancelling, or anyone cancelling ACCEPTED status)
      console.log('[Cancel API] Cancelling escrow...');
      
      const { data: updateResult, error: updateError } = await supabaseAdmin
        .from('escrows')
        .update({
          status: 'CANCELLED',
          cancelled_at: new Date().toISOString(),
          cancelled_by: userEmail,
          cancellation_reason: 'Cancelled before funding'
        })
        .eq('id', escrowId)
        .in('status', ['INITIATED', 'ACCEPTED']) // Ensure still in cancellable state
        .select()
        .single();
      
      if (updateError) {
        console.error('[Cancel API] Update failed:', updateError);
        
        // Check if status already changed
        const { data: currentEscrow } = await supabaseAdmin
          .from('escrows')
          .select('status')
          .eq('id', escrowId)
          .single();
        
        if (currentEscrow && !['INITIATED', 'ACCEPTED'].includes(currentEscrow.status)) {
          return NextResponse.json(
            { error: `Cannot cancel - escrow status is now ${currentEscrow.status}` },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to cancel escrow. Please try again.' },
          { status: 500 }
        );
      }

      console.log('[Cancel API] Escrow cancelled successfully');

      // Send notification emails
      try {
        const otherPartyEmail = isPayer ? escrow.freelancer_email : escrow.client_email;
        
        // Email to canceller
        await sendEmail({
          to: userEmail,
          subject: 'Escrow Cancelled',
          html: `
            <p>You have successfully cancelled the escrow.</p>
            <p>Amount: $${(escrow.amount_cents / 100).toFixed(2)}</p>
            <p>Description: ${escrow.description || 'N/A'}</p>
            <p>No funds were transferred as the escrow was not yet funded.</p>
          `
        }).catch(err => console.error('[Cancel API] Email to canceller failed:', err));

        // Email to other party (if different)
        if (otherPartyEmail && otherPartyEmail !== userEmail) {
          await sendEmail({
            to: otherPartyEmail,
            subject: 'Escrow Cancelled',
            html: `
              <p>The escrow has been cancelled by ${userEmail}.</p>
              <p>Amount: $${(escrow.amount_cents / 100).toFixed(2)}</p>
              <p>Description: ${escrow.description || 'N/A'}</p>
              <p>No funds were transferred as the escrow was not yet funded.</p>
            `
          }).catch(err => console.error('[Cancel API] Email to other party failed:', err));
        }
      } catch (emailError) {
        console.error('[Cancel API] Email sending failed:', emailError);
        // Don't fail the whole request just because email failed
      }

      return NextResponse.json({
        success: true,
        status: 'CANCELLED',
        message: 'Escrow cancelled successfully'
      });
    }

    // HANDLE FUNDED ESCROWS - Requires mutual agreement
    if (escrow.status === 'FUNDED') {
      console.log('[Cancel API] Handling funded escrow cancellation request');
      
      const field = isPayer ? 'payer_wants_cancel' : 'recipient_wants_cancel';
      const currentValue = escrow[field];
      
      // Toggle or set cancellation request
      const newValue = action === 'request' ? true : action === 'withdraw' ? false : true;
      
      const { error: updateError } = await supabaseAdmin
        .from('escrows')
        .update({ [field]: newValue })
        .eq('id', escrowId)
        .eq('status', 'FUNDED'); // Ensure still funded
      
      if (updateError) {
        console.error('[Cancel API] Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update cancellation request' },
          { status: 500 }
        );
      }

      // Check if both parties want to cancel
      const { data: updatedEscrow } = await supabaseAdmin
        .from('escrows')
        .select('*')
        .eq('id', escrowId)
        .single();

      if (updatedEscrow && updatedEscrow.payer_wants_cancel && updatedEscrow.recipient_wants_cancel) {
        console.log('[Cancel API] Both parties agree - executing blockchain cancellation');
        
        // Execute cancellation on blockchain
        try {
          const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
          const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
          
          // Call cancel function on escrow contract
          const escrowContract = new ethers.Contract(
            escrow.vault_address,
            ['function requestCancel() external'],
            signer
          );
          
          const tx = await escrowContract.requestCancel();
          await tx.wait();
          
          // Update database
          await supabaseAdmin
            .from('escrows')
            .update({
              status: 'CANCELLED',
              cancelled_at: new Date().toISOString(),
              cancelled_by: 'mutual_agreement',
              cancellation_reason: 'Mutual cancellation - funds refunded',
              cancellation_tx_hash: tx.hash
            })
            .eq('id', escrowId);
          
          // Send notification emails
          await sendEmail({
            to: escrow.client_email,
            subject: 'Escrow Cancelled - Funds Refunded',
            html: `
              <p>The escrow has been cancelled by mutual agreement.</p>
              <p>Amount: $${(escrow.amount_cents / 100).toFixed(2)}</p>
              <p>The funds have been returned to the payer's wallet.</p>
              <p>Transaction: ${tx.hash}</p>
            `
          });
          
          await sendEmail({
            to: escrow.freelancer_email,
            subject: 'Escrow Cancelled',
            html: `
              <p>The escrow has been cancelled by mutual agreement.</p>
              <p>Amount: $${(escrow.amount_cents / 100).toFixed(2)}</p>
              <p>The funds have been returned to the payer.</p>
            `
          });
          
          return NextResponse.json({
            success: true,
            status: 'CANCELLED',
            message: 'Escrow cancelled and funds refunded',
            txHash: tx.hash
          });
        } catch (blockchainError: any) {
          console.error('[Cancel API] Blockchain error:', blockchainError);
          // Revert the cancellation status
          await supabaseAdmin
            .from('escrows')
            .update({ [field]: currentValue })
            .eq('id', escrowId);
          
          return NextResponse.json(
            { error: 'Failed to execute cancellation on blockchain' },
            { status: 500 }
          );
        }
      }

      // Notify other party about cancellation request
      const otherEmail = isPayer ? escrow.freelancer_email : escrow.client_email;
      const role = isPayer ? 'Payer' : 'Recipient';
      
      if (action === 'request' && !currentValue) {
        await sendEmail({
          to: otherEmail,
          subject: 'Cancellation Requested',
          html: `
            <p>The ${role} has requested to cancel the escrow.</p>
            <p>Amount: $${(escrow.amount_cents / 100).toFixed(2)}</p>
            <p>If you also agree to cancel, the funds will be returned to the payer.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}">View Escrow</a></p>
          `
        });
      }
      
      return NextResponse.json({
        success: true,
        message: action === 'request' ? 'Cancellation requested' : 
                 action === 'withdraw' ? 'Cancellation request withdrawn' : 
                 'Cancellation requested',
        bothWantCancel: updatedEscrow?.payer_wants_cancel && updatedEscrow?.recipient_wants_cancel
      });
    }

    // Check for invalid states
    if (['CANCELLED', 'DECLINED', 'COMPLETED', 'RELEASED', 'REFUNDED', 'SETTLED'].includes(escrow.status)) {
      return NextResponse.json(
        { error: `Cannot cancel escrow in ${escrow.status} status` },
        { status: 400 }
      );
    }

    // Unknown status
    return NextResponse.json(
      { error: `Cannot process cancellation for status: ${escrow.status}` },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('[Cancel API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}