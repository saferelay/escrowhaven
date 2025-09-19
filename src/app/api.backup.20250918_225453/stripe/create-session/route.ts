// src/app/api/stripe/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      escrowId, 
      email, 
      amount, // in USD
      salt,
      clientAddress,
      freelancerAddress 
    } = body;

    // Get escrow details
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      client_reference_id: escrowId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Escrow Payment #${escrowId.slice(0, 8)}`,
              description: `Payment to ${escrow.freelancer_email}`,
              metadata: {
                escrowId,
                type: 'escrow_funding'
              }
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: {
          escrowId,
          salt,
          clientAddress,
          freelancerAddress,
          factoryAddress: process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS!,
          amountUsdc: amount.toString(),
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}?payment=cancelled`,
    });

    // Store session info for tracking
    await supabase
      .from('payment_sessions')
      .insert({
        session_id: session.id,
        escrow_id: escrowId,
        provider: 'stripe',
        amount_cents: Math.round(amount * 100),
        status: 'pending',
        metadata: {
          salt,
          clientAddress,
          freelancerAddress,
        },
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Failed to create Stripe session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment session' },
      { status: 500 }
    );
  }
}