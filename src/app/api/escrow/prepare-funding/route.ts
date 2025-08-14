import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/blockchain-provider-fixed';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Factory V2.1 ABI - Note the different parameters (no email strings)
const FACTORY_V2_1_ABI = [
  "function createEscrow(address clientWallet, address freelancerWallet, uint256 amount) returns (address)",
  "event EscrowCreated(address indexed escrowAddress, address indexed clientWallet, address indexed freelancerWallet, uint256 amount, uint256 timestamp)"
];

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json();
    
    console.log('=== PREPARE FUNDING V2.1 ===');
    console.log('Escrow ID:', escrowId);
    
    // Get escrow details
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (error || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    if (escrow.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Escrow must be accepted first' }, { status: 400 });
    }
    
    if (escrow.vault_address) {
      return NextResponse.json({ 
        vaultAddress: escrow.vault_address,
        message: 'Vault already deployed' 
      });
    }
    
    // Get wallet addresses for both parties
    const { data: clientWallet } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', escrow.client_email.toLowerCase())
      .single();
      
    const { data: freelancerWallet } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', escrow.freelancer_email.toLowerCase())
      .single();
      
    if (!clientWallet?.wallet_address || !freelancerWallet?.wallet_address) {
      console.log('Missing wallets:', { 
        client: clientWallet?.wallet_address, 
        freelancer: freelancerWallet?.wallet_address 
      });
      return NextResponse.json({ 
        error: 'Both parties must have connected wallets',
        details: {
          clientHasWallet: !!clientWallet?.wallet_address,
          freelancerHasWallet: !!freelancerWallet?.wallet_address
        }
      }, { status: 400 });
    }
    
    // Use the fixed provider signer
    console.log('Getting blockchain signer...');
    const signer = getSigner();
    
    // Use V2.1 Factory
    const factoryAddress = process.env.SAFERELAY_FACTORY_V2_1_ADDRESS!;
    console.log('Using Factory V2.1:', factoryAddress);
    
    const factory = new ethers.Contract(factoryAddress, FACTORY_V2_1_ABI, signer);
    
    const amountUsdc = ethers.utils.parseUnits((escrow.amount_cents / 100).toString(), 6);
    
    console.log('Deploying V2.1 escrow contract...');
    console.log('Client wallet:', clientWallet.wallet_address);
    console.log('Freelancer wallet:', freelancerWallet.wallet_address);
    console.log('Amount USDC:', ethers.utils.formatUnits(amountUsdc, 6));
    
    // Add gas settings for Polygon
    const gasPrice = ethers.utils.parseUnits('50', 'gwei');
    
    // V2.1 factory only takes wallet addresses and amount
    const tx = await factory.createEscrow(
      clientWallet.wallet_address,
      freelancerWallet.wallet_address,
      amountUsdc,
      { 
        gasLimit: 3000000,
        gasPrice: gasPrice 
      }
    );
    
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    
    // Get escrow address from event
    const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
    
    if (!event) {
      throw new Error('EscrowCreated event not found');
    }
    
    const escrowAddress = event.args.escrowAddress || event.args[0];
    
    console.log('V2.1 Escrow deployed at:', escrowAddress);
    
    // Update database with vault address and V2.1 version
    const { error: updateError } = await supabase
      .from('escrows')
      .update({ 
        vault_address: escrowAddress,
        client_wallet_address: clientWallet.wallet_address,
        freelancer_wallet_address: freelancerWallet.wallet_address,
        contract_version: 'v2.1',  // Changed to v2.1
        deployment_status: 'deployed',
        deployed_at: new Date().toISOString()
      })
      .eq('id', escrowId);
      
    if (updateError) {
      console.error('Failed to update escrow:', updateError);
    }
    
    // Log the deployment event
    await supabase
      .from('escrow_events')
      .insert({
        escrow_id: escrowId,
        event_type: 'ESCROW_DEPLOYED',
        event_data: {
          vault_address: escrowAddress,
          tx_hash: tx.hash,
          gas_used: receipt.gasUsed.toString(),
          factory_version: 'v2.1'  // Changed to v2.1
        },
        user_email: 'system'
      });
    
    return NextResponse.json({
      vaultAddress: escrowAddress,
      clientWallet: clientWallet.wallet_address,
      freelancerWallet: freelancerWallet.wallet_address,
      transactionHash: tx.hash,
      message: 'V2.1 Escrow contract deployed successfully'
    });
    
  } catch (error: any) {
    console.error('Prepare funding error:', error);
    return NextResponse.json({ 
      error: 'Failed to prepare funding',
      details: error.message 
    }, { status: 500 });
  }
}