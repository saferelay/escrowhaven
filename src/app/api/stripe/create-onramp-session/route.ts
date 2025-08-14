// src/app/api/stripe/create-onramp-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const { escrowId } = await request.json();

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Missing escrow ID' },
        { status: 400 }
      );
    }

    // Get escrow details
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (escrowError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Verify user is the client (payer)
    if (user.email !== escrow.client_email) {
      return NextResponse.json(
        { error: 'Only the payer can fund the escrow' },
        { status: 403 }
      );
    }

    // Check if already funded
    if (escrow.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Escrow is not in pending status' },
        { status: 400 }
      );
    }

    // For Stripe Crypto, we'll use a redirect approach
    // Generate a unique session ID for tracking
    const sessionId = `saferelay_${escrowId}_${Date.now()}`;
    
    // Store session ID for tracking
    await supabase
      .from('escrows')
      .update({ 
        payment_session_id: sessionId,
        payment_provider: 'stripe_crypto'
      })
      .eq('id', escrowId);

    // Build the onramp URL with parameters
    // Start with the base URL without query parameters
    const baseUrl = process.env.STRIPE_ONRAMP_LINK?.split('?')[0] || 'https://crypto.link.com';
    const onrampUrl = new URL(baseUrl);
    
    // Get the ref parameter from the original URL if it exists
    const originalUrl = new URL(process.env.STRIPE_ONRAMP_LINK || '');
    const ref = originalUrl.searchParams.get('ref');
    if (ref) {
      onrampUrl.searchParams.set('ref', ref);
    }
    
    // Set parameters for USDC on Polygon
    onrampUrl.searchParams.set('destination_currency', 'usdc');
    onrampUrl.searchParams.set('destination_network', 'polygon');
    onrampUrl.searchParams.set('destination_amount', (escrow.amount_cents / 100).toFixed(2));
    onrampUrl.searchParams.set('destination_wallet_address', escrow.vault_address);
    
    // Add reference ID for tracking
    onrampUrl.searchParams.set('reference_id', sessionId);
    
    // Add test mode indicator
    if (config.isTestMode) {
      onrampUrl.searchParams.set('test_mode', 'true');
    }
    
    // Force USDC selection (some additional parameters that might help)
    onrampUrl.searchParams.set('default_crypto_currency', 'usdc');
    onrampUrl.searchParams.set('crypto_currency', 'usdc');
    onrampUrl.searchParams.set('hide_currency_selector', 'true');
    
    // Add return URL
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}?payment_status=complete`;
    onrampUrl.searchParams.set('return_url', returnUrl);
    
    console.log('Onramp Mode:', config.isTestMode ? 'TEST' : 'PRODUCTION');
    console.log('Onramp URL:', onrampUrl.toString());
    console.log('Amount:', (escrow.amount_cents / 100).toFixed(2));
    console.log('Vault address:', escrow.vault_address);

    return NextResponse.json({
      success: true,
      redirectUrl: onrampUrl.toString(),
      sessionId: sessionId,
      message: 'Redirect user to Stripe Crypto onramp'
    });

  } catch (error: any) {
    console.error('Create onramp session error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment session',
        details: error.message 
      },
      { status: 500 }
    );
  }
}