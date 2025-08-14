import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  console.log('Create atomic escrow endpoint called');
  
  try {
    const body = await request.json();
    const { amountUsd, payerEmail, recipientEmail, description, initiatorRole, recipientWalletAddress } = body;
    
    // Derive initiator email from role
    const initiatorEmail = initiatorRole === 'payer' ? payerEmail : recipientEmail;
    
    // Validate required fields
    if (!amountUsd || !payerEmail || !recipientEmail || !initiatorRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate initiator role
    if (initiatorRole !== 'payer' && initiatorRole !== 'recipient') {
      return NextResponse.json(
        { error: 'Invalid initiator role' },
        { status: 400 }
      );
    }

    // Create pending escrow
    const { data: pendingEscrow, error } = await supabase
      .from('pending_escrows')
      .insert({
        amount_cents: Math.round(amountUsd * 100),
        client_email: payerEmail,
        freelancer_email: recipientEmail,
        initiator_email: initiatorEmail,
        initiator_role: initiatorRole,
        recipient_wallet_address: recipientWalletAddress || null,
        status: 'INITIATED',
        description: description || null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create escrow' },
        { status: 500 }
      );
    }

    // Send email to non-initiator
    const nonInitiatorEmail = initiatorRole === 'payer' ? recipientEmail : payerEmail;
    const emailType = initiatorRole === 'payer' ? 'escrow_invite_recipient' : 'escrow_invite_payer';
    
    try {
      await sendEmail({
        to: nonInitiatorEmail,
        subject: initiatorRole === 'payer' 
          ? `${payerEmail} wants to send you $${amountUsd}`
          : `${recipientEmail} wants to receive $${amountUsd} from you`,
        template: emailType,
        data: {
          escrowId: pendingEscrow.id,
          amount: amountUsd.toFixed(2),
          payerEmail,
          recipientEmail,
          initiatorEmail,
          description: description || 'No description provided',
          expiresAt: pendingEscrow.expires_at,
        },
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue anyway - escrow is created
    }

    // Return success with next action
    return NextResponse.json({
      escrowId: pendingEscrow.id,
      status: 'INITIATED',
      nextAction: initiatorRole === 'payer' 
        ? 'waiting_for_recipient_acceptance'
        : 'waiting_for_payer_acceptance',
      message: `Escrow created! We've sent an invitation to ${nonInitiatorEmail}`,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
