// src/app/api/escrow/create-invitation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate unique premium link
function generatePremiumLink(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `secure-transaction-${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      clientEmail, 
      freelancerEmail, 
      amountUsd, 
      initiatorEmail,
      initiatorRole,
      description 
    } = body;
    
    // Validation
    if (!amountUsd || !clientEmail || !freelancerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (parseFloat(amountUsd) < 1 || parseFloat(amountUsd) > 50000) {
      return NextResponse.json({ error: 'Amount must be between $1 and $50,000' }, { status: 400 });
    }
    
    // Determine network
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
    
    // Generate premium link
    const premiumLink = generatePremiumLink();
    console.log('Generated premium link:', premiumLink);
    
    // Create database entry with premium link
    const { data: escrow, error } = await supabase
      .from('escrows')
      .insert({
        amount_cents: Math.round(parseFloat(amountUsd) * 100),
        status: 'INITIATED',
        client_email: clientEmail,
        freelancer_email: freelancerEmail,
        description: description || null,
        initiator_email: initiatorEmail || null,
        initiator_role: initiatorRole || null,
        network: isProduction ? 'polygon-mainnet' : 'polygon-amoy',
        is_test_mode: !isProduction,
        premium_link: premiumLink
      })
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to create escrow',
        details: error.message 
      }, { status: 500 });
    }
    
    console.log('Escrow invitation created:', {
      id: escrow.id,
      premiumLink: escrow.premium_link,
      client: clientEmail,
      freelancer: freelancerEmail,
      amount: amountUsd,
      initiator: initiatorEmail
    });

    // Send invitation email with premium link
    const recipientEmail = initiatorRole === 'payer' ? freelancerEmail : clientEmail;
    const senderEmail = initiatorRole === 'payer' ? clientEmail : freelancerEmail;

    await sendEmail(emailTemplates.escrowInvitation({
      recipientEmail,
      senderEmail,
      amount: `$${amountUsd}`,
      description,
      escrowLink: `${process.env.NEXT_PUBLIC_APP_URL}/${escrow.premium_link}`,
      role: initiatorRole === 'payer' ? 'recipient' : 'payer'
    }));
    
    return NextResponse.json({
      escrowId: escrow.id,
      premiumLink: escrow.premium_link,
      status: 'INITIATED',
      message: 'Escrow invitation created. Awaiting acceptance.'
    });
    
  } catch (error: any) {
    console.error('Create escrow error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create escrow',
      details: error.reason || undefined
    }, { status: 500 });
  }
}