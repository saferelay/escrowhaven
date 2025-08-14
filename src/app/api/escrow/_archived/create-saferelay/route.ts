import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { config } from '@/lib/config';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// SafeRelay Factory ABI
const FACTORY_ABI = [
  "function createEscrow(string clientEmail, string freelancerEmail, uint256 amount) returns (address escrow, address splitter)",
  "event EscrowCreated(address indexed escrow, address indexed splitter, address clientId, address freelancerId, uint256 amount)"
];

// Create provider outside of the request handler to avoid Next.js fetch issues
let provider: ethers.providers.JsonRpcProvider | null = null;

function getProvider() {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider({
      url: config.rpcUrl,
      skipFetchSetup: true // Skip fetch setup to avoid Next.js issues
    }, {
      chainId: config.chainId,
      name: config.network
    });
  }
  return provider;
}

export async function POST(request: NextRequest) {
  console.log('Create SafeRelay escrow - Mode:', config.isTestMode ? 'TEST' : 'PRODUCTION');
  console.log('Network:', config.network);
  console.log('USDC:', config.usdc.address);
  console.log('Factory:', config.contracts.factory);
  
  try {
    const body = await request.json();
    const { amountUsd, clientEmail, freelancerEmail, recipientAddress } = body;
    
    // Validation
    if (!amountUsd || !clientEmail || !freelancerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // SAFETY CHECK: In production, prevent Mock USDC addresses
    if (!config.isTestMode) {
      const mockUsdcAddress = '0x8B0180f2101c8260d49339abfEe87927412494B4';
      
      // Check if someone is trying to use mock USDC in production
      if (recipientAddress && recipientAddress.toLowerCase() === mockUsdcAddress.toLowerCase()) {
        return NextResponse.json(
          { error: 'Test addresses not allowed in production mode' },
          { status: 400 }
        );
      }
      
      // Additional safety: verify factory address is production
      if (!config.contracts.factory || config.contracts.factory === process.env.SAFERELAY_FACTORY_ADDRESS_MOCK) {
        return NextResponse.json(
          { error: 'Production factory not configured' },
          { status: 500 }
        );
      }
    }
    
    if (amountUsd < 1 || amountUsd > 50000) {
      return NextResponse.json(
        { error: 'Amount must be between $1 and $50,000' },
        { status: 400 }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail) || !emailRegex.test(freelancerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    try {
      const provider = getProvider();
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
      
      // Use factory based on mode
      const factoryAddress = config.contracts.factory;
      if (!factoryAddress) {
        throw new Error(`No factory address for ${config.isTestMode ? 'test' : 'production'} mode`);
      }
      
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);
      
      // Convert amount to USDC (6 decimals)
      const amountUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
      
      console.log('Creating escrow on-chain...');
      console.log('Factory:', factoryAddress);
      console.log('Amount:', amountUsd, 'USD');
      
      // Deploy escrow
      const tx = await factory.createEscrow(
        clientEmail,
        freelancerEmail,
        amountUsdc,
        {
          gasLimit: 3000000,
          gasPrice: ethers.utils.parseUnits('30', 'gwei')
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      console.log('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed');
      
      // Parse events to get escrow and splitter addresses
      const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
      if (!event) {
        throw new Error('EscrowCreated event not found');
      }
      
      const [escrowAddress, splitterAddress] = event.args;
      console.log('Escrow deployed at:', escrowAddress);
      console.log('Splitter deployed at:', splitterAddress);
      
      // Store in database with mode information
      const { data, error } = await supabase
        .from('escrows')
        .insert({
          amount_cents: Math.round(amountUsd * 100),
          vault_address: escrowAddress,
          splitter_address: splitterAddress,
          status: 'PENDING',
          client_email: clientEmail,
          freelancer_email: freelancerEmail,
          recipient_address: recipientAddress || freelancerEmail, // Use email if no address provided
          client_approved: false,
          freelancer_approved: false,
          platform_fee_cents: Math.round(amountUsd * 100 * 0.0199),
          freelancer_amount_cents: Math.round(amountUsd * 100 * 0.9801),
          network: config.network,
          tx_hash: tx.hash,
          contract_type: 'saferelay',
          is_test_mode: config.isTestMode,
          usdc_address: config.usdc.address
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save escrow: ' + error.message);
      }
      
      console.log('Escrow saved to database:', data.id);
      
      return NextResponse.json({
        escrowId: data.id,
        escrowAddress: escrowAddress,
        splitterAddress: splitterAddress,
        status: 'PENDING',
        amountUsd: amountUsd,
        network: config.network,
        networkName: config.networkName,
        isTestMode: config.isTestMode,
        usdcAddress: config.usdc.address,
        transactionHash: tx.hash,
        explorerUrl: `${config.explorerUrl}/tx/${tx.hash}`
      });
      
    } catch (error: any) {
      console.error('Blockchain error:', error);
      
      // In test mode only, allow mock creation if RPC fails
      if (config.isTestMode && (error.message.includes('network') || error.message.includes('timeout'))) {
        console.log('Test mode: Creating mock escrow due to RPC issues');
        
        const timestamp = Date.now();
        const mockEscrow = ethers.utils.getAddress(
          '0x' + ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(`escrow-${clientEmail}-${freelancerEmail}-${timestamp}`)
          ).slice(26)
        );
        
        const mockSplitter = ethers.utils.getAddress(
          '0x' + ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(`splitter-${mockEscrow}`)
          ).slice(26)
        );
        
        const { data, error } = await supabase
          .from('escrows')
          .insert({
            amount_cents: Math.round(amountUsd * 100),
            vault_address: mockEscrow,
            splitter_address: mockSplitter,
            status: 'PENDING',
            client_email: clientEmail,
            freelancer_email: freelancerEmail,
            recipient_address: recipientAddress || freelancerEmail,
            client_approved: false,
            freelancer_approved: false,
            platform_fee_cents: Math.round(amountUsd * 100 * 0.0199),
            freelancer_amount_cents: Math.round(amountUsd * 100 * 0.9801),
            network: config.network,
            tx_hash: '0xmock_' + timestamp,
            contract_type: 'saferelay',
            is_test_mode: true,
            usdc_address: config.usdc.address
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return NextResponse.json({
          escrowId: data.id,
          escrowAddress: mockEscrow,
          splitterAddress: mockSplitter,
          status: 'PENDING',
          amountUsd: amountUsd,
          network: config.network,
          isTestMode: true,
          mockMode: true,
          message: 'Mock escrow created for testing (RPC unavailable)'
        });
      }
      
      throw error;
    }
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create escrow',
        details: config.isTestMode ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}