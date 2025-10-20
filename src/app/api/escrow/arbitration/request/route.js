// src/app/api/escrow/arbitration/request/route.js
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ESCROW_ABI = [
  "function requestArbitration() payable",
  "function payArbitrationFee() payable",
  "function timeoutByDisputer()",
  "function disputeStatus() view returns (uint256)",
  "function disputeInitiator() view returns (address)",
  "function disputeFeeDepositDeadline() view returns (uint256)",
  "function arbitrationFeeAmount() view returns (uint256)"
];

const ARBITRATOR_ABI = [
  "function arbitrationCost(bytes extraData) view returns (uint256)"
];

export async function POST(request) {
  try {
    const { escrowId, action, userEmail } = await request.json();
    
    console.log(`Arbitration action: ${action} for escrow: ${escrowId}`);
    
    // Get escrow details
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (error || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    const isTestMode = escrow.is_test_mode;
    const provider = new ethers.providers.JsonRpcProvider(
      isTestMode ? "https://polygon-amoy.drpc.org" : "https://polygon.drpc.org"
    );
    
    // For now, use backend wallet - in production, use Magic wallet
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const escrowContract = new ethers.Contract(escrow.vault_address, ESCROW_ABI, signer);
    
    if (action === 'request') {
      // Get arbitration cost
      let arbitrationCost;
      
      if (isTestMode) {
        // Mock arbitrator uses fixed low cost
        arbitrationCost = ethers.utils.parseEther("0.001");
      } else {
        // Real Kleros arbitrator
        const arbitratorAddress = "0x9C1dA9A04925bDfDedf0f6421bC7EEa8305F9002";
        const arbitrator = new ethers.Contract(arbitratorAddress, ARBITRATOR_ABI, provider);
        arbitrationCost = await arbitrator.arbitrationCost("0x");
      }
      
      console.log('Arbitration cost:', arbitrationCost.toString());
      
      // Request arbitration
      const tx = await escrowContract.requestArbitration({ 
        value: arbitrationCost,
        gasLimit: 500000
      });
      
      console.log('Arbitration requested, tx:', tx.hash);
      const receipt = await tx.wait();
      
      // Update database
      await supabase
        .from('escrows')
        .update({
          arbitration_status: 'requested',
          arbitration_proposed_by: userEmail === escrow.client_email ? 'client' : 'freelancer',
          arbitration_proposed_at: new Date().toISOString(),
          kleros_dispute_cost_usd: isTestMode ? 0.01 : 200 // Approximate
        })
        .eq('id', escrowId);
      
      return NextResponse.json({ 
        success: true, 
        txHash: receipt.transactionHash,
        cost: arbitrationCost.toString(),
        message: 'Arbitration requested. Other party has 72 hours to pay their share.'
      });
      
    } else if (action === 'pay') {
      // Get fee amount from contract
      const feeAmount = await escrowContract.arbitrationFeeAmount();
      
      console.log('Paying arbitration fee:', feeAmount.toString());
      
      const tx = await escrowContract.payArbitrationFee({ 
        value: feeAmount,
        gasLimit: 500000
      });
      
      const receipt = await tx.wait();
      
      // Update database
      await supabase
        .from('escrows')
        .update({
          arbitration_status: 'active',
          kleros_dispute_pending: true,
          kleros_dispute_raised_at: new Date().toISOString()
        })
        .eq('id', escrowId);
      
      return NextResponse.json({ 
        success: true, 
        txHash: receipt.transactionHash,
        message: 'Dispute created. Kleros jurors will review the case.'
      });
      
    } else if (action === 'timeout') {
      // Check deadline has passed
      const deadline = await escrowContract.disputeFeeDepositDeadline();
      const now = Math.floor(Date.now() / 1000);
      
      if (now <= deadline) {
        return NextResponse.json({ 
          error: 'Timeout period has not passed yet' 
        }, { status: 400 });
      }
      
      const tx = await escrowContract.timeoutByDisputer({ gasLimit: 500000 });
      const receipt = await tx.wait();
      
      // Determine outcome
      const initiator = await escrowContract.disputeInitiator();
      const isClientInitiator = initiator.toLowerCase() === escrow.client_wallet_address?.toLowerCase();
      
      await supabase
        .from('escrows')
        .update({
          arbitration_status: 'resolved',
          status: isClientInitiator ? 'REFUNDED' : 'RELEASED',
          kleros_ruling: isClientInitiator ? 1 : 2
        })
        .eq('id', escrowId);
      
      return NextResponse.json({ 
        success: true, 
        txHash: receipt.transactionHash,
        message: 'Dispute resolved by timeout in your favor.'
      });
    }
    
  } catch (error) {
    console.error('Arbitration error:', error);
    return NextResponse.json({ 
      error: error.message || 'Arbitration action failed' 
    }, { status: 500 });
  }
}