// src/app/api/stripe/crypto-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_CRYPTO_WEBHOOK_SECRET!
    );

    console.log('Received Stripe Crypto webhook:', event.type, 'Status:', event.data.object.status);

    if (event.type === 'crypto.onramp_session.updated') {
      const session = event.data.object;
      const metadata = session.metadata;
      
      switch (session.status) {
        case 'transaction_created':
        case 'completed': {
          console.log('Crypto purchase completed:', session.id);
          console.log('USDC sent to vault:', metadata.vault_address);
          console.log('Transaction hash:', session.transaction_hash);
          
          // Call check-and-deploy to deploy the vault if needed
          const deployResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/escrow/check-and-deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ escrowId: metadata.escrow_id })
          });
          
          const deployResult = await deployResponse.json();
          console.log('Deploy result:', deployResult);
          
          // Update escrow status
          await supabase
            .from('escrows')
            .update({
              status: 'FUNDED',
              funded_at: new Date().toISOString(),
              funding_tx_hash: session.transaction_hash,
              funding_provider: 'stripe_crypto',
              funding_session_id: session.id
            })
            .eq('id', metadata.escrow_id);
          
          // Update payment session
          await supabase
            .from('payment_sessions')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('session_id', session.id);
          
          console.log('Escrow funded successfully via Stripe Crypto:', metadata.escrow_id);
          break;
        }

        case 'failed':
        case 'rejected':
        case 'cancelled': {
          if (metadata?.escrow_id) {
            await supabase
              .from('payment_sessions')
              .update({ 
                status: 'failed',
                failed_at: new Date().toISOString()
              })
              .eq('session_id', session.id);
          }
          console.error('Crypto onramp failed:', session.status, session.failure_reason);
          break;
        }

        default:
          console.log('Intermediate status:', session.status);
      }
    }

    return NextResponse.json({ received: true });
    
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
}