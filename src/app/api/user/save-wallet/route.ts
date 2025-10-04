// src/app/api/user/save-wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, wallet, issuer, provider } = await request.json();
    
    console.log('Saving wallet for:', email, wallet);
    
    if (!email || !wallet) {
      return NextResponse.json(
        { error: 'Email and wallet required' },
        { status: 400 }
      );
    }
    
    // USE SERVICE ROLE KEY to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Check if wallet exists
    const { data: existing } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('wallet_address', wallet);
    
    if (existing && existing.length > 0) {
      // Update last used
      await supabase
        .from('user_wallets')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', existing[0].id);
        
      return NextResponse.json({ success: true, wallet: existing[0] });
    }
    
    // Insert new wallet
    const { error: insertError } = await supabase
      .from('user_wallets')
      .insert({
        email: email.toLowerCase(),
        wallet_address: wallet,
        magic_issuer: issuer,
        provider: provider || 'magic',
        is_default: true,
        is_active: true
      });
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Failed to save wallet' },
        { status: 500 }
      );
    }
    
    console.log('Wallet saved successfully');
    return NextResponse.json({ 
      success: true, 
      wallet: { 
        email: email.toLowerCase(), 
        wallet_address: wallet 
      } 
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}