// src/app/api/test/fund-mock/route.ts
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
    
    // Get escrow details
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    console.log('Testing CREATE2 deployment for escrow:', escrowId);
    console.log('Current status:', escrow.status);
    console.log('Amount required:', escrow.amount_cents / 100, 'USD');
    
    // Setup provider and signer
    const provider = new ethers.providers.StaticJsonRpcProvider(
      { url: 'https://rpc-amoy.polygon.technology/', skipFetchSetup: true },
      80002
    );
    
    const privateKey = process.env.PRIVATE_KEY!.replace(/['"]/g, '');
    const signer = new ethers.Wallet(privateKey, provider);
    
    const MOCK_USDC = "0x8B0180f2101c8260d49339abfEe87927412494B4";
    const FACTORY = "0x29e3d0775B9A7D3D01191b8f57020516bC64ea8E";
    
    // STEP 1: Generate salt and predict address
    const timestamp = Date.now();
    const saltString = `${escrow.client_email}-${escrow.freelancer_email}-${timestamp}-${Math.random()}`;
    const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(saltString));
    console.log('Generated salt:', salt);
    
    const factory = new ethers.Contract(
      FACTORY,
      [
        "function getVaultAddress(bytes32 salt) view returns (address)",
        "function deployVault(bytes32,address,address,uint256) returns (address,address)"
      ],
      signer
    );
    
    const predictedAddress = await factory.getVaultAddress(salt);
    console.log('Predicted vault address:', predictedAddress);
    
    // Save salt and predicted address
    await supabase
      .from('escrows')
      .update({ 
        salt: salt,
        predicted_vault_address: predictedAddress
      })
      .eq('id', escrowId);
    
    // STEP 2: Send USDC to predicted address - USE ACTUAL AMOUNT
    const usdcContract = new ethers.Contract(
      MOCK_USDC,
      [
        "function transfer(address,uint256) returns (bool)",
        "function balanceOf(address) view returns (uint256)"
      ],
      signer
    );
    
    // Convert cents to USDC (6 decimals)
    const amountInUsd = escrow.amount_cents / 100;
    const amountToSend = ethers.utils.parseUnits(amountInUsd.toString(), 6);
    
    console.log(`Sending ${amountInUsd} USDC to predicted address...`);
    const transferTx = await usdcContract.transfer(
      predictedAddress,
      amountToSend,
      { gasPrice: (await provider.getGasPrice()).mul(2) }
    );
    
    console.log('Transfer tx:', transferTx.hash);
    await transferTx.wait();
    
    // Save funding transaction
    await supabase
      .from('escrows')
      .update({
        funding_tx_hash: transferTx.hash,
        funded_amount: amountInUsd
      })
      .eq('id', escrowId);
    
    // STEP 3: Deploy vault
    console.log('Deploying vault...');
    
    const clientAddress = '0x7349D3d258cc1938D560EDA424dB3b11a8BD37CD';
    const freelancerAddress = '0xf7AC04242EA50291eFd30AC8A215364D0E1e23d7';
    
    const deployTx = await factory.deployVault(
      salt,
      clientAddress,
      freelancerAddress,
      amountToSend,
      { 
        gasLimit: 1000000,
        gasPrice: (await provider.getGasPrice()).mul(2)
      }
    );
    
    console.log('Deploy tx:', deployTx.hash);
    const receipt = await deployTx.wait();
    console.log('Deployment confirmed!');
    
    // Parse events to get the actual addresses
    let vaultAddress = predictedAddress;
    let splitterAddress = null;
    
    const ESCROW_CREATED_TOPIC = ethers.utils.id('EscrowCreated(address,address,address,address,uint256,bytes32)');
    const log = receipt.logs.find((log: any) => log.topics[0] === ESCROW_CREATED_TOPIC);
    
    if (log) {
      try {
        const iface = new ethers.utils.Interface([
          'event EscrowCreated(address indexed escrow, address indexed splitter, address indexed client, address freelancer, uint256 amount, bytes32 salt)'
        ]);
        const decoded = iface.parseLog(log);
        vaultAddress = decoded.args.escrow;
        splitterAddress = decoded.args.splitter;
        console.log('Found vault address from event:', vaultAddress);
        console.log('Found splitter address from event:', splitterAddress);
      } catch (e) {
        console.log('Could not decode event, using predicted address');
      }
    }
    
    // Save deployment info
    await supabase
      .from('escrows')
      .update({
        deployment_tx: receipt.transactionHash,
        vault_address: vaultAddress,
        splitter_address: splitterAddress
      })
      .eq('id', escrowId);
    
    // STEP 4: Run sync to verify
    console.log('Running blockchain sync to verify deployment...');
    
    const syncResponse = await fetch(`${request.nextUrl.origin}/api/escrow/sync-blockchain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escrowId })
    });
    
    const syncResult = await syncResponse.json();
    console.log('Sync result:', syncResult);
    
    // Return the results
    return NextResponse.json({ 
      success: true,
      message: `CREATE2 deployment complete with ${amountInUsd} USDC`,
      amountSent: amountInUsd,
      steps: {
        1: 'Generated salt and predicted address',
        2: `Sent ${amountInUsd} USDC to predicted address`,
        3: 'Deployed vault at predicted address',
        4: 'Synced with blockchain for truth'
      },
      addresses: {
        predicted: predictedAddress,
        vault: vaultAddress,
        splitter: splitterAddress
      },
      transactions: {
        funding: `https://amoy.polygonscan.com/tx/${transferTx.hash}`,
        deployment: `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`
      },
      syncResult: syncResult,
      explorer: `https://amoy.polygonscan.com/address/${vaultAddress}`
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      details: error.reason || error.code
    }, { status: 500 });
  }
}