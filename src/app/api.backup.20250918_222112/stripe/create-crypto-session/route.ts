// src/app/api/stripe/create-crypto-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { escrowId, email, amount, salt, clientAddress, freelancerAddress } = body;

    // Get escrow details
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    const isTestMode = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';
    
    // Get the pre-computed vault address (same as Onramp does)
    let vaultAddress = escrow?.vault_address;
    
    if (!vaultAddress) {
      // Calculate vault address using factory
      const provider = new ethers.providers.StaticJsonRpcProvider(
        isTestMode 
          ? 'https://rpc-amoy.polygon.technology' 
          : process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
      );
      
      const factoryAddress = isTestMode 
        ? process.env.ESCROWHAVEN_FACTORY_ADDRESS!
        : process.env.ESCROWHAVEN_FACTORY_ADDRESS_MAINNET!;
      
      const factory = new ethers.Contract(
        factoryAddress,
        ["function getVaultAddress(bytes32,address,address) view returns (address,address)"],
        provider
      );
      
      const [vault, splitter] = await factory.getVaultAddress(salt, clientAddress, freelancerAddress);
      vaultAddress = vault;
      
      // Save the pre-computed addresses
      await supabase
        .from('escrows')
        .update({ 
          vault_address: vault,
          splitter_address: splitter 
        })
        .eq('id', escrowId);
    }

    // Create Stripe session pointing to PRE-COMPUTED VAULT ADDRESS
    const formData = new URLSearchParams();
    formData.append('wallet_addresses[polygon]', vaultAddress); // Send to vault address
    formData.append('destination_currencies[]', 'usdc');
    formData.append('destination_networks[]', 'polygon');
    formData.append('destination_currency', 'usdc');
    formData.append('destination_network', 'polygon');
    formData.append('destination_amount', amount.toString());
    formData.append('source_currency', 'usd');
    formData.append('lock_wallet_address', 'true');
    
    // Add metadata for webhook handling
    formData.append('metadata[escrow_id]', escrowId);
    formData.append('metadata[vault_address]', vaultAddress);
    formData.append('metadata[salt]', salt);

    console.log('Creating Stripe session for vault:', vaultAddress);

    const response = await fetch('https://api.stripe.com/v1/crypto/onramp_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const session = await response.json();
    
    if (!response.ok) {
      throw new Error(session.error?.message || 'Failed to create onramp session');
    }

    // Store session info
    await supabase
      .from('payment_sessions')
      .insert({
        session_id: session.id,
        escrow_id: escrowId,
        provider: 'stripe_crypto',
        amount_cents: Math.round(amount * 100),
        status: 'pending',
        metadata: {
          salt,
          clientAddress,
          freelancerAddress,
          vaultAddress, // This is where funds will go
          client_secret: session.client_secret
        }
      });

    return NextResponse.json({ 
      sessionId: session.id,
      clientSecret: session.client_secret
    });
  } catch (error: any) {
    console.error('Failed to create Stripe session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create crypto onramp session' },
      { status: 500 }
    );
  }
}