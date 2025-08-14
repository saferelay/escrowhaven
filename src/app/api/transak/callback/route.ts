import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Transak callback received:', body);
    
    // Transak sends wallet info in their callback
    const { walletAddress, email, orderId } = body;
    
    if (!walletAddress || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find the pending escrow by recipient email
    const { data: escrows } = await supabase
      .from('pending_escrows')
      .select('*')
      .eq('freelancer_email', email)
      .eq('status', 'INITIATED')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!escrows || escrows.length === 0) {
      return NextResponse.json({ error: 'No pending escrow found' }, { status: 404 });
    }
    
    const escrow = escrows[0];
    
    // Update with wallet and accept
    const { error } = await supabase
      .from('pending_escrows')
      .update({
        recipient_wallet_address: walletAddress,
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
        wallet_source: 'transak_callback'
      })
      .eq('id', escrow.id);
    
    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update escrow' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Transak callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Handle redirect from Transak
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');
  const success = searchParams.get('success');
  
  if (success === 'true') {
    // Redirect back to the escrow page
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.json({ message: 'Transak callback' });
}
