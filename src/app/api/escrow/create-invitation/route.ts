// src/app/api/escrow/create-invitation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

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
    
    // Validation
    if (!amountUsd || !clientEmail || !freelancerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (parseFloat(amountUsd) < 1 || parseFloat(amountUsd) > 50000) {
      return NextResponse.json({ error: 'Amount must be between $1 and $50,000' }, { status: 400 });
    }
    
    // Determine network
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
    
    // Get wallet addresses from user_wallets table
    const [clientWalletResult, freelancerWalletResult] = await Promise.all([
      supabase.from('user_wallets').select('wallet_address').eq('email', clientEmail).maybeSingle(),
      supabase.from('user_wallets').select('wallet_address').eq('email', freelancerEmail).maybeSingle()
    ]);
    
    const clientWallet = clientWalletResult?.data?.wallet_address;
    const freelancerWallet = freelancerWalletResult?.data?.wallet_address;
    
    // Don't use fallback addresses - require actual wallets
    if (!clientWallet || !freelancerWallet) {
      return NextResponse.json({ 
        error: 'Both parties must have wallet addresses set up',
        details: {
          clientHasWallet: !!clientWallet,
          freelancerHasWallet: !!freelancerWallet
        }
      }, { status: 400 });
    }
    
    // Provider setup - FIXED for mainnet/testnet
    const provider = new ethers.providers.StaticJsonRpcProvider(
      {
        url: isProduction
          ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        skipFetchSetup: true
      },
      {
        chainId: isProduction ? 137 : 80002,
        name: isProduction ? 'polygon-mainnet' : 'polygon-amoy'
      }
    );
    
    // FIXED: Use correct factory address based on environment
    const FACTORY_ADDRESS = isProduction
      ? process.env.ESCROWHAVEN_FACTORY_ADDRESS_MAINNET
      : process.env.ESCROWHAVEN_FACTORY_ADDRESS;

    if (!FACTORY_ADDRESS) {
      throw new Error(`ESCROWHAVEN_FACTORY_ADDRESS${isProduction ? '_MAINNET' : ''} not configured`);
    }
    
    const FACTORY_ABI = [
      "function getVaultAddress(bytes32,address,address) view returns (address,address)"
    ];
    
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
    
    // Generate unique salt
    const timestamp = Date.now();
    const saltString = `${clientEmail}-${freelancerEmail}-${timestamp}-${Math.random()}`;
    const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(saltString));
    
    // Calculate predicted addresses
    let predictedVault, predictedSplitter;
    try {
      const [vault, splitter] = await factory.getVaultAddress(
        salt,
        clientWallet,
        freelancerWallet
      );
      predictedVault = vault;
      predictedSplitter = splitter;
      
      console.log('Predicted addresses:', {
        vault: predictedVault,
        splitter: predictedSplitter,
        factory: FACTORY_ADDRESS
      });
    } catch (e: any) {
      console.error('Failed to predict addresses:', e);
      return NextResponse.json({ 
        error: 'Failed to calculate vault address',
        details: e.message 
      }, { status: 500 });
    }
    
    // Create database entry
    const { data: escrow, error } = await supabase
      .from('escrows')
      .insert({
        // Core fields
        amount_cents: Math.round(parseFloat(amountUsd) * 100),
        status: 'INITIATED',
        
        // Salt and addresses
        salt: salt,
        vault_address: predictedVault,
        splitter_address: predictedSplitter,
        contract_deployed: false,
        
        // Email fields
        client_email: clientEmail,
        freelancer_email: freelancerEmail,
        
        // Wallet addresses - store them!
        client_wallet_address: clientWallet,
        freelancer_wallet_address: freelancerWallet,
        
        // Factory used
        factory_address: FACTORY_ADDRESS,
        
        // Optional fields
        description: description || null,
        initiator_email: initiatorEmail || null,
        initiator_role: initiatorRole || null,
        
        // Network info
        network: isProduction ? 'polygon-mainnet' : 'polygon-amoy',
        is_test_mode: !isProduction
      })
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to create escrow',
        details: error.message 
      }, { status: 500 });
    }
    
    console.log('Escrow created:', {
      id: escrow.id,
      salt: salt,
      vault: predictedVault,
      splitter: predictedSplitter,
      client: clientEmail,
      freelancer: freelancerEmail,
      amount: amountUsd,
      factory: FACTORY_ADDRESS
    });


    const recipientEmail = initiatorRole === 'payer' ? freelancerEmail : clientEmail;
    const senderEmail = initiatorRole === 'payer' ? clientEmail : freelancerEmail;

    await sendEmail(emailTemplates.escrowInvitation({
      recipientEmail,
      senderEmail,
      amount: `$${amountUsd}`,
      description,
      escrowLink: `${process.env.NEXT_PUBLIC_APP_URL}/${escrow.premium_link || `escrow/${escrow.id}`}`,
      role: initiatorRole === 'payer' ? 'recipient' : 'payer'
    }));
    
    return NextResponse.json({
      escrowId: escrow.id,
      vaultAddress: predictedVault,
      splitterAddress: predictedSplitter,
      status: 'INITIATED',
      message: 'Escrow created successfully. Awaiting acceptance.'
    });
    
  } catch (error: any) {
    console.error('Create escrow error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create escrow',
      details: error.reason || undefined
    }, { status: 500 });
  }
}