// src/app/api/escrow/gasless-action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      escrowId, 
      action, 
      signature, 
      nonce, 
      signerAddress,
      clientAmount,
      freelancerAmount 
    } = await request.json();
    
    console.log('Gasless action requested:', { escrowId, action, signerAddress });
    
    // Get escrow details
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
    
    if (fetchError || !escrow) {
      console.error('Escrow fetch error:', fetchError);
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    // Determine network based on environment
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
    
    console.log('Environment:', isProduction ? 'Production' : 'Testnet');
    
    // Setup provider with backend wallet
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
    
    // Get the correct private key based on environment
    const privateKey = (isProduction 
      ? process.env.DEPLOYMENT_PRIVATE_KEY_MAINNET 
      : process.env.PRIVATE_KEY)!.replace(/['"]/g, '');
    
    if (!privateKey) {
      throw new Error(`Missing private key for ${isProduction ? 'mainnet' : 'testnet'} operations`);
    }
    
    const backendSigner = new ethers.Wallet(privateKey, provider);
    console.log('Using backend signer:', await backendSigner.getAddress());
    console.log('Network:', isProduction ? 'Polygon Mainnet' : 'Polygon Amoy Testnet');
    
    // Check signer balance
    const signerBalance = await provider.getBalance(backendSigner.address);
    const signerBalanceEth = ethers.utils.formatEther(signerBalance);
    console.log('Backend wallet MATIC balance:', signerBalanceEth);
    
    if (signerBalance.lt(ethers.utils.parseEther('0.05'))) {
      console.warn(`Low MATIC balance in backend wallet: ${signerBalanceEth} MATIC`);
    }
    
    // Contract ABI
    const ESCROW_ABI = [
      "function releaseWithSignature(uint8 v, bytes32 r, bytes32 s, uint256 nonce) external",
      "function refundWithSignature(uint8 v, bytes32 r, bytes32 s, uint256 nonce) external",
      "function proposeSettlementWithSignature(uint256 clientAmount, uint256 freelancerAmount, uint8 v, bytes32 r, bytes32 s, uint256 nonce) external",
      "function acceptSettlementWithSignature(uint8 v, bytes32 r, bytes32 s, uint256 nonce) external"
    ];
    
    const escrowContract = new ethers.Contract(
      escrow.vault_address,
      ESCROW_ABI,
      backendSigner
    );
    
    // Parse signature
    const sig = ethers.utils.splitSignature(signature);
    
    let tx;
    // Adjusted gas config for mainnet vs testnet
    const gasConfig = isProduction ? {
      gasLimit: 400000,
      gasPrice: ethers.utils.parseUnits('100', 'gwei') // Higher for mainnet
    } : {
      gasLimit: 400000,
      gasPrice: ethers.utils.parseUnits('50', 'gwei')
    };
    
    // Execute appropriate action
    console.log('Executing action:', action);
    console.log('Gas config:', {
      gasLimit: gasConfig.gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(gasConfig.gasPrice, 'gwei') + ' gwei'
    });
    
    switch (action) {
      case 'release':
        tx = await escrowContract.releaseWithSignature(
          sig.v, sig.r, sig.s, nonce, gasConfig
        );
        break;
        
      case 'refund':
        tx = await escrowContract.refundWithSignature(
          sig.v, sig.r, sig.s, nonce, gasConfig
        );
        break;
        
      case 'propose_settlement':
        const clientAmountUsdc = ethers.utils.parseUnits(clientAmount.toString(), 6);
        const freelancerAmountUsdc = ethers.utils.parseUnits(freelancerAmount.toString(), 6);
        
        console.log('Settlement amounts:', {
          client: clientAmount,
          freelancer: freelancerAmount,
          clientWei: clientAmountUsdc.toString(),
          freelancerWei: freelancerAmountUsdc.toString()
        });
        
        tx = await escrowContract.proposeSettlementWithSignature(
          clientAmountUsdc,
          freelancerAmountUsdc,
          sig.v, sig.r, sig.s, nonce,
          gasConfig
        );
        break;
        
      case 'accept_settlement':
        tx = await escrowContract.acceptSettlementWithSignature(
          sig.v, sig.r, sig.s, nonce, gasConfig
        );
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    console.log('Transaction sent:', tx.hash);
    
    // Use correct explorer URL based on network
    const explorerUrl = isProduction
      ? `https://polygonscan.com/tx/${tx.hash}`
      : `https://amoy.polygonscan.com/tx/${tx.hash}`;
    console.log('Explorer:', explorerUrl);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed on-chain');
    }
    
    console.log('Transaction confirmed:', receipt.transactionHash);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Update database based on action
    if (action === 'release' || action === 'refund') {
      console.log('Updating database to:', action === 'release' ? 'RELEASED' : 'REFUNDED');
      
      const updateData: any = {
        status: action === 'release' ? 'RELEASED' : 'REFUNDED',
        release_tx_hash: receipt.transactionHash,
        released_at: new Date().toISOString()
      };
      
      const { data: updateResult, error: updateError } = await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrowId)
        .select();
      
      if (updateError) {
        console.error('Database update failed:', updateError);
        console.error('Update data was:', updateData);
        // Don't fail the whole request since blockchain action succeeded
      } else {
        console.log('Database updated successfully:', updateResult);
      }
      
    } else if (action === 'propose_settlement') {
      console.log('Recording settlement proposal');
      
      const { error: insertError } = await supabase
        .from('settlement_proposals')
        .insert({
          escrow_id: escrowId,
          proposed_by: signerAddress,
          client_refund_cents: Math.round((clientAmount || 0) * 100),
          freelancer_amount_cents: Math.round((freelancerAmount || 0) * 100),
          status: 'PENDING',
          proposal_tx_hash: receipt.transactionHash
        });
      
      if (insertError) {
        console.error('Settlement proposal insert failed:', insertError);
        // Check if table exists
        if (insertError.message.includes('settlement_proposals')) {
          console.log('settlement_proposals table might not exist');
        }
      }
    }
    
    // Trigger sync - use relative URL or localhost for reliability
    try {
      console.log('Triggering sync for escrow:', escrowId);
      
      // Use the actual host or localhost
      const syncUrl = process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/escrow/sync-blockchain`
        : 'http://localhost:3000/api/escrow/sync-blockchain';
      
      const syncResponse = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId })
      });
      
      if (!syncResponse.ok) {
        console.error('Sync response not ok:', syncResponse.status);
      } else {
        console.log('Sync triggered successfully');
      }
      
    } catch (syncError) {
      console.error('Sync failed but continuing:', syncError);
      // Don't fail the request since the main action succeeded
    }
    
    return NextResponse.json({
      success: true,
      txHash: receipt.transactionHash,
      message: `${action} completed successfully`,
      escrowId,
      newStatus: action === 'release' ? 'RELEASED' : action === 'refund' ? 'REFUNDED' : 'PENDING',
      explorer: explorerUrl
    });
    
  } catch (error: any) {
    console.error('Gasless action error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to execute action',
      details: error.reason,
      code: error.code
    }, { status: 500 });
  }
}