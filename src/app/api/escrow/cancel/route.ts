import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { ethers } from 'ethers';
import { getConfig } from '@/lib/config';

const config = getConfig();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      escrowId, 
      userEmail,
      action = 'request' // 'request', 'withdraw', or 'cancel'
    } = await request.json();
    
    console.log('[Cancel API] Request received:', { escrowId, userEmail, action });
    
    if (!escrowId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get escrow
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
    
    if (fetchError || !escrow) {
      console.error('[Cancel API] Escrow not found:', escrowId);
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    console.log('[Cancel API] Escrow status:', escrow.status);

    // Determine user role
    const isPayer = userEmail.toLowerCase() === escrow.client_email.toLowerCase();
    const isRecipient = userEmail.toLowerCase() === escrow.freelancer_email.toLowerCase();
    const isInitiator = escrow.initiator_email ? 
      userEmail.toLowerCase() === escrow.initiator_email.toLowerCase() : 
      isPayer; // Default to payer if no initiator_email field
    
    if (!isPayer && !isRecipient) {
      return NextResponse.json(
        { error: 'Not authorized for this escrow' },
        { status: 403 }
      );
    }

    // HANDLE NON-FUNDED ESCROWS (INITIATED or ACCEPTED)
    if (escrow.status === 'INITIATED' || escrow.status === 'ACCEPTED') {
      console.log('[Cancel API] Handling non-funded escrow cancellation');
      
      // Check if user can cancel
      if (!isInitiator) {
        // Non-initiator trying to cancel - they can only decline if INITIATED
        if (escrow.status === 'INITIATED') {
          const { error: declineError } = await supabase
            .from('escrows')
            .update({
              status: 'DECLINED',
              declined_at: new Date().toISOString(),
              declined_by: userEmail
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
          });

          console.log('[Cancel API] Escrow declined successfully');
          return NextResponse.json({
            success: true,
            status: 'DECLINED',
            message: 'Escrow invitation declined'
          });
        }
        
        // Non-initiator trying to cancel ACCEPTED escrow
        return NextResponse.json(
          { error: 'Only the initiator can cancel an accepted escrow before funding' },
          { status: 403 }
        );
      }

      // Initiator cancelling - simple database update
      const { data: updateData, error: cancelError } = await supabase
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
      
      if (cancelError || !updateData) {
        console.error('[Cancel API] Failed to cancel:', cancelError);
        
        // Check if status changed
        const { data: currentEscrow } = await supabase
          .from('escrows')
          .select('status')
          .eq('id', escrowId)
          .single();
        
        if (currentEscrow && !['INITIATED', 'ACCEPTED'].includes(currentEscrow.status)) {
          return NextResponse.json(
            { error: `Cannot cancel - escrow status changed to ${currentEscrow.status}` },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to cancel escrow. Please try again.' },
          { status: 500 }
        );
      }

      console.log('[Cancel API] Escrow cancelled successfully:', updateData.id);

      // Send notification emails
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
      });

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
        });
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
      const otherField = isPayer ? 'recipient_wants_cancel' : 'payer_wants_cancel';
      const currentValue = escrow[field];
      
      // Update cancellation request
      const newValue = action === 'request' ? true : false;
      
      const { error: updateError } = await supabase
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

      // Log cancellation request (if table exists) - using async/await properly
      try {
        await supabase
          .from('cancellation_requests')
          .insert({
            escrow_id: escrowId,
            requester_email: userEmail,
            requester_role: isPayer ? 'payer' : 'recipient',
            action: action === 'request' ? 'REQUEST' : 'WITHDRAW',
            reason: action === 'request' ? 'User requested cancellation' : 'User withdrew cancellation request'
          });
        console.log('[Cancel API] Logged cancellation request');
      } catch (logError) {
        // If the table doesn't exist, just log and continue
        console.log('[Cancel API] Could not log to cancellation_requests table:', logError);
      }

      // Check if both parties want to cancel
      const { data: updatedEscrow } = await supabase
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
          await supabase
            .from('escrows')
            .update({
              status: 'CANCELLED',
              cancelled_at: new Date().toISOString(),
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
            message: 'Escrow cancelled and funds refunded'
          });
        } catch (blockchainError) {
          console.error('[Cancel API] Blockchain error:', blockchainError);
          // Revert the cancellation status
          await supabase
            .from('escrows')
            .update({ [field]: currentValue })
            .eq('id', escrowId);
          
          return NextResponse.json(
            { error: 'Failed to execute cancellation on blockchain' },
            { status: 500 }
          );
        }
      }

      // Notify other party
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
        message: action === 'request' ? 'Cancellation requested' : 'Cancellation request withdrawn',
        bothWantCancel: updatedEscrow?.payer_wants_cancel && updatedEscrow?.recipient_wants_cancel
      });
    }

    // Check for invalid states
    if (['CANCELLED', 'DECLINED', 'COMPLETED', 'RELEASED', 'REFUNDED'].includes(escrow.status)) {
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