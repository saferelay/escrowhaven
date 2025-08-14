// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';
import { config } from '@/lib/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_ONRAMP_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'crypto.onramp_session.updated': {
      const session = event.data.object as any;
      console.log('Onramp session updated:', session.id, session.status);

      if (session.status === 'fulfillment_processing' || session.status === 'fulfillment_complete') {
        // Get escrow from metadata
        const escrowId = session.metadata?.escrow_id;
        
      // Safety check: Ensure webhook is for correct environment
      if (!config.isTestMode && session.metadata?.test_mode === 'true') {
        console.error('Test mode webhook received in production environment');
        break;
      }
      
      if (config.isTestMode && session.metadata?.test_mode !== 'true') {
        console.warn('Production webhook received in test environment');
      }
        
        if (!escrowId) {
          console.error('No escrow_id in session metadata');
          break;
        }

        // Update escrow status
        const { data: escrow, error: updateError } = await supabase
          .from('escrows')
          .update({
            status: 'FUNDED',
            funded_at: new Date().toISOString(),
            tx_hash: session.transaction_hash || `stripe_${session.id}`,
          })
          .eq('id', escrowId)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update escrow:', updateError);
          break;
        }

        // Send notification emails
        const amountUsd = (escrow.amount_cents / 100).toFixed(2);

        // Email to freelancer
        try {
          await sendEmail({
            to: escrow.freelancer_email,
            subject: `Escrow Funded - $${amountUsd} Ready for Release`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #10B981; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Escrow Funded! 💰</h1>
                </div>
                <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                    Good news! ${escrow.client_email} has funded the escrow with $${amountUsd}.
                  </p>
                  <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                    The funds are now secured on the blockchain and waiting for both parties to approve the release.
                  </p>
                  <div style="text-align: center; margin-bottom: 24px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                      View Escrow Details
                    </a>
                  </div>
                  <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 16px;">
                    <p style="color: #1E40AF; font-size: 14px; margin: 0;">
                      <strong>Transaction Details:</strong><br>
                      Network: Base (Ethereum L2)<br>
                      Currency: USDC<br>
                      Smart Contract: ${escrow.vault_address?.slice(0, 8)}...${escrow.vault_address?.slice(-6)}
                    </p>
                  </div>
                </div>
              </div>
            `
          });
        } catch (e) {
          console.error('Failed to send email to freelancer:', e);
        }

        // Email to client (confirmation)
        try {
          await sendEmail({
            to: escrow.client_email,
            subject: `Payment Secured - $${amountUsd}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #2563EB; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Payment Secured</h1>
                </div>
                <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                    Your payment of $${amountUsd} has been successfully secured in escrow.
                  </p>
                  <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                    <div style="font-size: 18px; font-weight: 600; color: #065F46; margin-bottom: 8px;">Payment Confirmed</div>
                    <div style="font-size: 14px; color: #047857;">Funds are locked until both parties approve</div>
                  </div>
                  <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                      View Escrow Status
                    </a>
                  </div>
                </div>
              </div>
            `
          });
        } catch (e) {
          console.error('Failed to send email to client:', e);
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}