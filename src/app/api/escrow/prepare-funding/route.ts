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
    
    console.log('=== PREPARE FUNDING REQUEST ===');
    console.log('Escrow ID:', escrowId);
    
    // Get escrow from database
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (fetchError || !escrow) {
      console.error('Escrow not found:', fetchError);
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    console.log('Escrow status:', escrow.status);
    console.log('Test mode:', escrow.is_test_mode);
    
    // If vault already exists, return it
    if (escrow.vault_address) {
      console.log('Vault already exists:', escrow.vault_address);
      return NextResponse.json({
        vaultAddress: escrow.vault_address,
        splitterAddress: escrow.splitter_address,
        recipientWallet: escrow.freelancer_wallet_address,
        message: 'Using existing vault address'
      });
    }
    
    // Get wallet addresses from user_wallets table
    const { data: clientWallet } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', escrow.client_email)
      .single();
    
    const { data: freelancerWallet } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', escrow.freelancer_email)
      .single();
    
    if (!clientWallet?.wallet_address || !freelancerWallet?.wallet_address) {
      console.error('Missing wallet addresses:', {
        client: clientWallet?.wallet_address ? 'Found' : 'Missing',
        freelancer: freelancerWallet?.wallet_address ? 'Found' : 'Missing'
      });
      
      return NextResponse.json({ 
        error: 'Both users must have wallet addresses',
        details: {
          client: clientWallet?.wallet_address ? 'Connected' : 'Missing',
          freelancer: freelancerWallet?.wallet_address ? 'Connected' : 'Missing'
        }
      }, { status: 400 });
    }
    
    const clientAddress = clientWallet.wallet_address;
    const freelancerAddress = freelancerWallet.wallet_address;
    
    console.log('Client wallet:', clientAddress);
    console.log('Freelancer wallet:', freelancerAddress);
    
    // Determine network - use is_test_mode from escrow record
    const isTestMode = escrow.is_test_mode === true;
    
    console.log('Network:', isTestMode ? 'Polygon Amoy (Testnet)' : 'Polygon Mainnet');
    
    // Setup provider - CRITICAL: Use correct network
    const rpcUrl = isTestMode 
      ? 'https://rpc-amoy.polygon.technology'
      : `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    
    const provider = new ethers.providers.StaticJsonRpcProvider(
      {
        url: rpcUrl,
        skipFetchSetup: true
      },
      {
        chainId: isTestMode ? 80002 : 137,
        name: isTestMode ? 'polygon-amoy' : 'polygon-mainnet'
      }
    );
    
    // Get correct factory address for network
    const FACTORY_ADDRESS = isTestMode 
      ? process.env.ESCROWHAVEN_FACTORY_ADDRESS
      : process.env.ESCROWHAVEN_FACTORY_ADDRESS_MAINNET;
    
    if (!FACTORY_ADDRESS) {
      throw new Error(`Factory address not configured for ${isTestMode ? 'testnet' : 'mainnet'}`);
    }
    
    console.log('Factory address:', FACTORY_ADDRESS);
    
    // Factory ABI - matches your EscrowHavenFactory.sol
    const FACTORY_ABI = [
      "function getVaultAddress(bytes32,address,address) view returns (address,address)",
      "function deployVault(bytes32,address,address) returns (address,address)"
    ];
    
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    
    // Use existing salt or generate new one
    let salt = escrow.salt;
    
    if (!salt) {
      // Generate deterministic salt
      const saltString = `${escrowId}-${clientAddress}-${freelancerAddress}-${Date.now()}`;
      salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(saltString));
      console.log('Generated new salt:', salt);
    } else {
      console.log('Using existing salt:', salt);
    }
    
    // Predict vault address using CREATE2
    console.log('Calling factory.getVaultAddress...');
    const [vaultAddress, splitterAddress] = await factory.getVaultAddress(
      salt,
      clientAddress,
      freelancerAddress
    );
    
    console.log('Predicted vault address:', vaultAddress);
    console.log('Predicted splitter address:', splitterAddress);
    
    // Save to database
    const { error: updateError } = await supabase
      .from('escrows')
      .update({
        vault_address: vaultAddress,
        splitter_address: splitterAddress,
        client_wallet_address: clientAddress,
        freelancer_wallet_address: freelancerAddress,
        salt: salt,
        factory_address: FACTORY_ADDRESS,
        network: isTestMode ? 'polygon-amoy' : 'polygon-mainnet'
      })
      .eq('id', escrowId);
    
    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save vault address to database');
    }
    
    console.log('Database updated successfully');
    
    const explorerBase = isTestMode 
      ? 'https://amoy.polygonscan.com'
      : 'https://polygonscan.com';
    
    return NextResponse.json({
      success: true,
      vaultAddress,
      splitterAddress,
      recipientWallet: freelancerAddress,
      factoryAddress: FACTORY_ADDRESS,
      salt,
      network: isTestMode ? 'testnet' : 'mainnet',
      message: 'Vault address computed successfully',
      explorerUrl: `${explorerBase}/address/${vaultAddress}`
    });
    
  } catch (error: any) {
    console.error('=== PREPARE FUNDING ERROR ===');
    console.error('Error:', error.message);
    console.error('Reason:', error.reason);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to prepare funding',
      details: error.reason || error.code || 'Unknown error',
      hint: 'Check server logs for full error details'
    }, { status: 500 });
  }
}