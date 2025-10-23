// src/app/api/escrow/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Use service role to bypass RLS
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId, userEmail, role, walletAddress } = await request.json();
    
    console.log('=== ACCEPT ESCROW REQUEST ===');
    console.log('Escrow ID:', escrowId);
    console.log('User Email:', userEmail);
    console.log('Role:', role);
    console.log('Wallet Address:', walletAddress);
    
    // Validate inputs
    if (!escrowId || !userEmail || !role || !walletAddress) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: { escrowId, userEmail, role, walletAddress }
      }, { status: 400 });
    }
    
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
    
    // Verify escrow is in INITIATED status
    if (escrow.status !== 'INITIATED') {
      return NextResponse.json({ 
        error: 'Escrow cannot be accepted',
        details: `Current status: ${escrow.status}` 
      }, { status: 400 });
    }
    
    // Verify user is authorized to accept (not the initiator)
    if (userEmail === escrow.initiator_email) {
      return NextResponse.json({ 
        error: 'Initiator cannot accept their own escrow' 
      }, { status: 403 });
    }
    
    // Verify user is either client or freelancer
    if (userEmail !== escrow.client_email && userEmail !== escrow.freelancer_email) {
      return NextResponse.json({ 
        error: 'User not authorized for this escrow' 
      }, { status: 403 });
    }
    
    console.log('Validation passed. Processing acceptance...');
    
    // Get the other party's wallet address
    const otherPartyEmail = role === 'payer' ? escrow.freelancer_email : escrow.client_email;
    const { data: otherWallet } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', otherPartyEmail)
      .maybeSingle();
    
    const otherWalletAddress = otherWallet?.wallet_address;
    console.log('Other party wallet:', otherWalletAddress || 'Not found');
    
    // Generate salt for CREATE2 deployment
    const salt = ethers.utils.id(`${escrowId}-${Date.now()}`);
    console.log('Generated salt:', salt);
    
    // Prepare update data
    const updateData: any = {
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
      salt: salt
    };
    
    // Set wallet addresses based on role
    if (role === 'recipient') {
      updateData.recipient_wallet_address = walletAddress;
      updateData.freelancer_wallet_address = walletAddress;
      if (otherWalletAddress) {
        updateData.client_wallet_address = otherWalletAddress;
      }
    } else if (role === 'payer') {
      updateData.client_wallet_address = walletAddress;
      if (otherWalletAddress) {
        updateData.recipient_wallet_address = otherWalletAddress;
        updateData.freelancer_wallet_address = otherWalletAddress;
      }
    }
    
    // If both wallets are available, pre-compute vault address
    let vaultAddress = null;
    let splitterAddress = null;
    
    if (otherWalletAddress) {
      try {
        const clientWallet = role === 'payer' ? walletAddress : otherWalletAddress;
        const freelancerWallet = role === 'recipient' ? walletAddress : otherWalletAddress;
        
        // Determine network
        const isTestMode = escrow.is_test_mode === true;
        
        // Setup provider
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
        
        // Get factory address
        const FACTORY_ADDRESS = isTestMode 
          ? process.env.ESCROWHAVEN_FACTORY_ADDRESS
          : process.env.ESCROWHAVEN_FACTORY_ADDRESS_MAINNET;
        
        if (!FACTORY_ADDRESS) {
          throw new Error(`Factory address not configured for ${isTestMode ? 'testnet' : 'mainnet'}`);
        }
        
        console.log('Factory address:', FACTORY_ADDRESS);
        
        // Factory ABI
        const FACTORY_ABI = [
          "function getVaultAddress(bytes32,address,address) view returns (address,address)"
        ];
        
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
        
        // Pre-compute vault address
        [vaultAddress, splitterAddress] = await factory.getVaultAddress(
          salt,
          clientWallet,
          freelancerWallet
        );
        
        console.log('Pre-computed vault address:', vaultAddress);
        console.log('Pre-computed splitter address:', splitterAddress);
        
        updateData.vault_address = vaultAddress;
        updateData.splitter_address = splitterAddress;
        updateData.factory_address = FACTORY_ADDRESS;
        updateData.network = isTestMode ? 'polygon-amoy' : 'polygon-mainnet';
        
      } catch (err) {
        console.warn('Vault pre-computation failed (non-critical):', err);
        // Continue without vault address - it will be computed during funding
      }
    }
    
    console.log('Updating escrow with data:', updateData);
    
    // Update the escrow using service role (bypasses RLS)
    const { data: updateResult, error: updateError } = await supabase
      .from('escrows')
      .update(updateData)
      .eq('id', escrowId)
      .select();
    
    if (updateError) {
      console.error('Database update failed:', updateError);
      return NextResponse.json({ 
        error: 'Failed to accept escrow',
        details: updateError.message 
      }, { status: 500 });
    }
    
    if (!updateResult || updateResult.length === 0) {
      console.error('No rows updated');
      return NextResponse.json({ 
        error: 'Failed to update escrow - no rows affected',
        hint: 'Escrow may have been modified by another user'
      }, { status: 500 });
    }
    
    console.log('✅ Escrow accepted successfully');
    
    // Return success response
    return NextResponse.json({
      success: true,
      escrow: updateResult[0],
      message: 'Escrow accepted successfully',
      vaultAddress,
      splitterAddress
    });
    
  } catch (error: any) {
    console.error('=== ACCEPT ESCROW ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to accept escrow',
      details: error.reason || error.code || 'Unknown error'
    }, { status: 500 });
  }
}