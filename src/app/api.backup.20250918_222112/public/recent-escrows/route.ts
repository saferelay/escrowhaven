// Create: src/app/api/public/recent-escrows/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get recent escrows WITHOUT email addresses
    const { data: escrows, error } = await supabase
      .from('escrows')
      .select('vault_address, amount_cents, status, created_at, network, is_test_mode')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Failed to fetch recent escrows:', error);
      return NextResponse.json([]);
    }
    
    // Format for display - NO EMAILS
    const formatted = escrows.map(escrow => ({
      id: escrow.vault_address ? 
        `${escrow.vault_address.slice(0, 6)}...${escrow.vault_address.slice(-4)}` : 
        '0x...',
      fullAddress: escrow.vault_address,
      amount: escrow.amount_cents / 100,
      status: escrow.status,
      created: escrow.created_at,
      network: escrow.is_test_mode ? 'testnet' : (escrow.network || 'polygon')
    }));
    
    return NextResponse.json(formatted);
    
  } catch (error) {
    console.error('Error fetching recent escrows:', error);
    return NextResponse.json([]);
  }
}