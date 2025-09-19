// src/app/api/escrow/check-funding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '@/lib/environment';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)"
];

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json();
    
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (!escrow || !escrow.vault_address) {
      return NextResponse.json({ funded: false, message: 'No vault address' });
    }
    
    // Already funded
    if (escrow.status === 'FUNDED' || escrow.status === 'RELEASED' || escrow.status === 'REFUNDED') {
      return NextResponse.json({ 
        funded: true, 
        status: escrow.status,
        balance: escrow.funded_amount 
      });
    }
    
    const config = getEnvConfig();
    
    // Create provider with fallbacks
    let provider;
    const fallbackRpcs = [
      config.rpcUrl,
      'https://rpc-amoy.polygon.technology',
      'https://polygon-amoy.drpc.org',
      'https://polygon-amoy.blockpi.network/v1/rpc/public'
    ];
    
    for (const rpc of fallbackRpcs) {
      try {
        const testProvider = new ethers.providers.JsonRpcProvider(rpc);
        await testProvider.getBlockNumber();
        provider = testProvider;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!provider) {
      throw new Error('Cannot connect to network');
    }
    
    // Check USDC balance
    const usdcAddress = escrow.usdc_address || config.mockUsdcAddress || config.usdcAddress;
    const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
    
    const balance = await usdcContract.balanceOf(escrow.vault_address);
    const balanceInUsdc = parseFloat(ethers.utils.formatUnits(balance, 6));
    const expectedAmount = escrow.amount_cents / 100;
    
    console.log('Vault balance check:', {
      vault: escrow.vault_address,
      balance: balanceInUsdc,
      expected: expectedAmount,
      usdcAddress: usdcAddress
    });
    
    // If funded (at least 99% to account for rounding)
    if (balanceInUsdc >= expectedAmount * 0.99) {
      
      // DON'T CALCULATE - just mark as funded
      const { error } = await supabase
        .from('escrows')
        .update({
          status: 'FUNDED',
          payment_status: 'completed',
          funded_amount: balanceInUsdc,
          funded_currency: 'USDC',
          funded_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          // REMOVED: platform_fee_cents calculation
          // REMOVED: freelancer_amount_cents calculation
          // These will be set by blockchain sync
          amount_remaining_cents: escrow.amount_cents,
          last_action_by: 'system',
          last_action_at: new Date().toISOString(),
          notes: `Funding detected: ${balanceInUsdc} USDC`
        })
        .eq('id', escrowId);
      
      if (error) {
        console.error('Failed to update escrow status:', error);
        throw error;
      }
      
      // Trigger blockchain sync to get real split amounts
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/escrow/sync-blockchain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escrowId })
        });
      } catch (syncError) {
        console.error('Sync trigger failed:', syncError);
        // Don't fail the funding check if sync fails
      }
      
      console.log('Escrow marked as funded, sync triggered:', escrowId);
      
      return NextResponse.json({ 
        funded: true,
        balance: balanceInUsdc,
        status: 'FUNDED',
        message: 'Funding confirmed! Escrow is now active.'
      });
    }
    
    return NextResponse.json({ 
      funded: false,
      balance: balanceInUsdc,
      expected: expectedAmount,
      message: balanceInUsdc > 0 
        ? `Partial funding detected: ${balanceInUsdc} USDC (need ${expectedAmount} USDC)` 
        : 'No funds detected yet'
    });
    
  } catch (error: any) {
    console.error('Check funding error:', error);
    return NextResponse.json({ 
      funded: false,
      error: error.message || 'Failed to check funding'
    }, { status: 500 });
  }
}