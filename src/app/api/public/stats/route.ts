import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Your mainnet factory address
const MAINNET_FACTORY = '0xb6Ac0936f512e1c79C8514A417d127D034Cb2045';

export async function GET() {
  try {
    // Only get mainnet escrows (ones with the production factory address)
    const { data: stats, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('factory_address', MAINNET_FACTORY);

    if (error) throw error;

    const escrows = stats || [];
    
    const totalEscrows = escrows.length;
    const activeEscrows = escrows.filter(e => 
      ['FUNDED', 'ACCEPTED'].includes(e.status)
    ).length;
    const completedEscrows = escrows.filter(e => 
      ['RELEASED', 'COMPLETED', 'SETTLED'].includes(e.status)
    ).length;
    const refundedEscrows = escrows.filter(e => 
      e.status === 'REFUNDED'
    ).length;

    // Calculate total volume in cents, then convert to dollars
    const totalVolume = escrows.reduce((sum, e) => 
      sum + (e.amount_cents || 0), 0
    );

    // Calculate fees from completed escrows (1.99% fee)
    const totalFeesEarned = escrows.filter(e => 
      ['RELEASED', 'COMPLETED', 'SETTLED'].includes(e.status)
    ).reduce((sum, e) => 
      sum + ((e.amount_cents || 0) * 0.0199), 0
    );

    const averageEscrowSize = totalEscrows > 0 
      ? Math.round(totalVolume / totalEscrows / 100)
      : 0;

    const successRate = totalEscrows > 0
      ? Math.round((completedEscrows / totalEscrows) * 100 * 10) / 10
      : 100; // Show 100% if all completed

    return NextResponse.json({
      totalEscrows,
      totalVolume: Math.round(totalVolume / 100), // Convert cents to dollars
      totalFeesEarned: Math.round(totalFeesEarned / 100),
      averageEscrowSize,
      successRate,
      activeEscrows,
      completedEscrows,
      refundedEscrows
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      totalEscrows: 0,
      totalVolume: 0,
      totalFeesEarned: 0,
      averageEscrowSize: 0,
      successRate: 0,
      activeEscrows: 0,
      completedEscrows: 0,
      refundedEscrows: 0
    });
  }
}