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
      action = 'request' // 'request' or 'withdraw'
    } = await request.json();
    
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
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Check if escrow is in correct state
    if (escrow.status !== 'FUNDED') {
      return NextResponse.json(
        { error: 'Escrow must be in FUNDED state to cancel' },
        { status: 400 }
      );
    }

    // Determine user role
    const isPayer = userEmail.toLowerCase() === escrow.client_email.toLowerCase();
    const isRecipient = userEmail.toLowerCase() === escrow.freelancer_email.toLowerCase();
    
    if (!isPayer && !isRecipient) {
      return NextResponse.json(
        { error: 'Not authorized for this escrow' },
        { status: 403 }
      );
    }

    const field = isPayer ? 'payer_wants_cancel' : 'recipient_wants_cancel';
    const otherField = isPayer ? 'recipient_wants_cancel' : 'payer_wants_cancel';
    const currentValue = escrow[field];
    
    // Update cancellation request
    const newValue = action === 'request' ? true : false;
    
    const { error: updateError } = await supabase
      .from('escrows')
      .update({ [field]: newValue })
      .eq('id', escrowId);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update cancellation request' },
        { status: 500 }
      );
    }

    // Log cancellation request
    await supabase
      .from('cancellation_requests')
      .insert({
        escrow_id: escrowId,
        requester_email: userEmail,
        requester_role: isPayer ? 'payer' : 'recipient',
        action: action === 'request' ? 'REQUEST' : 'WITHDRAW',
        reason: action === 'request' ? 'User requested cancellation' : 'User withdrew cancellation request'
      });

    // Check if both parties want to cancel
    const { data: updatedEscrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (updatedEscrow && updatedEscrow.payer_wants_cancel && updatedEscrow.recipient_wants_cancel) {
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
            <p>Amount: $${escrow.amount_cents / 100}</p>
            <p>The funds have been returned to the payer's wallet.</p>
            <p>Transaction: ${tx.hash}</p>
          `
        });
        
        await sendEmail({
          to: escrow.freelancer_email,
          subject: 'Escrow Cancelled',
          html: `
            <p>The escrow has been cancelled by mutual agreement.</p>
            <p>Amount: $${escrow.amount_cents / 100}</p>
            <p>The funds have been returned to the payer.</p>
          `
        });
        
        return NextResponse.json({
          success: true,
          status: 'CANCELLED',
          message: 'Escrow cancelled and funds refunded'
        });
      } catch (blockchainError) {
        console.error('Blockchain error:', blockchainError);
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
          <p>Amount: $${escrow.amount_cents / 100}</p>
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
    
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}