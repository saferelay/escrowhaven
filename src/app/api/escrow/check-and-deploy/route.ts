// src/app/api/escrow/check-and-deploy/route.ts
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
    const { escrowId } = await request.json();
    
    console.log('========================================');
    console.log('CHECK-AND-DEPLOY:', escrowId);
    console.log('========================================');
    
    // Get escrow from database
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (escrowError || !escrow || !escrow.salt) {
      console.error('Escrow not found or missing salt');
      return NextResponse.json({ 
        deployed: false, 
        error: 'No escrow or salt found' 
      });
    }
    
    console.log('Escrow status in DB:', {
      status: escrow.status,
      contract_deployed: escrow.contract_deployed,
      vault_address: escrow.vault_address
    });
    
    // Setup network
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
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
    
    const USDC = isProduction 
      ? "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
      : "0x8B0180f2101c8260d49339abfEe87927412494B4";
    
    // FIXED: Use correct factory address based on environment
    const FACTORY = isProduction 
      ? process.env.ESCROWHAVEN_FACTORY_ADDRESS_MAINNET
      : process.env.ESCROWHAVEN_FACTORY_ADDRESS;
      
    if (!FACTORY) {
      throw new Error(`ESCROWHAVEN_FACTORY_ADDRESS${isProduction ? '_MAINNET' : ''} not configured`);
    }
    
    console.log('Config:', {
      network: isProduction ? 'Mainnet' : 'Testnet',
      factory: FACTORY,
      usdc: USDC
    });
    
    // Get wallet addresses - NO HARDCODED FALLBACKS
    let clientAddress = escrow.client_wallet_address;
    let freelancerAddress = escrow.freelancer_wallet_address;
    
    // If not in escrow record, try user_wallets table
    if (!clientAddress) {
      const { data: clientWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', escrow.client_email)
        .maybeSingle();
      
      clientAddress = clientWallet?.wallet_address;
    }
    
    if (!freelancerAddress) {
      const { data: freelancerWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', escrow.freelancer_email)
        .maybeSingle();
      
      freelancerAddress = freelancerWallet?.wallet_address;
    }
    
    // FAIL if addresses are missing
    if (!clientAddress || !freelancerAddress) {
      console.error('Missing wallet addresses:', {
        client_email: escrow.client_email,
        client_address: clientAddress || 'MISSING',
        freelancer_email: escrow.freelancer_email,
        freelancer_address: freelancerAddress || 'MISSING'
      });
      
      return NextResponse.json({
        deployed: false,
        error: 'Missing wallet addresses. Both client and freelancer must have wallet addresses.'
      }, { status: 400 });
    }
    
    console.log('Using wallet addresses:', {
      client: clientAddress,
      freelancer: freelancerAddress
    });
    
    // Calculate predicted addresses if needed
    let predictedVault = escrow.vault_address;
    let predictedSplitter = escrow.splitter_address;
    
    if (!predictedVault) {
      console.log('Calculating predicted addresses...');
      const factory = new ethers.Contract(
        FACTORY,
        ["function getVaultAddress(bytes32,address,address) view returns (address,address)"],
        provider
      );
      
      [predictedVault, predictedSplitter] = await factory.getVaultAddress(
        escrow.salt,
        clientAddress,
        freelancerAddress
      );
      
      // Save predicted addresses AND wallet addresses
      await supabase
        .from('escrows')
        .update({
          vault_address: predictedVault,
          splitter_address: predictedSplitter,
          client_wallet_address: clientAddress,
          freelancer_wallet_address: freelancerAddress,
          factory_address: FACTORY  // Save which factory was used
        })
        .eq('id', escrowId);
        
      console.log('Predicted addresses:', {
        vault: predictedVault,
        splitter: predictedSplitter
      });
    }
    
    // ===== BLOCKCHAIN TRUTH CHECK =====
    console.log('\n--- BLOCKCHAIN TRUTH CHECK ---');
    
    // 1. Check if contract exists
    const code = await provider.getCode(predictedVault);
    const contractExists = code !== '0x' && code.length > 2;
    
    // 2. Check USDC balance
    const usdcContract = new ethers.Contract(
      USDC,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );
    const balance = await usdcContract.balanceOf(predictedVault);
    const balanceInUsdc = parseFloat(ethers.utils.formatUnits(balance, 6));
    
    console.log('Blockchain state:', {
      contractExists,
      balance: balanceInUsdc,
      codeLength: code.length
    });
    
    // ===== CASE 1: CONTRACT EXISTS =====
    if (contractExists) {
      console.log('✓ Contract exists - updating database to match blockchain');
      
      // Always update DB to match blockchain truth
      const { data: updateData, error: updateError } = await supabase
        .from('escrows')
        .update({
          contract_deployed: true,
          status: balanceInUsdc > 0 ? 'FUNDED' : 'DEPLOYED',
          funded_amount: balanceInUsdc.toString(),
          vault_address: predictedVault,
          splitter_address: predictedSplitter,
          client_wallet_address: clientAddress,
          freelancer_wallet_address: freelancerAddress,
          factory_address: FACTORY,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', escrowId)
        .select();
      
      if (updateError) {
        console.error('Database update failed:', updateError);
      } else {
        console.log('Database updated successfully');
        if (updateData && updateData[0]) {
          console.log('New status:', updateData[0].status);
        }
        try {
          for (const email of [escrow.client_email, escrow.freelancer_email]) {
            await sendEmail(emailTemplates.escrowFunded({
              email,
              amount: `$${balanceInUsdc.toFixed(2)}`,
              escrowId,
              role: email === escrow.client_email ? 'payer' : 'recipient'
            }));
          }
          console.log('Funding notification emails sent');
        } catch (emailError) {
          console.error('Funding emails failed but deployment succeeded:', emailError);
        }
        
      }
      
      return NextResponse.json({ 
        deployed: true,
        vaultAddress: predictedVault,
        splitterAddress: predictedSplitter,
        balance: balanceInUsdc,
        message: 'Contract exists (blockchain verified)'
      });
    }
    
    // ===== CASE 2: NO CONTRACT, NO FUNDS =====
    if (balance.eq(0)) {
      console.log('✗ No contract and no funds - waiting');
      
      // Ensure DB reflects this state
      await supabase
        .from('escrows')
        .update({
          contract_deployed: false,
          funded_amount: '0',
          client_wallet_address: clientAddress,
          freelancer_wallet_address: freelancerAddress,
          factory_address: FACTORY
        })
        .eq('id', escrowId);
      
      return NextResponse.json({ 
        deployed: false, 
        balance: "0",
        predictedVault,
        message: 'Waiting for funds'
      });
    }
    
    // ===== CASE 3: FUNDS BUT NO CONTRACT - DEPLOY! =====
    console.log(`💰 Found ${balanceInUsdc} USDC - DEPLOYING CONTRACT`);
    
    // Get deployment wallet
    const privateKey = (isProduction 
      ? process.env.DEPLOYMENT_PRIVATE_KEY_MAINNET 
      : process.env.PRIVATE_KEY)!.replace(/['"]/g, '');
    
    if (!privateKey) {
      throw new Error(`Missing deployment private key for ${isProduction ? 'mainnet' : 'testnet'}`);
    }
    
    const signer = new ethers.Wallet(privateKey, provider);
    const signerAddress = await signer.getAddress();
    
    // Check gas funds
    const gasBalance = await provider.getBalance(signerAddress);
    const gasBalanceEth = ethers.utils.formatEther(gasBalance);
    
    console.log('Deployment wallet:', signerAddress);
    console.log('Gas balance:', gasBalanceEth, 'MATIC');
    
    if (gasBalance.lt(ethers.utils.parseEther('0.1'))) {
      throw new Error(`Insufficient MATIC in deployment wallet: ${gasBalanceEth}`);
    }
    
    // Deploy the contract
    const factoryWithSigner = new ethers.Contract(
      FACTORY,
      [
        "function deployVault(bytes32,address,address) returns (address,address)",
        "event EscrowCreated(address indexed escrow, address indexed splitter, address indexed client, address freelancer, bytes32 salt)"
      ],
      signer
    );
    
    console.log('Calling deployVault with:', {
      salt: escrow.salt,
      client: clientAddress,
      freelancer: freelancerAddress
    });
    
    try {
      const gasConfig = isProduction ? {
        gasLimit: 5000000,
        gasPrice: ethers.utils.parseUnits('150', 'gwei'),
      } : {
        gasLimit: 5000000,
        gasPrice: ethers.utils.parseUnits('100', 'gwei'),
      };
      
      const tx = await factoryWithSigner.deployVault(
        escrow.salt,
        clientAddress,
        freelancerAddress,
        gasConfig
      );
      
      console.log('🚀 Deployment tx sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      console.log('✓ Deployment confirmed!');
      console.log('Block:', receipt.blockNumber);
      console.log('Gas used:', receipt.gasUsed.toString());
      
      // Verify deployment actually created contract
      const newCode = await provider.getCode(predictedVault);
      const deploymentSuccess = newCode !== '0x' && newCode.length > 2;
      
      if (!deploymentSuccess) {
        console.error('WARNING: Transaction succeeded but no contract created!');
        console.error('This likely means the factory reverted internally');
        
        // Record the failure
        await supabase
          .from('escrows')
          .update({
            deployment_error: 'Transaction succeeded but no contract created - factory may have reverted',
            deployment_attempted_at: new Date().toISOString()
          })
          .eq('id', escrowId);
        
        return NextResponse.json({
          deployed: false,
          error: 'Deployment transaction succeeded but no contract was created',
          tx: receipt.transactionHash,
          details: 'The factory may have reverted due to incorrect parameters or address mismatch'
        }, { status: 500 });
      }
      
      // SUCCESS - Update database
      console.log('✓ Contract verified at:', predictedVault);
      
      const { data: finalUpdate, error: finalError } = await supabase
        .from('escrows')
        .update({
          vault_address: predictedVault,
          splitter_address: predictedSplitter,
          deployment_tx: receipt.transactionHash,
          contract_deployed: true,
          status: 'FUNDED',
          funded_at: escrow.funded_at || new Date().toISOString(),
          deployed_at: new Date().toISOString(),
          funded_amount: balanceInUsdc.toString(),
          client_wallet_address: clientAddress,
          freelancer_wallet_address: freelancerAddress,
          factory_address: FACTORY,
          deployment_block_number: receipt.blockNumber,
          last_sync_at: new Date().toISOString(),
          deployment_error: null // Clear any previous errors
        })
        .eq('id', escrowId)
        .select();
      
      if (finalError) {
        console.error('CRITICAL: Database update failed after successful deployment!');
        console.error(finalError);
      } else {
        console.log('✓ Database updated successfully');
        if (finalUpdate && finalUpdate[0]) {
          console.log('Final status:', finalUpdate[0].status);
          console.log('Contract deployed:', finalUpdate[0].contract_deployed);
        }

        console.log('Scheduling contract verification...');
        setTimeout(async () => {
          try {
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/contracts/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                vaultAddress: predictedVault,
                clientWallet: clientAddress,
                freelancerWallet: freelancerAddress,
                splitterAddress: predictedSplitter,
                escrowId: escrowId
              })
            });
            
            if (verifyResponse.ok) {
              console.log('✅ Contract verification scheduled');
            }
          } catch (verifyError) {
            console.error('Failed to schedule verification:', verifyError);
            // Not critical - batch job will catch it later
          }
        }, 30000); // 30 second delay for Polygonscan to index
      }
      
      const explorerUrl = isProduction
        ? `https://polygonscan.com/tx/${receipt.transactionHash}`
        : `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`;
      
      return NextResponse.json({ 
        deployed: true,
        vaultAddress: predictedVault,
        splitterAddress: predictedSplitter,
        balance: balanceInUsdc,
        tx: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        explorer: explorerUrl
      });
      
    } catch (deployError: any) {
      console.error('Deployment failed:', deployError);
      
      // Record the error
      await supabase
        .from('escrows')
        .update({
          deployment_error: deployError.message || deployError.reason || 'Unknown deployment error',
          deployment_attempted_at: new Date().toISOString()
        })
        .eq('id', escrowId);
      
      throw deployError;
    }
    
  } catch (error: any) {
    console.error('Check-and-deploy error:', error);
    return NextResponse.json({ 
      error: error.message,
      reason: error.reason,
      code: error.code
    }, { status: 500 });
  }
}