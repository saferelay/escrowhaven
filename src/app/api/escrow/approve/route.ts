import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getMagicInstance } from '@/lib/magic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId, userEmail, action } = await request.json();
    
    console.log('=== APPROVAL REQUEST ===');
    console.log('Escrow ID:', escrowId);
    console.log('User Email:', userEmail);
    console.log('Action:', action || 'approve_full');

    // Get escrow details
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (fetchError || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    // Determine user role
    const isClient = userEmail === escrow.client_email;
    const isFreelancer = userEmail === escrow.freelancer_email;

    if (!isClient && !isFreelancer) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const role = isClient ? 'client' : 'freelancer';

    // Get user's wallet from database
    const { data: userWallet } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', userEmail.toLowerCase())
      .single();

    if (!userWallet?.wallet_address) {
      return NextResponse.json({ 
        error: 'No wallet found. Please connect your wallet first.' 
      }, { status: 400 });
    }

    // For FUNDED escrows, we need to sign the approval
    if (escrow.status === 'FUNDED' && escrow.vault_address) {
      console.log('Escrow is funded, preparing signature...');
      
      // Create the approval message
      const approvalMessage = {
        escrowId: escrow.id,
        vaultAddress: escrow.vault_address,
        action: action || 'approve_full',
        timestamp: Date.now(),
        userRole: role,
        userWallet: userWallet.wallet_address
      };

      // Create a hash of the message for signing
      const messageHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(JSON.stringify(approvalMessage))
      );

      // TODO: In production, this signature would come from the frontend
      // where the user signs with their Magic wallet
      // For now, we'll update the database directly
      
      // Update approval in database
      const updateData: any = {
        [`${role}_approved`]: true,
        [`${role}_wallet_address`]: userWallet.wallet_address,
        last_action_by: userEmail,
        last_action_at: new Date().toISOString()
      };

      // Check if both parties have approved
      const otherPartyApproved = isClient ? escrow.freelancer_approved : escrow.client_approved;
      
      if (otherPartyApproved) {
        console.log('Both parties approved! Preparing to release funds...');
        
        // TODO: Call smart contract to release funds
        // This would involve:
        // 1. Getting signatures from both parties
        // 2. Calling the contract's release function
        // For now, we'll mark as ready for release
        
        updateData.status = 'RELEASE_PENDING';
        
        // Log the event
        await supabase
          .from('escrow_events')
          .insert({
            escrow_id: escrow.id,
            event_type: 'BOTH_APPROVED',
            event_data: {
              client_wallet: isClient ? userWallet.wallet_address : escrow.client_wallet_address,
              freelancer_wallet: isFreelancer ? userWallet.wallet_address : escrow.freelancer_wallet_address,
              message_hash: messageHash
            },
            user_email: userEmail
          });
      }

      const { error: updateError } = await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrowId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: otherPartyApproved ? 'Both parties approved! Funds will be released soon.' : 'Approval recorded. Waiting for other party.',
        messageHash,
        requiresSignature: true
      });
    }

    // For non-funded escrows, just update the database
    const updateData: any = {
      [`${role}_approved`]: true,
      last_action_by: userEmail,
      last_action_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('escrows')
      .update(updateData)
      .eq('id', escrowId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Approval recorded successfully'
    });

  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}