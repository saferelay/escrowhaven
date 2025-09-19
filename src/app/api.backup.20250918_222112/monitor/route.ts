// src/app/api/monitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '@/lib/environment';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ERC20_ABI = ['function balanceOf(address) view returns (uint256)'];

export async function GET(request: NextRequest) {
  try {
    const config = getEnvConfig();
    
    // Get escrows that need monitoring (ACCEPTED with vault addresses)
    const { data: escrows } = await supabase
      .from('escrows')
      .select('id, vault_address, amount_cents, status')
      .eq('status', 'ACCEPTED')
      .not('vault_address', 'is', null)
      .limit(20);
    
    if (!escrows || escrows.length === 0) {
      return NextResponse.json({ checked: 0, updated: 0 });
    }
    
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const usdcAddress = config.mockUsdcAddress || config.usdcAddress;
    const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
    
    let updated = 0;
    
    for (const escrow of escrows) {
      try {
        const balance = await usdc.balanceOf(escrow.vault_address);
        const balanceInUsdc = parseFloat(ethers.utils.formatUnits(balance, 6));
        const expectedAmount = escrow.amount_cents / 100;
        
        if (balanceInUsdc >= expectedAmount * 0.99) {
          // Update to FUNDED
          await supabase
            .from('escrows')
            .update({
              status: 'FUNDED',
              funded_at: new Date().toISOString(),
              funded_amount: balanceInUsdc,
              funded_currency: 'USDC',
              payment_status: 'completed',
              platform_fee_cents: Math.round(escrow.amount_cents * 0.0199),
              freelancer_amount_cents: escrow.amount_cents - Math.round(escrow.amount_cents * 0.0199),
              amount_remaining_cents: escrow.amount_cents
            })
            .eq('id', escrow.id);
          
          updated++;
          console.log(`✅ Escrow ${escrow.id} funded with ${balanceInUsdc} USDC`);
        }
      } catch (error) {
        console.error(`Error checking escrow ${escrow.id}:`, error);
      }
    }
    
    return NextResponse.json({
      checked: escrows.length,
      updated: updated,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Monitor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}