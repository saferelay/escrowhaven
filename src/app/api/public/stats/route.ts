// src/app/api/public/stats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Only get escrows that actually had money in them
    const { data: escrows, error } = await supabase
      .from('escrows')
      .select('amount_cents, status')
      .eq('is_test_mode', false)
      .in('status', ['FUNDED', 'RELEASED', 'SETTLED', 'REFUNDED', 'COMPLETED'])
      .not('status', 'in', '("INITIATED","ACCEPTED","CANCELLED","DECLINED")'); // Explicitly exclude unfunded

    if (error) throw error;

    const completedStatuses = ['RELEASED', 'SETTLED', 'COMPLETED', 'REFUNDED'];
    const completedEscrows = escrows?.filter(e => completedStatuses.includes(e.status)) || [];

    const stats = {
      totalEscrows: escrows?.length || 0,
      totalVolume: completedEscrows.reduce((sum, e) => sum + (e.amount_cents / 100), 0),
      totalFeesEarned: completedEscrows.reduce((sum, e) => sum + (e.amount_cents * 0.0199 / 100), 0),
      averageEscrowSize: completedEscrows.length ? (completedEscrows.reduce((sum, e) => sum + (e.amount_cents / 100), 0) / completedEscrows.length) : 0,
      activeEscrows: escrows?.filter(e => e.status === 'FUNDED').length || 0,
      completedEscrows: completedEscrows.length,
      refundedEscrows: escrows?.filter(e => e.status === 'REFUNDED').length || 0,
      successRate: escrows?.length ? Math.round((completedEscrows.length / escrows.length) * 100) : 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      totalEscrows: 0,
      totalVolume: 0,
      totalFeesEarned: 0,
      averageEscrowSize: 0,
      activeEscrows: 0,
      completedEscrows: 0,
      refundedEscrows: 0,
      successRate: 0
    }, { status: 200 });
  }
}