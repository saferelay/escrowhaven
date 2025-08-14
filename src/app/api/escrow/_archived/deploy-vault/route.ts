import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { config } from '@/lib/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Factory ABI
const FACTORY_ABI = [
  "function createEscrow(string clientEmail, string freelancerEmail, uint256 amount) returns (address escrow, address splitter)",
  "event EscrowCreated(address indexed escrow, address indexed splitter, string clientEmail, string freelancerEmail, uint256 amount)"
];

export async function POST(request: NextRequest) {
  console.log('=== Deploy Vault API Called ===');
  console.log('Time:', new Date().toISOString());
  
  try {
    const { pendingEscrowId, clientEmail, freelancerEmail, amountUsd } = await request.json();
    
    console.log('Deploying vault for pending escrow:', pendingEscrowId);
    console.log('Amount:', amountUsd, 'USD');
    
    // Get the pending escrow
    const { data: pendingEscrow, error: fetchError } = await supabase
      .from('pending_escrows')
      .select('*')
      .eq('id', pendingEscrowId)
      .single();
      
    if (fetchError || !pendingEscrow) {
      console.error('Pending escrow not found:', fetchError);
      return NextResponse.json({ error: 'Pending escrow not found' }, { status: 404 });
    }
    
    if (pendingEscrow.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Escrow must be accepted before funding' }, { status: 400 });
    }
    
    // Initialize provider - use Alchemy which we know works
    console.log('Initializing provider...');
    const rpcUrl = config.isTestMode
      ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
      
    console.log('Using RPC:', rpcUrl);
    
    let provider;
    let blockNumber;
    
    try {
      provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      blockNumber = await provider.getBlockNumber();
      console.log('Connected to network, block:', blockNumber);
    } catch (providerError) {
      console.error('Provider error:', providerError);
      return NextResponse.json({ 
        error: 'Failed to connect to blockchain',
        details: providerError.message 
      }, { status: 500 });
    }
    
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    // Get factory address
    const factoryAddress = config.isTestMode 
      ? process.env.SAFERELAY_FACTORY_ADDRESS 
      : process.env.SAFERELAY_FACTORY_ADDRESS_PROD;
      
    if (!factoryAddress) {
      console.error('No factory address configured');
      return NextResponse.json({ 
        error: 'Factory contract not configured',
        details: 'Missing factory address in environment' 
      }, { status: 500 });
    }
    
    console.log('Using factory:', factoryAddress);
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);
    
    // Deploy the escrow
    try {
      console.log('Calling createEscrow...');
      const amountInUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
      
      // Estimate gas first
      const gasEstimate = await factory.estimateGas.createEscrow(
        clientEmail,
        freelancerEmail,
        amountInUsdc
      );
      console.log('Gas estimate:', gasEstimate.toString());
      
      // Send transaction with higher gas limit
      const tx = await factory.createEscrow(
        clientEmail,
        freelancerEmail,
        amountInUsdc,
        {
          gasLimit: gasEstimate.mul(150).div(100), // 50% buffer
          maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei')
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed');
      
      // Get vault address from events
      const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
      const [vaultAddress, splitterAddress] = event?.args || [];
      
      console.log('Vault deployed:', vaultAddress);
      console.log('Splitter deployed:', splitterAddress);
      
      // Create main escrow record
      const { data: newEscrow, error: insertError } = await supabase
        .from('escrows')
        .insert({
          amount_cents: pendingEscrow.amount_cents,
          client_email: clientEmail,
          freelancer_email: freelancerEmail,
          vault_address: vaultAddress,
          splitter_address: splitterAddress,
          status: 'PENDING',
          network: config.network,
          is_test_mode: config.isTestMode,
          deployment_tx: tx.hash,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Failed to create escrow record:', insertError);
        return NextResponse.json({ error: 'Failed to save escrow' }, { status: 500 });
      }
      
      // Update pending escrow
      await supabase
        .from('pending_escrows')
        .update({ escrow_id: newEscrow.id })
        .eq('id', pendingEscrowId);
      
      return NextResponse.json({
        success: true,
        escrowId: newEscrow.id,
        vaultAddress: vaultAddress,
        splitterAddress: splitterAddress,
        txHash: tx.hash
      });
      
    } catch (contractError) {
      console.error('Contract error:', contractError);
      return NextResponse.json({ 
        error: 'Failed to deploy escrow contract',
        details: contractError.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}