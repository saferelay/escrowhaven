// src/app/api/test/fund-to-predicted/route.ts - UPDATED FOR NEW FLOW
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json();
    
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    // Check escrow status and requirements
    if (escrow.status !== 'ACCEPTED' && escrow.status !== 'INITIATED') {
      return NextResponse.json({ 
        error: `Cannot fund escrow in ${escrow.status} status`,
        currentStatus: escrow.status
      }, { status: 400 });
    }
    
    if (!escrow.salt) {
      return NextResponse.json({ 
        error: 'Escrow missing salt - was it created with old flow?',
        tip: 'Create a new escrow with the updated create-invitation API'
      }, { status: 400 });
    }
    
    if (!escrow.vault_address) {
      return NextResponse.json({ 
        error: 'Escrow missing vault address - was it created with old flow?',
        tip: 'Create a new escrow with the updated create-invitation API'
      }, { status: 400 });
    }
    
    if (escrow.contract_deployed) {
      return NextResponse.json({ 
        error: 'Contract already deployed',
        vault: escrow.vault_address,
        tip: 'This escrow is already funded and deployed'
      }, { status: 400 });
    }
    
    if (escrow.funded_amount && parseFloat(escrow.funded_amount) > 0) {
      return NextResponse.json({ 
        error: 'Already funded',
        amount: escrow.funded_amount,
        vault: escrow.vault_address,
        tip: 'Run check-and-deploy to deploy the contract'
      }, { status: 400 });
    }
    
    const provider = new ethers.providers.StaticJsonRpcProvider(
      { 
        url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        skipFetchSetup: true 
      },
      80002
    );
    
    const privateKey = process.env.PRIVATE_KEY!.replace(/['"]/g, '');
    const signer = new ethers.Wallet(privateKey, provider);
    
    const MOCK_USDC = "0x8B0180f2101c8260d49339abfEe87927412494B4";
    
    // Use the ALREADY CALCULATED vault address from database
    const vaultAddress = escrow.vault_address;
    const splitterAddress = escrow.splitter_address;
    
    console.log('Using pre-calculated addresses:');
    console.log('Vault:', vaultAddress);
    console.log('Splitter:', splitterAddress);
    console.log('Salt:', escrow.salt);
    
    // Check current balance at vault (should be 0)
    const usdcContract = new ethers.Contract(
      MOCK_USDC,
      ["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"],
      provider
    );
    
    const currentBalance = await usdcContract.balanceOf(vaultAddress);
    if (!currentBalance.eq(0)) {
      const currentBalanceUsdc = ethers.utils.formatUnits(currentBalance, 6);
      return NextResponse.json({ 
        error: 'Vault already has funds',
        currentBalance: currentBalanceUsdc,
        vault: vaultAddress,
        tip: 'Run check-and-deploy to deploy the contract'
      }, { status: 400 });
    }
    
    // Send USDC to the pre-calculated vault address
    const amountInUsd = escrow.amount_cents / 100;
    const amountToSend = ethers.utils.parseUnits(amountInUsd.toString(), 6);
    
    console.log(`Sending ${amountInUsd} USDC to ${vaultAddress}...`);
    
    // Connect signer for transfer
    const usdcWithSigner = usdcContract.connect(signer);
    
    const tx = await usdcWithSigner.transfer(vaultAddress, amountToSend, {
      gasPrice: ethers.utils.parseUnits('50', 'gwei'),
      gasLimit: 100000
    });
    
    console.log('Transaction sent:', tx.hash);
    await tx.wait();
    console.log('Transaction confirmed!');
    
    // Update ONLY the funding info, NOT the addresses (they're already set)
    await supabase
      .from('escrows')
      .update({
        funding_tx_hash: tx.hash,
        funded_amount: amountInUsd.toString(),
        // Do NOT update salt, vault_address, or splitter_address - they're already set!
        // Do NOT change status yet - that happens after deployment
      })
      .eq('id', escrowId);
    
    return NextResponse.json({
      success: true,
      message: `Sent ${amountInUsd} USDC to vault`,
      vaultAddress,
      splitterAddress,
      fundingTx: `https://amoy.polygonscan.com/tx/${tx.hash}`,
      next: 'Now run check-and-deploy or wait for cron job',
      tip: 'The vault has funds but no contract yet. Deployment will give the contract control of the funds.'
    });
    
  } catch (error: any) {
    console.error('Funding error:', error);
    return NextResponse.json({ 
      error: error.message,
      code: error.code,
      reason: error.reason 
    }, { status: 500 });
  }
}