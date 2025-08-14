import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json();
    
    // Check if vault has been deployed
    const { data: pendingEscrow } = await supabase
      .from('pending_escrows')
      .select('vault_address, deployment_tx')
      .eq('id', escrowId)
      .single();
      
    if (!pendingEscrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      deployed: !!pendingEscrow.vault_address,
      vault_address: pendingEscrow.vault_address,
      deployment_tx: pendingEscrow.deployment_tx
    });
    
  } catch (error: any) {
    console.error('Check deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check deployment' },
      { status: 500 }
    );
  }
}