// src/app/api/queue/deploy-vaults/route.ts
// Separate deployment handler - single responsibility
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { escrows } = await request.json();
  
  const provider = new ethers.providers.StaticJsonRpcProvider(
    { url: 'https://rpc-amoy.polygon.technology/', skipFetchSetup: true },
    80002
  );
  
  const privateKey = process.env.PRIVATE_KEY!.replace(/['"]/g, '');
  const signer = new ethers.Wallet(privateKey, provider);
  
  const FACTORY = "0x29e3d0775B9A7D3D01191b8f57020516bC64ea8E";
  const deployed = [];
  
  const factory = new ethers.Contract(
    FACTORY,
    ["function deployVault(bytes32,address,address,uint256) returns (address,address)"],
    signer
  );
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  for (const escrow of escrows) {
    try {
      console.log(`Deploying vault for ${escrow.escrowId}...`);
      
      // Get escrow details
      const { data: escrowData } = await supabase
        .from('escrows')
        .select('*')
        .eq('id', escrow.escrowId)
        .single();
      
      // Get wallet addresses
      const { data: clientWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', escrowData.client_email)
        .single();
      
      const { data: freelancerWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', escrowData.freelancer_email)
        .single();
      
      const clientAddress = clientWallet?.wallet_address || '0x7349D3d258cc1938D560EDA424dB3b11a8BD37CD';
      const freelancerAddress = freelancerWallet?.wallet_address || '0xf7AC04242EA50291eFd30AC8A215364D0E1e23d7';
      
      // Deploy
      const gasPrice = await provider.getGasPrice();
      const tx = await factory.deployVault(
        escrow.salt,
        clientAddress,
        freelancerAddress,
        ethers.utils.parseUnits(escrow.balance, 6),
        { 
          gasLimit: 1000000,
          gasPrice: gasPrice.mul(2)
        }
      );
      
      const receipt = await tx.wait();
      
      // Just save the deployment tx, don't change status
      await supabase
        .from('escrows')
        .update({
          deployment_tx: receipt.transactionHash,
          vault_address: escrow.predictedAddress, // We know it should be here
          deployment_completed_at: new Date().toISOString()
        })
        .eq('id', escrow.escrowId);
      
      deployed.push({
        escrowId: escrow.escrowId,
        tx: receipt.transactionHash
      });
      
    } catch (error: any) {
      console.error(`Failed to deploy ${escrow.escrowId}:`, error.message);
    }
  }
  
  // Trigger sync for deployed escrows
  if (deployed.length > 0) {
    await fetch(`${request.nextUrl.origin}/api/cron/sync-escrows`);
  }
  
  return NextResponse.json({ deployed });
}