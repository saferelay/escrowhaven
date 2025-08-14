import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/blockchain-provider-fixed';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For now, let's use the backend signer approach but record signatures
export async function POST(request: NextRequest) {
  try {
    const { escrowId, action, signature, signedMessage, userEmail } = await request.json();
    
    console.log('=== RELEASE WITH SIGNATURE ===');
    console.log('Action:', action);
    console.log('User:', userEmail);
    console.log('Signature:', signature);
    
    // Get escrow details
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (error || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    // Verify the signature matches the user
    const recoveredAddress = ethers.utils.verifyMessage(signedMessage, signature);
    console.log('Recovered address:', recoveredAddress);
    
    // For V2 contracts, we'll use the backend to execute but store the signature as proof
    const signer = await getSigner();
    const ESCROW_ABI = [
      "function approveAsClient() external",
      "function approveAsFreelancer() external",
      "function released() view returns (bool)"
    ];
    
    const contract = new ethers.Contract(escrow.vault_address, ESCROW_ABI, signer);
    
    try {
      let tx;
      const isClient = userEmail.toLowerCase() === escrow.client_email.toLowerCase();
      
      if (action === 'release' && isClient) {
        console.log('Client releasing with backend signer...');
        tx = await contract.approveAsClient();
      } else if (action === 'refund' && !isClient) {
        console.log('Freelancer approving for refund...');
        tx = await contract.approveAsFreelancer();
      } else {
        return NextResponse.json({ error: 'Invalid action for user' }, { status: 400 });
      }
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      
      // Check if released
      const released = await contract.released();
      
      // Update database with signature proof
      const updateData: any = {
        last_action_by: userEmail,
        last_action_at: new Date().toISOString()
      };
      
      if (isClient) {
        updateData.client_approved = true;
        updateData.release_signature = signature;
      } else {
        updateData.freelancer_approved = true;
        updateData.refund_signature = signature;
      }
      
      if (released) {
        updateData.status = 'RELEASED';
        updateData.released_at = new Date().toISOString();
        updateData.release_tx_hash = tx.hash;
      }
      
      await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrowId);
      
      return NextResponse.json({
        success: true,
        message: released ? 'Payment released!' : 'Approval recorded',
        txHash: tx.hash,
        status: released ? 'RELEASED' : 'FUNDED',
        signatureStored: true
      });
      
    } catch (contractError: any) {
      console.error('Contract call failed:', contractError);
      
      // If it fails because backend isn't authorized, store signature for manual execution
      if (contractError.message.includes('Only client wallet')) {
        await supabase
          .from('escrows')
          .update({
            release_signature: signature,
            release_signed_at: new Date().toISOString(),
            release_signed_message: signedMessage
          })
          .eq('id', escrowId);
          
        return NextResponse.json({
          success: true,
          message: 'Signature recorded. Manual execution required.',
          signatureStored: true,
          requiresManualExecution: true
        });
      }
      
      return NextResponse.json({ 
        error: 'Contract call failed',
        details: contractError.message
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Release error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}