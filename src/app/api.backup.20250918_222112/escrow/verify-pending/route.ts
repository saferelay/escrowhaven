// src/app/api/escrow/verify-pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BlockchainVerifier } from '@/services/blockchain/verification';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all escrows that might need verification
    const { data: escrows } = await supabase
      .from('escrows')
      .select('*')
      .in('status', ['ACCEPTED', 'PENDING_RELEASE'])
      .is('blockchain_verified', false);
    
    const results = [];
    
    for (const escrow of escrows || []) {
      const verifier = new BlockchainVerifier(escrow.network || 'polygon-amoy');
      
      if (escrow.status === 'ACCEPTED') {
        // Check if it's actually funded
        const { isFunded, actualBalance } = await verifier.verifyFunding(escrow.id);
        results.push({
          escrowId: escrow.id,
          status: escrow.status,
          verified: isFunded,
          actualBalance
        });
      }
      
      if (escrow.status === 'PENDING_RELEASE' && escrow.release_tx_hash) {
        // Check if release succeeded
        const { success, error } = await verifier.verifyRelease(escrow.id, escrow.release_tx_hash);
        results.push({
          escrowId: escrow.id,
          status: escrow.status,
          verified: success,
          error
        });
      }
    }
    
    return NextResponse.json({ 
      checked: results.length,
      results 
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}