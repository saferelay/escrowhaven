import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { pendingId, walletAddress } = await request.json();
    
    // Get pending escrow
    const { data: pending, error: pendingError } = await supabase
      .from('pending_escrows')
      .select('*')
      .eq('id', pendingId)
      .single();
      
    if (pendingError || !pending) {
      return NextResponse.json(
        { error: 'Pending escrow not found' },
        { status: 404 }
      );
    }
    
    // Check if already confirmed
    if (pending.escrow_id) {
      return NextResponse.json({
        escrowId: pending.escrow_id,
        message: 'Already confirmed'
      });
    }
    
    // Now create the actual escrow with the wallet address
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/escrow/create-saferelay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountUsd: pending.amount_cents / 100,
        clientEmail: pending.client_email,
        freelancerEmail: pending.freelancer_email,
        recipientAddress: walletAddress
      })
    });
    
    const escrowData = await response.json();
    
    if (!response.ok) {
      throw new Error(escrowData.error || 'Failed to create escrow');
    }
    
    // Update pending escrow with actual escrow ID
    await supabase
      .from('pending_escrows')
      .update({
        confirmed_at: new Date().toISOString(),
        escrow_id: escrowData.escrowId
      })
      .eq('id', pendingId);
    
    // Send notification to payer
    try {
      await sendEmail({
        to: pending.client_email,
        subject: 'Payment Request Accepted - Fund Your Escrow',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Payment Request Accepted!</h2>
            <p style="font-size: 16px; color: #374151;">
              <strong>${pending.freelancer_email}</strong> has accepted your payment request 
              for <strong>$${(pending.amount_cents / 100).toFixed(2)}</strong>.
            </p>
            
            <p>The escrow has been created and is ready to be funded.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowData.escrowId}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
              Fund Escrow Now
            </a>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
    }
    
    return NextResponse.json({
      escrowId: escrowData.escrowId,
      message: 'Escrow created successfully'
    });
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm escrow' },
      { status: 500 }
    );
  }
}
