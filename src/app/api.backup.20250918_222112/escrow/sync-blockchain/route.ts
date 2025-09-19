// src/app/api/escrow/sync-blockchain/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId, forceSync } = await request.json();
    
    // Get escrow from database
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
    
    if (!escrow) {
      return NextResponse.json({ synced: false, error: 'Escrow not found' });
    }
    
    // Skip if no vault address or network
    if (!escrow.vault_address || !escrow.network) {
      return NextResponse.json({ synced: false, error: 'Missing vault or network' });
    }
    
    // Skip if already synced recently (unless forced)
    if (!forceSync && escrow.blockchain_verified_at) {
      const lastSync = new Date(escrow.blockchain_verified_at).getTime();
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (lastSync > hourAgo) {
        return NextResponse.json({ 
          synced: true, 
          message: 'Recently synced',
          cachedData: {
            freelancerAmount: escrow.freelancer_amount_cents / 100,
            platformFee: escrow.platform_fee_cents / 100
          }
        });
      }
    }
    
    // Determine if production based on network field
    const isProduction = escrow.network === 'polygon-mainnet' || escrow.network === 'mainnet';
    
    // Setup provider
    const provider = new ethers.providers.StaticJsonRpcProvider(
      {
        url: isProduction
          ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        skipFetchSetup: true
      },
      {
        chainId: isProduction ? 137 : 80002,
        name: isProduction ? 'polygon' : 'polygon-amoy'
      }
    );
    
    // Check contract exists
    const code = await provider.getCode(escrow.vault_address);
    if (code === '0x') {
      await supabase
        .from('escrows')
        .update({ contract_deployed: false })
        .eq('id', escrowId);
      
      return NextResponse.json({ synced: true, deployed: false });
    }
    
    // Get USDC balance in vault
    const USDC = isProduction 
      ? "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
      : "0x8B0180f2101c8260d49339abfEe87927412494B4";
    
    const usdcContract = new ethers.Contract(
      USDC,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );
    
    const balance = await usdcContract.balanceOf(escrow.vault_address);
    const balanceInUsdc = parseFloat(ethers.utils.formatUnits(balance, 6));
    
    // Update basic balance
    const updates: any = {
      funded_amount: balanceInUsdc.toString(),
      last_sync_at: new Date().toISOString()
    };
    
    // For RELEASED escrows, get the ACTUAL amounts from the blockchain
    if (escrow.status === 'RELEASED' && escrow.release_tx_hash) {
      console.log(`Syncing released escrow ${escrowId} with blockchain truth...`);
      
      try {
        const receipt = await provider.getTransactionReceipt(escrow.release_tx_hash);
        
        if (receipt && receipt.status === 1) {
          // Parse USDC Transfer events to find actual distributions
          const TRANSFER_EVENT = ethers.utils.id("Transfer(address,address,uint256)");
          
          let totalTransferred = ethers.BigNumber.from(0);
          const transfers: { to: string, amount: ethers.BigNumber }[] = [];
          
          for (const log of receipt.logs) {
            // Look for USDC transfers FROM the vault
            if (log.address.toLowerCase() === USDC.toLowerCase() && 
                log.topics[0] === TRANSFER_EVENT) {
              
              const from = ethers.utils.defaultAbiCoder.decode(['address'], log.topics[1])[0];
              const to = ethers.utils.defaultAbiCoder.decode(['address'], log.topics[2])[0];
              const amount = ethers.utils.defaultAbiCoder.decode(['uint256'], log.data)[0];
              
              // If this transfer is FROM our vault
              if (from.toLowerCase() === escrow.vault_address.toLowerCase()) {
                totalTransferred = totalTransferred.add(amount);
                transfers.push({ to, amount });
                
                console.log(`Found transfer: ${ethers.utils.formatUnits(amount, 6)} USDC to ${to}`);
              }
            }
          }
          
          if (totalTransferred.gt(0)) {
            const totalCents = Math.round(parseFloat(ethers.utils.formatUnits(totalTransferred, 6)) * 100);
            
            // Calculate actual distribution
            // If we have the splitter address, we can be more precise
            // Otherwise, assume standard 5% fee
            let freelancerCents = totalCents;
            let platformCents = 0;
            
            if (escrow.splitter_address) {
              // Check if one of the transfers went to splitter
              const toSplitter = transfers.find(t => 
                t.to.toLowerCase() === escrow.splitter_address.toLowerCase()
              );
              
              if (toSplitter) {
                // Standard distribution: 95% freelancer, 5% platform
                platformCents = Math.round(totalCents * 0.05);
                freelancerCents = totalCents - platformCents;
              }
            } else {
              // No splitter, assume standard fee
              platformCents = Math.round(totalCents * 0.05);
              freelancerCents = totalCents - platformCents;
            }
            
            // Update with blockchain truth
            updates.freelancer_amount_cents = freelancerCents;
            updates.platform_fee_cents = platformCents;
            updates.actual_freelancer_received_cents = freelancerCents;
            updates.blockchain_verified_at = new Date().toISOString();
            
            console.log(`Blockchain truth: Freelancer gets ${freelancerCents} cents, Platform gets ${platformCents} cents`);
          }
        }
      } catch (txError: any) {
        console.error('Error fetching release transaction:', txError.message);
        // Don't fail the whole sync, just log the error
      }
    }
    
    // For REFUNDED escrows, the client gets everything back
    if (escrow.status === 'REFUNDED' && escrow.release_tx_hash) {
      updates.actual_client_refund_cents = escrow.amount_cents;
      updates.blockchain_verified_at = new Date().toISOString();
    }
    
    // Apply updates to database
    const { error: updateError } = await supabase
      .from('escrows')
      .update(updates)
      .eq('id', escrowId);
    
    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ synced: false, error: updateError.message });
    }
    
    // Invalidate metrics cache for affected users
    if (updates.freelancer_amount_cents !== undefined) {
      await supabase
        .from('dashboard_metrics_cache')
        .delete()
        .in('email', [escrow.client_email, escrow.freelancer_email]);
    }
    
    return NextResponse.json({ 
      synced: true,
      balance: balanceInUsdc,
      updates: {
        freelancerAmount: updates.freelancer_amount_cents ? updates.freelancer_amount_cents / 100 : undefined,
        platformFee: updates.platform_fee_cents ? updates.platform_fee_cents / 100 : undefined,
        verified: !!updates.blockchain_verified_at
      }
    });
    
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ synced: false, error: error.message });
  }
}