import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/blockchain-provider-fixed';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ESCROW_V2_ABI = [
  "function approveAsClient() external",
  "function approveAsFreelancer() external",
  "function clientApproved() view returns (bool)",
  "function freelancerApproved() view returns (bool)",
  "function released() view returns (bool)",
  "function totalAmount() view returns (uint256)",
  "function balanceOf() view returns (uint256)"
];

export async function POST(request: NextRequest) {
  try {
    const { escrowId, userEmail, action } = await request.json();
    
    console.log('=== APPROVE V2 ===');
    console.log('Escrow ID:', escrowId);
    console.log('User:', userEmail);
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
    
    if (!escrow.vault_address) {
      return NextResponse.json({ error: 'Escrow not deployed' }, { status: 400 });
    }
    
    // Determine user role
    const isClient = userEmail.toLowerCase() === escrow.client_email.toLowerCase();
    const isFreelancer = userEmail.toLowerCase() === escrow.freelancer_email.toLowerCase();
    
    if (!isClient && !isFreelancer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get signer
    const signer = await getSigner();
    const contract = new ethers.Contract(escrow.vault_address, ESCROW_V2_ABI, signer);
    
    try {
      // Check current approval status
      const [clientApproved, freelancerApproved, released] = await Promise.all([
        contract.clientApproved(),
        contract.freelancerApproved(),
        contract.released()
      ]);
      
      console.log('Contract status:', { clientApproved, freelancerApproved, released });
      
      if (released) {
        return NextResponse.json({ 
          error: 'Escrow already released',
          status: 'RELEASED' 
        }, { status: 400 });
      }
      
      // Execute approval based on role
      let tx;
      if (isClient && !clientApproved) {
        console.log('Calling approveAsClient()...');
        tx = await contract.approveAsClient();
      } else if (isFreelancer && !freelancerApproved) {
        console.log('Calling approveAsFreelancer()...');
        tx = await contract.approveAsFreelancer();
      } else {
        return NextResponse.json({ 
          error: `${isClient ? 'Client' : 'Freelancer'} already approved`,
          clientApproved,
          freelancerApproved
        }, { status: 400 });
      }
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Check if both approved (contract auto-releases)
      const [newClientApproved, newFreelancerApproved, nowReleased] = await Promise.all([
        contract.clientApproved(),
        contract.freelancerApproved(),
        contract.released()
      ]);
      
      // Update database
      const updateData: any = {
        client_approved: newClientApproved,
        freelancer_approved: newFreelancerApproved,
        last_action_by: userEmail,
        last_action_at: new Date().toISOString()
      };
      
      if (nowReleased) {
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
        message: nowReleased ? 'Payment released!' : `${isClient ? 'Client' : 'Freelancer'} approved`,
        txHash: tx.hash,
        clientApproved: newClientApproved,
        freelancerApproved: newFreelancerApproved,
        released: nowReleased,
        status: nowReleased ? 'RELEASED' : 'FUNDED'
      });
      
    } catch (contractError: any) {
      console.error('Contract call failed:', contractError);
      return NextResponse.json({ 
        error: 'Contract call failed',
        details: contractError.message,
        reason: contractError.reason
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Approval error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}