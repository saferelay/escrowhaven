// src/app/api/public/stats/route.ts
export async function GET() {
  try {
    const { data: escrows, error } = await supabase
      .from('escrows')
      .select('amount_cents, status')
      .eq('is_test_mode', false)
      .in('status', ['FUNDED', 'RELEASED', 'SETTLED', 'REFUNDED', 'COMPLETED']); // Only escrows that were funded

    if (error) throw error;

    const completedStatuses = ['RELEASED', 'SETTLED', 'COMPLETED', 'REFUNDED'];
    const completedEscrows = escrows?.filter(e => completedStatuses.includes(e.status)) || [];

    const stats = {
      totalEscrows: escrows?.length || 0, // Now only counts funded+ escrows
      totalVolume: completedEscrows.reduce((sum, e) => sum + (e.amount_cents / 100), 0),
      totalFeesEarned: completedEscrows.reduce((sum, e) => sum + (e.amount_cents * 0.0199 / 100), 0),
      averageEscrowSize: completedEscrows.length ? (completedEscrows.reduce((sum, e) => sum + (e.amount_cents / 100), 0) / completedEscrows.length) : 0,
      activeEscrows: escrows?.filter(e => e.status === 'FUNDED').length || 0,
      completedEscrows: completedEscrows.length,
      refundedEscrows: escrows?.filter(e => e.status === 'REFUNDED').length || 0,
      successRate: escrows?.length ? Math.round((completedEscrows.length / escrows.length) * 100) : 0
    };

    return NextResponse.json(stats);
  }
}