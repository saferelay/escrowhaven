import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/blockchain-provider-fixed';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ESCROW_V2_1_ABI = [
  "function releasePaymentWithSignature(bytes signature, uint256 nonce, uint256 deadline) external",
  "function refundPaymentWithSignature(bytes signature, uint256 nonce, uint256 deadline) external",
  "function getStatus() view returns (bool funded, bool released, bool refunded, uint256 balance)"
];

export async function POST(request: NextRequest) {
  try {
    const { escrowId, action, signature, message } = await request.json();
    
    console.log('=== RELEASE/REFUND V2 ===');
    console.log('Action:', action);
    
    // Get escrow details
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (error || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    // Get signer (backend wallet that pays gas)
    const signer = await getSigner();
    const contract = new ethers.Contract(escrow.vault_address, ESCROW_V2_1_ABI, signer);
    
    try {
      let tx;
      const nonce = Date.now(); // Simple nonce
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline
      
      if (action === 'release') {
        console.log('Calling releasePaymentWithSignature...');
        tx = await contract.releasePaymentWithSignature(signature, nonce, deadline);
      } else if (action === 'refund') {
        console.log('Calling refundPaymentWithSignature...');
        tx = await contract.refundPaymentWithSignature(signature, nonce, deadline);
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed');
      
      // Update database
      const updateData: any = {
        last_action_by: action === 'release' ? escrow.client_email : escrow.freelancer_email,
        last_action_at: new Date().toISOString()
      };
      
      if (action === 'release') {
        updateData.client_released = true;
        updateData.status = 'RELEASED';
        updateData.released_at = new Date().toISOString();
        updateData.release_tx_hash = tx.hash;
        updateData.release_signature = signature;
      } else {
        updateData.freelancer_refunded = true;
        updateData.status = 'REFUNDED';
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_tx_hash = tx.hash;
        updateData.refund_signature = signature;
      }
      
      await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrowId);
      
      return NextResponse.json({
        success: true,
        message: action === 'release' ? 'Payment released!' : 'Payment refunded!',
        txHash: tx.hash,
        status: action === 'release' ? 'RELEASED' : 'REFUNDED'
      });
      
    } catch (contractError: any) {
      console.error('Contract call failed:', contractError);
      return NextResponse.json({ 
        error: 'Contract call failed',
        details: contractError.message
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Release/Refund error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}