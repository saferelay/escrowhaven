import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { config } from '@/lib/config';
import { generateTransakOneParams } from '@/lib/transak-one';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Factory V2 ABI for Transak One
const FACTORY_V2_ABI = [
  "function createEscrowForUser(address client, address freelancer, uint256 amount, bytes32 salt) returns (address)",
  "function getEscrowAddress(bytes32 salt) view returns (address)"
];

// Provider setup similar to create-saferelay
let provider: ethers.providers.JsonRpcProvider | null = null;

function getProvider() {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  }
  return provider;
}

export async function POST(request: NextRequest) {
  console.log('Create Transak escrow - Mode:', config.isTestMode ? 'TEST' : 'PRODUCTION');
  console.log('Network:', config.network);
  console.log('USDC:', config.usdc.address);
  console.log('Factory V2:', config.contracts.factoryV2);
  
  try {
    const body = await request.json();
    const { amountUsd, clientEmail, freelancerEmail } = body;
    
    // Validation
    if (!amountUsd || !clientEmail || !freelancerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate deterministic addresses for client and freelancer
    const clientAddress = ethers.utils.getAddress(
      '0x' + ethers.utils.keccak256(ethers.utils.toUtf8Bytes(clientEmail)).slice(26)
    );
    
    const freelancerAddress = ethers.utils.getAddress(
      '0x' + ethers.utils.keccak256(ethers.utils.toUtf8Bytes(freelancerEmail)).slice(26)
    );

    // Generate salt for escrow
    const timestamp = Date.now();
    const saltString = `${clientEmail}-${freelancerEmail}-${timestamp}`;
    const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(saltString));

    // Calculate escrow address (if we have factory V2)
    let escrowAddress = ethers.constants.AddressZero;
    if (config.contracts.factoryV2) {
      try {
        const factory = new ethers.Contract(
          config.contracts.factoryV2,
          FACTORY_V2_ABI,
          getProvider()
        );
        escrowAddress = await factory.getEscrowAddress(salt);
      } catch (error) {
        console.error('Error calculating escrow address:', error);
        // Generate a placeholder address for testing
        escrowAddress = ethers.utils.getAddress(
          '0x' + ethers.utils.keccak256(
            ethers.utils.concat([salt, clientAddress, freelancerAddress])
          ).slice(26)
        );
      }
    }

    // Convert amount to cents
    const amountCents = Math.round(amountUsd * 100);

    // Store in database
    const { data, error } = await supabase
      .from('escrows')
      .insert({
        amount_cents: amountCents,
        vault_address: escrowAddress,
        status: 'PENDING_FUNDING',
        client_email: clientEmail,
        freelancer_email: freelancerEmail,
        recipient_address: freelancerAddress,
        salt: salt,
        network: config.network,
        is_test_mode: config.isTestMode,
        usdc_address: config.usdc.address,
        is_transak_one: true,
        transak_order_id: salt,
        platform_fee_cents: Math.round(amountCents * 0.0199),
        freelancer_amount_cents: Math.round(amountCents * 0.9801),
        contract_type: 'SafeRelayV2'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create escrow: ' + error.message);
    }

    // Generate Transak One parameters
    const transakParams = generateTransakOneParams({
      apiKey: config.transak.apiKey!,
      environment: config.transak.environment as 'STAGING' | 'PRODUCTION',
      walletAddress: clientAddress,
      email: clientEmail,
      fiatAmount: amountUsd,
      clientEmail,
      freelancerEmail,
      recipientAddress: freelancerAddress
    });

    console.log('Escrow created:', data.id);
    console.log('Transak params generated for amount:', amountUsd);

    return NextResponse.json({
      escrowId: data.id,
      escrowAddress: escrowAddress,
      transakParams: transakParams,
      network: config.network,
      isTestMode: config.isTestMode,
      message: config.isTestMode 
        ? '🧪 Test Mode: Using Transak staging environment'
        : '✅ Production Mode: Using Transak production'
    });

  } catch (error: any) {
    console.error('Create Transak escrow error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create escrow',
        message: error.message,
        details: config.isTestMode ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
