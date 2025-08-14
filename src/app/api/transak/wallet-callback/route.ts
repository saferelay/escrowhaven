import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const escrowId = searchParams.get('escrowId');
    const orderId = searchParams.get('orderId');
    const success = searchParams.get('success');
    
    if (!escrowId) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (success === 'true') {
      // Transaction successful, wallet should be created
      // The webhook should have updated the wallet already
      return NextResponse.redirect(new URL(`/escrow/${escrowId}?wallet_created=true`, request.url));
    } else {
      // Transaction failed or cancelled
      return NextResponse.redirect(new URL(`/escrow/${escrowId}?wallet_failed=true`, request.url));
    }
    
  } catch (error) {
    console.error('Wallet callback error:', error);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}