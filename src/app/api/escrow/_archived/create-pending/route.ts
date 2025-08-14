import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      payerEmail, 
      recipientEmail, 
      amountUsd, 
      description,
      initiatorEmail,
      initiatorRole 
    } = await request.json();

    // Validation
    if (!payerEmail || !recipientEmail || !amountUsd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (payerEmail === recipientEmail) {
      return NextResponse.json(
        { error: 'Payer and recipient cannot be the same' },
        { status: 400 }
      );
    }

    if (amountUsd <= 0 || amountUsd > 50000) {
      return NextResponse.json(
        { error: 'Amount must be between $0.01 and $50,000' },
        { status: 400 }
      );
    }

    console.log('Creating pending escrow:', {
      payerEmail,
      recipientEmail,
      amountUsd,
      initiatorEmail,
      initiatorRole
    });

    // Create pending escrow record
    const { data, error } = await supabase
      .from('pending_escrows')
      .insert({
        client_email: payerEmail,
        freelancer_email: recipientEmail,
        amount_cents: Math.round(amountUsd * 100),
        description,
        initiator_email: initiatorEmail,
        initiator_role: initiatorRole,
        status: 'INITIATED',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
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

    // Send email to the other party
    const otherPartyEmail = initiatorEmail === payerEmail ? recipientEmail : payerEmail;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: otherPartyEmail,
          initiatorEmail,
          initiatorRole,
          amountUsd,
          description,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/escrow/invite/${data.id}`
        })
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({
      success: true,
      pendingId: data.id,
      message: `Escrow created! An invitation has been sent to ${otherPartyEmail}`
    });

  } catch (error: any) {
    console.error('Error creating pending escrow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create escrow' },
      { status: 500 }
    );
  }
}