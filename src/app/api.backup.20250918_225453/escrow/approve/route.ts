import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { BlockchainVerifier } from '@/services/blockchain/verification';
import { EscrowStateMachine } from '@/services/escrow-state-machine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize provider and signer for blockchain operations
const provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    : 'https://rpc-amoy.polygon.technology'
);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Contract ABIs
const ESCROW_ABI = [
  'function release() external returns (bool)',
  'function getStatus() view returns (bool funded, bool clientApproved, bool freelancerApproved, bool released)'
];

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

    // For FUNDED escrows, handle approval and potential release
    if (escrow.status === 'FUNDED' && escrow.vault_address) {
      console.log('Escrow is funded, processing approval...');
      
      // First, verify the escrow is actually funded on-chain
      const verifier = new BlockchainVerifier(escrow.network || 'polygon-amoy');
      const { isFunded, actualBalance } = await verifier.verifyFunding(escrowId);
      
      if (!isFunded) {
        console.error('Escrow shows funded but blockchain balance is insufficient');
        return NextResponse.json({ 
          error: 'Escrow funding verification failed. Please contact support.' 
        }, { status: 400 });
      }
      
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
        console.log('Both parties approved! Initiating release...');
        
        try {
          // Transition to PENDING_RELEASE
          await EscrowStateMachine.transition(escrowId, 'PENDING_RELEASE', {
            initiatedBy: userEmail,
            timestamp: new Date().toISOString()
          });
          
          // Execute the release on blockchain
          const escrowContract = new ethers.Contract(
            escrow.vault_address,
            ESCROW_ABI,
            signer
          );
          
          console.log('Calling release on contract:', escrow.vault_address);
          const tx = await escrowContract.release({
            gasLimit: 500000 // Set appropriate gas limit
          });
          
          console.log('Release transaction sent:', tx.hash);
          
          // Update with pending transaction
          await supabase
            .from('escrows')
            .update({
              ...updateData,
              status: 'PENDING_RELEASE',
              release_tx_hash: tx.hash,
              release_initiated_at: new Date().toISOString()
            })
            .eq('id', escrowId);
          
          // Wait for confirmation (2 blocks for safety)
          console.log('Waiting for blockchain confirmation...');
          const receipt = await tx.wait(2);
          
          // Verify the release succeeded
          const releaseResult = await verifier.verifyRelease(escrowId, tx.hash);
          
          if (releaseResult.success) {
            // Transition to RELEASED
            await EscrowStateMachine.transition(escrowId, 'RELEASED', {
              txHash: tx.hash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString()
            });
            
            console.log('Release successful and verified!');
            
            return NextResponse.json({
              success: true,
              message: 'Funds have been released successfully!',
              txHash: tx.hash,
              blockNumber: receipt.blockNumber
            });
          } else {
            // Release failed
            await EscrowStateMachine.transition(escrowId, 'RELEASE_FAILED', {
              txHash: tx.hash,
              error: releaseResult.error
            });
            
            throw new Error(releaseResult.error || 'Release verification failed');
          }
          
        } catch (releaseError: any) {
          console.error('Release failed:', releaseError);
          
          // Revert to FUNDED state
          await supabase
            .from('escrows')
            .update({
              ...updateData,
              status: 'FUNDED',
              release_error: releaseError.message,
              release_failed_at: new Date().toISOString()
            })
            .eq('id', escrowId);
          
          return NextResponse.json({ 
            error: `Release failed: ${releaseError.message}`,
            details: releaseError
          }, { status: 500 });
        }
      } else {
        // Just one party approved, update database
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
          message: 'Approval recorded. Waiting for other party.',
          waitingFor: isClient ? escrow.freelancer_email : escrow.client_email
        });
      }
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

  } catch (error: any) {
    console.error('Approval error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}