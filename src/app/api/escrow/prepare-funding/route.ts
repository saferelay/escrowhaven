// src/app/api/escrow/prepare-funding/route.ts 
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
    
    // Return existing if already deployed
    if (escrow.vault_address && escrow.deployment_tx) {
      return NextResponse.json({
        vaultAddress: escrow.vault_address,
        recipientWallet: escrow.freelancer_wallet_address
      });
    }
    
    
    // Get Magic wallet addresses
    const [clientWallet, freelancerWallet] = await Promise.all([
      supabase.from('user_wallets').select('wallet_address').eq('email', escrow.client_email).single(),
      supabase.from('user_wallets').select('wallet_address').eq('email', escrow.freelancer_email).single()
    ]);
    
    if (!clientWallet.data?.wallet_address || !freelancerWallet.data?.wallet_address) {
      return NextResponse.json({ 
        error: 'Magic wallets not connected. Both users must connect their wallets first.',
        details: {
          client: !clientWallet.data?.wallet_address ? 'Missing' : 'Connected',
          freelancer: !freelancerWallet.data?.wallet_address ? 'Missing' : 'Connected'
        }
      }, { status: 400 });
    }
    
    const clientAddress = clientWallet.data.wallet_address;
    const freelancerAddress = freelancerWallet.data.wallet_address;
    const isTestMode = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' || escrow.is_test_mode;

    
    // Provider setup
    const provider = new ethers.providers.StaticJsonRpcProvider(
      {
        url: isTestMode ? 'https://rpc-amoy.polygon.technology' : 'https://polygon-rpc.com',
        skipFetchSetup: true
      },
      isTestMode ? 80002 : 137
    );
    
    const FACTORY_ADDRESS = process.env.ESCROWHAVEN_FACTORY_ADDRESS!;
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    const FACTORY_ABI = [
      "function getVaultAddress(bytes32,address,address) view returns (address,address)",
      "function deployVault(bytes32,address,address) returns (address,address)"
    ];
    
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    
    // Generate deterministic salt
    const saltString = `${escrowId}-${clientAddress}-${freelancerAddress}-${Date.now()}`;
    const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(saltString));
    
    console.log('=== VAULT ADDRESS PREDICTION ===');
    console.log('Escrow ID:', escrowId);
    console.log('Salt:', salt);
    console.log('Client wallet:', clientAddress);
    console.log('Freelancer wallet:', freelancerAddress);
    
    // Get predicted vault address (no amount needed)
    const [predictedVaultAddress, predictedSplitterAddress] = await factory.getVaultAddress(
      salt,
      clientAddress,
      freelancerAddress
    );
    
    console.log('Predicted vault:', predictedVaultAddress);
    console.log('Predicted splitter:', predictedSplitterAddress);
    
    // Store in database
    await supabase
      .from('escrows')
      .update({
        vault_address: predictedVaultAddress,
        splitter_address: predictedSplitterAddress,
        client_wallet_address: clientAddress,
        freelancer_wallet_address: freelancerAddress,
        salt: salt,
        factory_address: FACTORY_ADDRESS,
        network: isTestMode ? 'polygon-amoy' : 'polygon',
        is_test_mode: isTestMode,
        status: 'ACCEPTED'
      })
      .eq('id', escrowId);
    
    return NextResponse.json({
      vaultAddress: predictedVaultAddress,
      splitterAddress: predictedSplitterAddress,
      recipientWallet: freelancerAddress,
      factoryAddress: FACTORY_ADDRESS,
      salt: salt,
      message: 'Vault address predicted - ready for funding',
      explorerUrl: isTestMode 
        ? `https://amoy.polygonscan.com/address/${predictedVaultAddress}`
        : `https://polygonscan.com/address/${predictedVaultAddress}`
    });
    
  } catch (error: any) {
    console.error('Prediction error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to predict vault address',
      details: error.reason || 'Check server logs for details'
    }, { status: 500 });
  }
}