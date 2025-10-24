// src/app/api/escrow/gasless-action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// Helper function to check and fund wallet with MATIC if needed
// (Used for post-action funding - after release/refund/settlement)
// ============================================================
async function fundWalletIfNeeded(
  provider: ethers.providers.Provider,
  signer: ethers.Wallet,
  recipientAddress: string,
  reason: string
) {
  try {
    const balance = await provider.getBalance(recipientAddress);
    const balanceMatic = parseFloat(ethers.utils.formatEther(balance));
    
    console.log(`${reason} wallet balance: ${balanceMatic} MATIC`);
    
    // Only fund if they have less than 0.005 MATIC (~5 withdrawals worth)
    if (balanceMatic < 0.005) {
      const fundAmount = ethers.utils.parseEther('0.001');
      console.log(`Funding ${recipientAddress} with 0.001 MATIC for ${reason.toLowerCase()}...`);
      
      let gasPrice;
      try {
        gasPrice = await provider.getGasPrice();
        gasPrice = gasPrice.mul(120).div(100); // 20% buffer
        console.log(`Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
      } catch (error) {
        gasPrice = ethers.utils.parseUnits('50', 'gwei');
      }
      
      const maticTx = await signer.sendTransaction({
        to: recipientAddress,
        value: fundAmount,
        gasLimit: 21000,
        gasPrice: gasPrice
      });
      
      await maticTx.wait();
      console.log(`MATIC funded successfully: ${maticTx.hash}`);
      return maticTx.hash;
    } else {
      console.log(`Wallet already has sufficient MATIC (${balanceMatic}), skipping funding`);
      return null;
    }
  } catch (error: any) {
    console.error(`MATIC funding failed (non-critical): ${error.message}`);
    return null;
  }
}

// ============================================================
// OPTION 1: Just-in-Time Gas Funding
// This ensures user has enough MATIC BEFORE any action
// ============================================================
async function ensureUserHasGas(
  provider: ethers.providers.Provider,
  backendSigner: ethers.Wallet,
  userAddress: string,
  action: string
): Promise<void> {
  console.log(`[Gas Check] ========================================`);
  console.log(`[Gas Check] Checking gas for user: ${userAddress}`);
  console.log(`[Gas Check] Action: ${action}`);
  
  // Check user's current MATIC balance
  const userBalance = await provider.getBalance(userAddress);
  const balanceFormatted = ethers.utils.formatEther(userBalance);
  
  console.log(`[Gas Check] Current balance: ${balanceFormatted} MATIC`);
  
  // Threshold: Need at least 0.02 MATIC (~20 USDC approvals)
  const MIN_THRESHOLD = ethers.utils.parseEther('0.02');
  
  if (userBalance.lt(MIN_THRESHOLD)) {
    console.log(`[Gas Check] 🎁 Balance too low - funding user...`);
    
    // Get current gas price with buffer
    let gasPrice;
    try {
      gasPrice = await provider.getGasPrice();
      gasPrice = gasPrice.mul(120).div(100); // 20% buffer
      console.log(`[Gas Check] Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
    } catch (error) {
      console.warn('[Gas Check] Could not fetch gas price, using 50 gwei default');
      gasPrice = ethers.utils.parseUnits('50', 'gwei');
    }
    
    // Fund generously: 0.1 MATIC covers ~100 approvals
    const fundAmount = ethers.utils.parseEther('0.1');
    console.log(`[Gas Check] Funding amount: 0.1 MATIC (~$0.05)`);
    
    try {
      const fundTx = await backendSigner.sendTransaction({
        to: userAddress,
        value: fundAmount,
        gasLimit: 21000,
        gasPrice: gasPrice
      });
      
      console.log(`[Gas Check] Funding TX sent: ${fundTx.hash}`);
      console.log(`[Gas Check] Waiting for confirmation...`);
      
      await fundTx.wait();
      
      console.log(`[Gas Check] ✅ Funding confirmed!`);
      
      // Wait for balance to propagate across nodes
      console.log(`[Gas Check] Waiting 3s for balance propagation...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify new balance
      const newBalance = await provider.getBalance(userAddress);
      const newBalanceFormatted = ethers.utils.formatEther(newBalance);
      console.log(`[Gas Check] ✅ New balance: ${newBalanceFormatted} MATIC`);
      console.log(`[Gas Check] User ready for ${action}!`);
      
    } catch (error: any) {
      console.error(`[Gas Check] ❌ Funding failed:`, error.message);
      throw new Error(`Failed to fund user with gas: ${error.message}`);
    }
    
  } else {
    console.log(`[Gas Check] ✅ User has sufficient gas (${balanceFormatted} MATIC)`);
  }
  
  console.log(`[Gas Check] ========================================`);
}

export async function POST(request: NextRequest) {
  try {
    const { 
      escrowId, 
      action, 
      signature, 
      nonce, 
      signerAddress,
      clientAmount,
      freelancerAmount,
      // For funding action
      amount,
      vaultAddress
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
    // ⭐ HARDCODED for now - replace with your actual private key
    const privateKey = (isProduction 
      ? process.env.DEPLOYMENT_PRIVATE_KEY_MAINNET || 'YOUR_MAINNET_PRIVATE_KEY_HERE'
      : process.env.PRIVATE_KEY)!.replace(/['"]/g, '');
    
    if (!privateKey || privateKey === 'YOUR_MAINNET_PRIVATE_KEY_HERE') {
      throw new Error(`Missing private key for ${isProduction ? 'mainnet' : 'testnet'} operations`);
    }
    
    const backendSigner = new ethers.Wallet(privateKey, provider);
    console.log('Using backend signer:', backendSigner.address);
    console.log('Network:', isProduction ? 'Polygon Mainnet' : 'Polygon Amoy Testnet');
    
    // Check signer balance
    const signerBalance = await provider.getBalance(backendSigner.address);
    const signerBalanceEth = ethers.utils.formatEther(signerBalance);
    console.log('Backend wallet MATIC balance:', signerBalanceEth);
    
    if (signerBalance.lt(ethers.utils.parseEther('0.05'))) {
      console.warn(`⚠️ Low MATIC balance in backend wallet: ${signerBalanceEth} MATIC`);
    }
    
    // ============================================================
    // ⭐ OPTION 1: ENSURE USER HAS GAS FOR ANY ACTION
    // This runs BEFORE any action (fund, withdraw, approve, release, etc.)
    // ============================================================
    if (signerAddress) {
      console.log('\n[Gas Check] Starting gas check for user...');
      await ensureUserHasGas(provider, backendSigner, signerAddress, action);
      console.log('[Gas Check] Gas check complete! ✅\n');
    }
    
    // ============================================================
    // HANDLE FUNDING ACTION (Gasless USDC Transfer)
    // ============================================================
    if (action === 'fund') {
      console.log('[Gasless Fund] Processing gasless funding');
      console.log('[Gasless Fund] Amount:', amount);
      console.log('[Gasless Fund] From:', signerAddress);
      console.log('[Gasless Fund] To vault:', vaultAddress);
      
      // USDC contract address
      const USDC_ADDRESS = isProduction
        ? '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' // Polygon Mainnet
        : '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582'; // Polygon Amoy
      
      const USDC_ABI = [
        'function transferFrom(address from, address to, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function balanceOf(address owner) view returns (uint256)'
      ];
      
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, backendSigner);
      
      // 1. Verify user has enough USDC
      console.log('[Gasless Fund] Checking user balance...');
      const userBalance = await usdcContract.balanceOf(signerAddress);
      const amountUsdc = ethers.utils.parseUnits(amount.toString(), 6);
      
      console.log('[Gasless Fund] User USDC balance:', ethers.utils.formatUnits(userBalance, 6));
      console.log('[Gasless Fund] Required amount:', amount);
      
      if (userBalance.lt(amountUsdc)) {
        console.error('[Gasless Fund] Insufficient USDC balance');
        return NextResponse.json({ 
          error: 'Insufficient USDC balance',
          balance: ethers.utils.formatUnits(userBalance, 6),
          required: amount
        }, { status: 400 });
      }
      
      // 2. Check if user approved backend to transfer
      console.log('[Gasless Fund] Checking allowance...');
      const allowance = await usdcContract.allowance(signerAddress, backendSigner.address);
      console.log('[Gasless Fund] Current allowance:', ethers.utils.formatUnits(allowance, 6));
      
      if (allowance.lt(amountUsdc)) {
        console.error('[Gasless Fund] Insufficient allowance');
        console.log('[Gasless Fund] User has gas: ✅ (funded earlier if needed)');
        
        return NextResponse.json({ 
          error: 'Insufficient allowance. User must approve USDC transfer first.',
          currentAllowance: ethers.utils.formatUnits(allowance, 6),
          requiredAllowance: amount,
          approvalNeeded: true,
          backendAddress: backendSigner.address,
          userHasGas: true  // ✅ Always true thanks to ensureUserHasGas!
        }, { status: 400 });
      }
      
      // 3. Execute transferFrom (backend pays gas, transfers user's USDC)
      console.log('[Gasless Fund] Executing transferFrom...');
      console.log('[Gasless Fund] This is gasless for user - backend pays gas!');
      
      // Get gas configuration
      let gasPrice;
      try {
        gasPrice = await provider.getGasPrice();
        gasPrice = gasPrice.mul(120).div(100); // 20% buffer
        console.log('[Gasless Fund] Gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
      } catch (error) {
        gasPrice = ethers.utils.parseUnits(isProduction ? '100' : '50', 'gwei');
      }
      
      const gasConfig = {
        gasLimit: 200000,
        gasPrice: gasPrice
      };
      
      const tx = await usdcContract.transferFrom(
        signerAddress,
        vaultAddress,
        amountUsdc,
        gasConfig
      );
      
      console.log('[Gasless Fund] Transaction sent:', tx.hash);
      
      const explorerUrl = isProduction
        ? `https://polygonscan.com/tx/${tx.hash}`
        : `https://amoy.polygonscan.com/tx/${tx.hash}`;
      console.log('[Gasless Fund] Explorer:', explorerUrl);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error('Funding transaction failed on-chain');
      }
      
      console.log('[Gasless Fund] ✅ Transaction confirmed!');
      console.log('[Gasless Fund] Gas used:', receipt.gasUsed.toString());
      console.log('[Gasless Fund] Gas paid by: Backend (user paid $0 gas!)');
      
      // Update database
      console.log('[Gasless Fund] Updating database to FUNDED...');
      
      const { error: updateError } = await supabase
        .from('escrows')
        .update({
          status: 'FUNDED',
          fund_tx_hash: receipt.transactionHash,
          funded_at: new Date().toISOString()
        })
        .eq('id', escrowId);
      
      if (updateError) {
        console.error('[Gasless Fund] Database update failed:', updateError);
      } else {
        console.log('[Gasless Fund] Database updated successfully');
        
        // Send notification emails
        try {
          // To client - escrow funded confirmation
          await sendEmail(emailTemplates.escrowFunded({
            email: escrow.client_email,
            amount: `$${(escrow.amount_cents / 100).toFixed(2)}`,
            escrowId: escrowId,
            role: 'payer'
          }));
          
          // To freelancer - work can begin notification
          await sendEmail(emailTemplates.escrowFunded({
            email: escrow.freelancer_email,
            amount: `$${(escrow.amount_cents / 100).toFixed(2)}`,
            escrowId: escrowId,
            role: 'recipient'
          }));
        } catch (emailError) {
          console.error('[Gasless Fund] Notification emails failed:', emailError);
        }
      }
      
      return NextResponse.json({
        success: true,
        txHash: receipt.transactionHash,
        message: 'Escrow funded successfully',
        escrowId,
        newStatus: 'FUNDED',
        explorer: explorerUrl
      });
    }
    
    // ============================================================
    // HANDLE OTHER ACTIONS (release, refund, etc.)
    // ============================================================
    
    // Verify signature
    if (!signature || !nonce) {
      return NextResponse.json({ error: 'Missing signature or nonce' }, { status: 400 });
    }
    
    // Get escrow contract
    const ESCROW_ABI = [
      'function releaseWithSignature(uint8 v, bytes32 r, bytes32 s, uint256 nonce) external',
      'function refundWithSignature(uint8 v, bytes32 r, bytes32 s, uint256 nonce) external',
      'function proposeSettlementWithSignature(uint256 clientAmount, uint256 freelancerAmount, uint8 v, bytes32 r, bytes32 s, uint256 nonce) external',
      'function acceptSettlementWithSignature(uint8 v, bytes32 r, bytes32 s, uint256 nonce) external'
    ];
    
    const escrowContract = new ethers.Contract(escrow.vault_address, ESCROW_ABI, backendSigner);
    
    // Parse signature
    const sig = ethers.utils.splitSignature(signature);
    
    console.log('Executing action:', action);
    console.log('Signature components:', {
      v: sig.v,
      r: sig.r,
      s: sig.s,
      nonce: nonce
    });
    
    // Get gas configuration
    let gasPrice;
    try {
      gasPrice = await provider.getGasPrice();
      gasPrice = gasPrice.mul(120).div(100); // 20% buffer
    } catch (error) {
      gasPrice = ethers.utils.parseUnits(isProduction ? '100' : '50', 'gwei');
    }
    
    const gasConfig = {
      gasLimit: 500000,
      gasPrice: gasPrice
    };
    
    console.log('Gas config:', {
      gasLimit: gasConfig.gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(gasConfig.gasPrice, 'gwei') + ' gwei'
    });
    
    let tx;
    
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
    
    // ========== FUND WALLETS WITH MATIC FOR FUTURE TRANSACTIONS ==========
    if (action === 'release' && escrow.freelancer_wallet_address) {
      // Freelancer receives full payment, fund them for withdrawal
      await fundWalletIfNeeded(
        provider,
        backendSigner,
        escrow.freelancer_wallet_address,
        'Freelancer withdrawal'
      );
    } else if (action === 'refund' && escrow.client_wallet_address) {
      // Client receives refund, fund them for future transactions
      await fundWalletIfNeeded(
        provider,
        backendSigner,
        escrow.client_wallet_address,
        'Client refund'
      );
    } else if (action === 'accept_settlement') {
      // Both parties receive funds in settlement, fund both
      if (escrow.client_wallet_address) {
        await fundWalletIfNeeded(
          provider,
          backendSigner,
          escrow.client_wallet_address,
          'Client settlement'
        );
      }
      if (escrow.freelancer_wallet_address) {
        await fundWalletIfNeeded(
          provider,
          backendSigner,
          escrow.freelancer_wallet_address,
          'Freelancer settlement'
        );
      }
    }
    // ====================================================================
    
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
      } else {
        console.log('Database updated successfully:', updateResult);
        try {
          if (action === 'release') {
            const escrowLink = `${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}`;
            
            // To recipient
            await sendEmail(emailTemplates.paymentReleased({
              recipientEmail: escrow.freelancer_email,
              senderEmail: escrow.client_email,
              amount: `$${(escrow.amount_cents / 100).toFixed(2)}`,
              netAmount: `$${((escrow.amount_cents * 0.9801) / 100).toFixed(2)}`,
              escrowLink
            }));
            
            // To sender
            await sendEmail(emailTemplates.paymentSent({
              recipientEmail: escrow.freelancer_email,
              senderEmail: escrow.client_email,
              amount: `$${(escrow.amount_cents / 100).toFixed(2)}`,
              escrowLink
            }));
            
          } else if (action === 'refund') {
            const escrowLink = `${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}`;
            
            await sendEmail(emailTemplates.escrowRefunded({
              email: escrow.client_email,
              amount: `$${(escrow.amount_cents / 100).toFixed(2)}`,
              isInitiator: true,
              escrowLink
            }));
          }
        } catch (emailError) {
          console.error('Notification emails failed:', emailError);
        }
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
        if (insertError.message.includes('settlement_proposals')) {
          console.log('settlement_proposals table might not exist');
        }
      }
    }
    
    // Trigger sync
    try {
      console.log('Triggering sync for escrow:', escrowId);
      
      const syncUrl = process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/escrow/sync-blockchain`
        : 'https://escrowhaven.io/api/escrow/sync-blockchain';
      
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