// src/app/api/escrow/deploy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      clientEmail, 
      freelancerEmail, 
      amountUsd, 
      initiatorEmail,
      initiatorRole,
      description 
    } = body;
    
    // Get or generate wallet addresses
    const { data: clientWalletData } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', clientEmail)
      .single();
      
    const { data: freelancerWalletData } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', freelancerEmail)
      .single();
    
    const clientAddress = clientWalletData?.wallet_address || 
      ethers.utils.getAddress('0x' + ethers.utils.keccak256(ethers.utils.toUtf8Bytes(clientEmail)).slice(26));
    
    const freelancerAddress = freelancerWalletData?.wallet_address || 
      ethers.utils.getAddress('0x' + ethers.utils.keccak256(ethers.utils.toUtf8Bytes(freelancerEmail)).slice(26));
    
    // Deploy contract - FIX THE RPC URL
    const factoryAddress = process.env.ESCROWHAVEN_FACTORY_ADDRESS || '0xCaEc79c55cdBca380135C5EB9992a45392C322ed';
    const FACTORY_ABI = [
      "function createEscrow(address client, address freelancer, uint256 amount) returns (address escrow, address splitter)",
      "event EscrowCreated(address indexed escrow, address indexed splitter, address client, address freelancer, uint256 amount)"
    ];
    
    // Use the working RPC URL
    const provider = new ethers.providers.JsonRpcProvider('https://polygon-amoy.drpc.org');
    
    // Test the connection
    try {
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.name, 'chainId:', network.chainId);
    } catch (netError) {
      console.error('Network connection failed:', netError);
      // Fallback to another RPC
      const fallbackProvider = new ethers.providers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
      const network = await fallbackProvider.getNetwork();
      console.log('Using fallback network:', network.name);
    }
    
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);
    const amountUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
    
    console.log('Deploying escrow with:', { clientAddress, freelancerAddress, amountUsdc: amountUsdc.toString() });
    
    const tx = await factory.createEscrow(clientAddress, freelancerAddress, amountUsdc, {
      gasLimit: 500000 // Add gas limit
    });
    const receipt = await tx.wait();
    
    const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
    const escrowAddress = event?.args?.[0];
    const splitterAddress = event?.args?.[1];
    
    console.log('Escrow deployed:', escrowAddress, 'Splitter:', splitterAddress);
    
    // Save to database
    const { data: escrowData, error: dbError } = await supabase
      .from('escrows')
      .insert({
        amount_cents: Math.round(parseFloat(amountUsd) * 100),
        vault_address: escrowAddress,
        splitter_address: splitterAddress,
        status: 'INITIATED',
        client_email: clientEmail,
        freelancer_email: freelancerEmail,
        client_wallet_address: clientAddress,
        freelancer_wallet_address: freelancerAddress,
        initiator_email: initiatorEmail,
        initiator_role: initiatorRole,
        description: description,
        contract_version: 'escrowhaven-v2',
        network: 'polygon-amoy',
        deployment_tx_hash: receipt.transactionHash
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    return NextResponse.json({
      escrowId: escrowData.id,
      escrowAddress,
      splitterAddress,
      txHash: receipt.transactionHash
    });
    
  } catch (error: any) {
    console.error('Deploy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deploy escrow' },
      { status: 500 }
    );
  }
}