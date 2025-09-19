// Create src/app/api/test/debug-deploy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  try {
    const { escrowId } = await request.json();
    
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
    
    if (!escrow?.salt) {
      return NextResponse.json({ error: 'No salt' });
    }
    
    const provider = new ethers.providers.StaticJsonRpcProvider(
      'https://rpc-amoy.polygon.technology/',
      80002
    );
    
    const factory = new ethers.Contract(
      "0x29e3d0775B9A7D3D01191b8f57020516bC64ea8E",
      ["function getVaultAddress(bytes32) view returns (address)"],
      provider
    );
    
    const predicted = await factory.getVaultAddress(escrow.salt);
    
    const usdc = new ethers.Contract(
      "0x8B0180f2101c8260d49339abfEe87927412494B4",
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );
    
    const balance = await usdc.balanceOf(predicted);
    
    // Now try to deploy
    const privateKey = process.env.PRIVATE_KEY!.replace(/['"]/g, '');
    const signer = new ethers.Wallet(privateKey, provider);
    
    const factoryWithSigner = new ethers.Contract(
      "0x29e3d0775B9A7D3D01191b8f57020516bC64ea8E",
      ["function deployVault(bytes32,address,address,uint256) returns (address,address)"],
      signer
    );
    
    console.log('About to deploy with:', {
      salt: escrow.salt,
      predicted,
      balance: ethers.utils.formatUnits(balance, 6)
    });
    
    const tx = await factoryWithSigner.deployVault(
      escrow.salt,
      '0x7349D3d258cc1938D560EDA424dB3b11a8BD37CD',
      '0xf7AC04242EA50291eFd30AC8A215364D0E1e23d7',
      balance,
      { 
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits('50', 'gwei')
      }
    );
    
    const receipt = await tx.wait();
    
    // Update database
    await supabase
      .from('escrows')
      .update({
        vault_address: predicted,
        deployment_tx: receipt.transactionHash
      })
      .eq('id', escrowId);
    
    // Run sync
    await fetch(`${request.nextUrl.origin}/api/escrow/sync-blockchain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escrowId })
    });
    
    return NextResponse.json({
      success: true,
      vault: predicted,
      tx: receipt.transactionHash
    });
    
  } catch (error: any) {
    console.error('Debug deploy error:', error);
    return NextResponse.json({ 
      error: error.message,
      reason: error.reason,
      code: error.code
    });
  }
}