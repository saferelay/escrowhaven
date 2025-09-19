// src/app/api/escrow/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId, txHash, released } = await request.json();
    
    const { error } = await supabase
      .from('escrows')
      .update({
        status: released ? 'RELEASED' : 'FUNDED',
        release_tx_hash: txHash,
        client_approved: true
      })
      .eq('id', escrowId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}