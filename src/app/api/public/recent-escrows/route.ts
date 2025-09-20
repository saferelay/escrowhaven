import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAINNET_FACTORY = '0xb6Ac0936f512e1c79C8514A417d127D034Cb2045';

export async function GET() {
  try {
    // Only get mainnet escrows, ordered by most recent
    const { data: escrows, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('factory_address', MAINNET_FACTORY)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Format for display
    const formatted = (escrows || []).map(e => ({
      id: e.vault_address ? 
        `${e.vault_address.slice(0, 6)}...${e.vault_address.slice(-4)}` : 
        `${e.id.slice(0, 8)}`,
      amount: Math.round((e.amount_cents || 0) / 100),
      status: e.status,
      created: e.created_at,
      fullAddress: e.vault_address,
      txHash: e.release_tx_hash || e.funding_tx_hash || e.deployment_tx,
      parties: {
        client: e.client_email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Partial email privacy
        freelancer: e.freelancer_email?.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      }
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Recent escrows API error:', error);
    return NextResponse.json([]);
  }
}