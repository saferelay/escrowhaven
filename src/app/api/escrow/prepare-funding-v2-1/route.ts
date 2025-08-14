import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/blockchain-provider-fixed';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      console.error('Escrow not found:', error);
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    // Check if already deployed
    if (escrow.vault_address) {
      console.log('Vault already deployed at:', escrow.vault_address);
      return NextResponse.json({
        success: true,
        vaultAddress: escrow.vault_address,
        recipientWallet: escrow.freelancer_wallet_address || escrow.recipient_wallet_address,
        message: 'Vault already deployed'
      });
    }
    
    // Get wallet addresses - ALWAYS use Magic wallets from user_wallets table
    let clientWallet = escrow.client_wallet_address;
    let freelancerWallet = escrow.freelancer_wallet_address || escrow.recipient_wallet_address;
    
    // If wallet addresses are not in escrow, fetch from user_wallets table
    if (!clientWallet) {
      console.log('Fetching client wallet from user_wallets table...');
      const { data: clientWalletData, error: clientError } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', escrow.client_email.toLowerCase())
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (clientError || !clientWalletData?.wallet_address) {
        console.error('No Magic wallet found for client:', escrow.client_email);
        return NextResponse.json({ 
          error: 'Client wallet not found',
          details: `Client (${escrow.client_email}) must connect their Magic wallet before funding the escrow.`,
          requiresWallet: 'client'
        }, { status: 400 });
      }
      
      clientWallet = clientWalletData.wallet_address;
      console.log('Found client Magic wallet:', clientWallet);
    }
    
    if (!freelancerWallet) {
      console.log('Fetching freelancer wallet from user_wallets table...');
      const { data: freelancerWalletData, error: freelancerError } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', escrow.freelancer_email.toLowerCase())
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (freelancerError || !freelancerWalletData?.wallet_address) {
        console.error('No Magic wallet found for freelancer:', escrow.freelancer_email);
        return NextResponse.json({ 
          error: 'Freelancer wallet not found',
          details: `Freelancer (${escrow.freelancer_email}) must connect their Magic wallet before the escrow can be funded.`,
          requiresWallet: 'freelancer'
        }, { status: 400 });
      }
      
      freelancerWallet = freelancerWalletData.wallet_address;
      console.log('Found freelancer Magic wallet:', freelancerWallet);
    }
    
    // Validate wallet addresses
    if (!ethers.utils.isAddress(clientWallet)) {
      return NextResponse.json({ 
        error: 'Invalid client wallet address',
        details: 'The client wallet address is not a valid Ethereum address.'
      }, { status: 400 });
    }
    
    if (!ethers.utils.isAddress(freelancerWallet)) {
      return NextResponse.json({ 
        error: 'Invalid freelancer wallet address',
        details: 'The freelancer wallet address is not a valid Ethereum address.'
      }, { status: 400 });
    }
    
    // Get signer
    const signer = await getSigner();
    const factoryAddress = process.env.SAFERELAY_FACTORY_V2_1_ADDRESS!;
    
    if (!factoryAddress) {
      console.error('Factory address not configured');
      return NextResponse.json({ error: 'Factory not configured' }, { status: 500 });
    }
    
    console.log('Using factory:', factoryAddress);
    const factory = new ethers.Contract(factoryAddress, FACTORY_V2_1_ABI, signer);
    
    // Deploy the escrow
    const amountInUsdc = ethers.utils.parseUnits((escrow.amount_cents / 100).toString(), 6);
    
    console.log('Deploying V2.1 escrow...');
    console.log('Client email:', escrow.client_email);
    console.log('Client wallet (Magic):', clientWallet);
    console.log('Freelancer email:', escrow.freelancer_email);
    console.log('Freelancer wallet (Magic):', freelancerWallet);
    console.log('Amount:', ethers.utils.formatUnits(amountInUsdc, 6), 'USDC');
    
    try {
      // Get current gas price and add buffer
      const gasPrice = await signer.getGasPrice();
      const gasPriceWithBuffer = gasPrice.mul(120).div(100); // 20% buffer
      
      console.log('Current gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
      console.log('Using gas price:', ethers.utils.formatUnits(gasPriceWithBuffer, 'gwei'), 'gwei');
      
      // Estimate gas for the transaction
      const gasEstimate = await factory.estimateGas.createEscrow(
        clientWallet,
        freelancerWallet,
        amountInUsdc
      );
      
      console.log('Gas estimate:', gasEstimate.toString());
      
      const tx = await factory.createEscrow(
        clientWallet,
        freelancerWallet,
        amountInUsdc,
        {
          gasPrice: gasPriceWithBuffer,
          gasLimit: gasEstimate.mul(120).div(100) // 20% buffer on gas limit too
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      console.log('View on PolygonScan: https://amoy.polygonscan.com/tx/' + tx.hash);
      
      // Wait with timeout
      let receipt;
      try {
        receipt = await Promise.race([
          tx.wait(1), // Wait for 1 confirmation
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout')), 45000) // 45 second timeout
          )
        ]) as any;
      } catch (timeoutError) {
        console.log('Transaction is still pending. Returning early...');
        
        // Still update database with pending status and wallet addresses
        await supabase
          .from('escrows')
          .update({
            deployment_tx: tx.hash,
            contract_version: 'v2.1',
            contract_type: 'v2.1-eip712',
            client_wallet_address: clientWallet,
            freelancer_wallet_address: freelancerWallet,
            deployment_status: 'pending'
          })
          .eq('id', escrowId);
        
        return NextResponse.json({
          success: true,
          vaultAddress: null,
          recipientWallet: freelancerWallet,
          txHash: tx.hash,
          message: 'Vault deployment initiated. Transaction pending.',
          pending: true
        });
      }
      
      console.log('Transaction confirmed');
      
      // Get the escrow address from the event
      const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
      if (!event) {
        console.error('No EscrowCreated event found');
        return NextResponse.json({ error: 'Failed to get escrow address' }, { status: 500 });
      }
      
      const escrowAddress = event.args.escrowAddress;
      console.log('V2.1 Escrow deployed at:', escrowAddress);
      
      // Update database with the deployed contract info and Magic wallet addresses
      const { error: updateError } = await supabase
        .from('escrows')
        .update({
          vault_address: escrowAddress,
          deployment_tx: tx.hash,
          deployed_at: new Date().toISOString(),
          contract_version: 'v2.1',
          contract_type: 'v2.1-eip712',
          client_wallet_address: clientWallet,
          freelancer_wallet_address: freelancerWallet,
          deployment_status: 'deployed'
        })
        .eq('id', escrowId);
      
      if (updateError) {
        console.error('Failed to update database:', updateError);
        // Don't fail the request, contract is already deployed
      }
      
      console.log('✅ Escrow deployed successfully with Magic wallets');
      
      return NextResponse.json({
        success: true,
        vaultAddress: escrowAddress,
        recipientWallet: freelancerWallet,
        txHash: tx.hash,
        message: 'V2.1 EIP-712 escrow deployed successfully with Magic wallets'
      });
      
    } catch (deployError: any) {
      console.error('Contract deployment failed:', deployError);
      
      // Check if it's a revert error
      if (deployError.reason) {
        return NextResponse.json({ 
          error: 'Contract error',
          details: deployError.reason 
        }, { status: 400 });
      }
      
      // Check if it's a gas estimation error
      if (deployError.code === 'UNPREDICTABLE_GAS_LIMIT') {
        return NextResponse.json({ 
          error: 'Gas estimation failed',
          details: 'Unable to estimate gas. The transaction may fail.'
        }, { status: 400 });
      }
      
      throw deployError;
    }
    
  } catch (error: any) {
    console.error('Prepare funding error:', error);
    return NextResponse.json({ 
      error: 'Failed to prepare funding',
      details: error.message 
    }, { status: 500 });
  }
}