// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { escrowId, paymentMethod } = await request.json();

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Missing escrowId' },
        { status: 400 }
      );
    }

    // Get escrow details
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (error || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Escrow Payment #${escrow.id.slice(0, 8)}`,
              description: `Payment for escrow between ${escrow.client_email} and ${escrow.freelancer_email}`,
            },
            unit_amount: escrow.amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/escrow/${escrowId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/escrow/${escrowId}?payment=cancelled`,
      client_reference_id: escrowId,
      metadata: {
        escrowId,
        paymentMethod,
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}