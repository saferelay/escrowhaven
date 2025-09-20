import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const escrowId = searchParams.get('escrowId');
  const status = searchParams.get('status');
  
  if (status === 'COMPLETED' && escrowId) {
    // Update escrow status
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    await supabase
      .from('escrows')
      .update({
        status: 'FUNDED',
        funded_at: new Date().toISOString(),
      })
      .eq('id', escrowId);
  }
  
  // Redirect back to dashboard
  return NextResponse.redirect(new URL('/dashboard', req.url));
}