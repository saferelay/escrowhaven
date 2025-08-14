// src/app/api/escrow/test-fund/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Test funding only available in development' },
      { status: 403 }
    );
  }

  try {
    const { escrowId } = await request.json();

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Missing escrowId' },
        { status: 400 }
      );
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Update escrow status to FUNDED
    const { data, error } = await supabase
      .from('escrows')
      .update({ 
        status: 'FUNDED',
        payment_status: 'test_funded',
        funded_at: new Date().toISOString(),
        funding_tx_hash: `test_${Date.now()}`
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update escrow' },
        { status: 500 }
      );
    }

    console.log(`✅ Test funded escrow: ${escrowId}`);

    return NextResponse.json({
      success: true,
      escrow: data,
      message: 'Escrow test funded successfully'
    });

  } catch (error: any) {
    console.error('Test fund error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}