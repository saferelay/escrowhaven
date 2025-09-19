import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = cookies();
    const token = cookieStore.get('supabase-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token.value);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has wallet address in user_metadata
    const walletAddress = user.user_metadata?.transak_wallet_address;
    const kycStatus = user.user_metadata?.transak_kyc_status || 'pending';

    return NextResponse.json({
      walletAddress,
      kycStatus,
      email: user.email
    });
    
  } catch (error) {
    console.error('Error fetching wallet status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet status' },
      { status: 500 }
    );
  }
}
