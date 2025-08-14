// Create: src/app/api/public/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get aggregate stats only - no individual user data
    const { data: escrows, error } = await supabase
      .from('escrows')
      .select('amount_cents, status');
    
    if (error) {
      console.error('Failed to fetch stats:', error);
      return NextResponse.json({
        totalEscrows: 0,
        totalVolume: 0,
        totalFeesEarned: 0,
        averageEscrowSize: 0,
        successRate: 100,
        activeEscrows: 0,
        completedEscrows: 0,
        refundedEscrows: 0
      });
    }
    
    // Calculate aggregate statistics only
    const stats = {
      totalEscrows: escrows.length,
      totalVolume: escrows.reduce((sum, e) => sum + (e.amount_cents / 100), 0),
      totalFeesEarned: escrows
        .filter(e => e.status === 'RELEASED')
        .reduce((sum, e) => sum + (e.amount_cents / 100 * 0.0199), 0),
      averageEscrowSize: escrows.length > 0 
        ? escrows.reduce((sum, e) => sum + (e.amount_cents / 100), 0) / escrows.length 
        : 0,
      successRate: escrows.length > 0 
        ? (escrows.filter(e => e.status === 'RELEASED').length / escrows.length * 100).toFixed(1)
        : 100,
      activeEscrows: escrows.filter(e => e.status === 'FUNDED').length,
      completedEscrows: escrows.filter(e => e.status === 'RELEASED').length,
      refundedEscrows: escrows.filter(e => e.status === 'REFUNDED').length
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json({
      totalEscrows: 0,
      totalVolume: 0,
      totalFeesEarned: 0,
      averageEscrowSize: 0,
      successRate: 100,
      activeEscrows: 0,
      completedEscrows: 0,
      refundedEscrows: 0
    });
  }
}