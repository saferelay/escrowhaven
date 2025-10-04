// src/app/api/public/recent-escrows/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

export async function GET() {
  try {
    const { data: escrows, error } = await supabase
      .from('escrows')
      .select('id, amount_cents, status, created_at, vault_address, network, is_test_mode')
      .in('status', ['FUNDED', 'RELEASED', 'SETTLED', 'REFUNDED', 'COMPLETED']) // Only show active or completed
      .eq('is_test_mode', !isProduction)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const formattedEscrows = (escrows || []).map(escrow => ({
      id: escrow.id.substring(0, 8),
      amount: escrow.amount_cents / 100,
      status: escrow.status,
      created: escrow.created_at,
      network: escrow.network || (escrow.is_test_mode ? 'polygon-amoy' : 'polygon'),
      fullAddress: escrow.vault_address
    }));

    return NextResponse.json(formattedEscrows);
  } catch (error) {
    console.error('Error fetching recent escrows:', error);
    return NextResponse.json([], { status: 200 });
  }
}