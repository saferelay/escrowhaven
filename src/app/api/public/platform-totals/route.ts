import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get aggregated lifetime stats
    const { data, error } = await supabase
      .rpc('get_platform_stats');

    if (error) throw error;

    const stats = data?.[0] || {};

    // Also get 24h and 7d volumes
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: recent } = await supabase
      .from('escrows')
      .select('amount_cents, created_at')
      .eq('factory_address', '0xb6Ac0936f512e1c79C8514A417d127D034Cb2045')
      .gte('created_at', oneWeekAgo.toISOString());

    const volume24h = recent?.filter(e => 
      new Date(e.created_at) >= oneDayAgo
    ).reduce((sum, e) => sum + (e.amount_cents || 0), 0) || 0;

    const volume7d = recent?.reduce((sum, e) => 
      sum + (e.amount_cents || 0), 0
    ) || 0;

    return NextResponse.json({
      lifetime: {
        totalEscrows: stats.total_escrows || 0,
        totalVolume: Math.round((stats.total_volume_cents || 0) / 100),
        totalFeesEarned: Math.round((stats.total_fees_cents || 0) / 100),
        averageEscrowSize: Math.round((stats.average_escrow_cents || 0) / 100),
        successRate: parseFloat(stats.success_rate || 100),
        activeEscrows: stats.active_escrows || 0,
        completedEscrows: stats.completed_escrows || 0,
        refundedEscrows: stats.refunded_escrows || 0
      },
      recent: {
        volume24h: Math.round(volume24h / 100),
        volume7d: Math.round(volume7d / 100),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Platform totals error:', error);
    return NextResponse.json({
      lifetime: {
        totalEscrows: 0,
        totalVolume: 0,
        totalFeesEarned: 0,
        averageEscrowSize: 0,
        successRate: 0,
        activeEscrows: 0,
        completedEscrows: 0,
        refundedEscrows: 0
      },
      recent: {
        volume24h: 0,
        volume7d: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  }
}