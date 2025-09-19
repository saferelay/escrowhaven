// src/app/api/cron/sync-escrows/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
  
  if (authHeader !== expectedAuth) {
    if (isLocalhost) {
      return NextResponse.json({
        error: 'Unauthorized',
        debug: {
          receivedLength: authHeader?.length || 0,
          expectedLength: expectedAuth.length,
          tip: 'Check for extra spaces or quotes in your curl command'
        }
      }, { status: 401 });
    }
    return new Response('Unauthorized', { status: 401 });
  }

  const startTime = Date.now();
  const syncResults = [];
  const errors = [];

  try {
    // 1. Check for funds at predicted addresses (CREATE2 flow)
    const { data: awaitingDeployment } = await supabase
      .from('escrows')
      .select('*')
      .eq('status', 'ACCEPTED')
      .eq('network', 'polygon-mainnet')
      .not('salt', 'is', null)
      .not('vault_address', 'is', null)
      .eq('contract_deployed', false)
      .limit(10);

    console.log(`💵 Checking ${awaitingDeployment?.length || 0} escrows for funds at predicted addresses...`);

    for (const escrow of awaitingDeployment || []) {
      try {
        const deployUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/escrow/check-and-deploy`;
        
        const response = await fetch(deployUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escrowId: escrow.id })
        });
        
        const data = await response.json();
        if (data.deployed) {
          console.log(`🚀 Deployed vault for ${escrow.id} with ${data.balance} USDC`);
          syncResults.push({ 
            id: escrow.id,
            type: 'create2_deployed',
            vaultAddress: data.vaultAddress,
            balance: data.balance
          });
        } else if (data.balance === "0") {
          console.log(`⏳ No funds yet at predicted address for ${escrow.id}`);
        }
      } catch (e: any) {
        errors.push({ escrowId: escrow.id, type: 'deployment_check', error: e.message });
      }
    }

    // 2. Verify already deployed escrows are synced
    const { data: deployedEscrows, error: deployedError } = await supabase
      .from('escrows')
      .select('id, vault_address, status')
      .eq('contract_deployed', true)
      .in('status', ['FUNDED'])
      .limit(10);

    if (deployedError) {
      errors.push({ type: 'fetch_deployed', error: deployedError.message });
    }

    console.log(`📦 Found ${deployedEscrows?.length || 0} deployed escrows to verify`);

    for (const escrow of deployedEscrows || []) {
      try {
        const syncUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/escrow/sync-blockchain`;
        
        const response = await fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escrowId: escrow.id })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        syncResults.push({ 
          id: escrow.id,
          status: escrow.status,
          success: true,
          balance: data.balance,
          synced: data.synced
        });
        
        console.log(`✅ Synced ${escrow.id}: balance=${data.balance}`);
        
      } catch (e: any) {
        errors.push({ escrowId: escrow.id, error: e.message });
        console.error(`❌ Failed to sync ${escrow.id}:`, e.message);
      }
    }

    // 3. Sync recently released escrows
    const { data: releasedEscrows } = await supabase
      .from('escrows')
      .select('id, release_tx_hash')
      .eq('status', 'RELEASED')
      .is('actual_freelancer_received_cents', null)
      .not('release_tx_hash', 'is', null)
      .limit(5);

    console.log(`💰 Found ${releasedEscrows?.length || 0} released escrows to sync amounts`);

    for (const escrow of releasedEscrows || []) {
      try {
        const syncUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/escrow/sync-blockchain`;
        
        const response = await fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escrowId: escrow.id })
        });
        
        const data = await response.json();
        if (data.recipientReceived) {
          console.log(`💸 Updated amounts for ${escrow.id}: recipient=${data.recipientReceived}`);
          syncResults.push({ 
            id: escrow.id,
            type: 'released_sync',
            success: true,
            recipientReceived: data.recipientReceived
          });
        }
      } catch (e: any) {
        console.warn(`⚠️ Could not sync released escrow ${escrow.id}:`, e.message);
      }
    }

    const executionTime = Date.now() - startTime;

    const summary = {
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      processed: {
        total: syncResults.length,
        successful: syncResults.filter(r => r.success !== false).length,
        failed: syncResults.filter(r => r.success === false).length
      },
      deployed: syncResults.filter(r => r.type === 'create2_deployed').length,
      synced: syncResults.filter(r => r.synced).length,
      errors: errors.length > 0 ? errors : undefined,
      results: isLocalhost ? syncResults : undefined
    };

    console.log(`🏁 Cron completed in ${executionTime}ms:`, {
      processed: summary.processed.total,
      deployed: summary.deployed,
      errors: errors.length
    });

    return NextResponse.json(summary);
    
  } catch (error: any) {
    console.error('💥 Cron sync critical error:', error);
    
    return NextResponse.json({ 
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: isLocalhost ? error.stack : undefined
    }, { status: 500 });
  }
}

// Manual trigger endpoint
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { escrowId, forceSync } = await request.json();
    
    if (escrowId) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/escrow/sync-blockchain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId, forceSync })
      });
      
      const data = await response.json();
      return NextResponse.json({ escrowId, ...data });
    }
    
    return GET(request);
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}