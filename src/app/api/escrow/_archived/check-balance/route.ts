import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const escrowId = searchParams.get('escrowId');

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Escrow ID required' },
        { status: 400 }
      );
    }

    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (error || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // For demo mode, just return mock balance
    const balance = escrow.status === 'FUNDED' ? escrow.amount_cents / 100 : 0;

    return NextResponse.json({
      escrowId,
      vaultAddress: escrow.vault_address,
      balance: balance,
      status: escrow.status,
      currency: 'USDC'
    });

  } catch (error) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
