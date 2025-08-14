// src/app/api/escrow/mock-fund/route.ts
// TEMPORARY: Remove this when real payment integration is ready

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  console.log('Mock fund escrow endpoint called');
  
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

    // Mock funding - update status to FUNDED
    const mockTxHash = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { data: updatedEscrow, error: updateError } = await supabase
      .from('escrows')
      .update({
        status: 'FUNDED',
        tx_hash: mockTxHash,
        funded_at: new Date().toISOString()
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update escrow:', updateError);
      return NextResponse.json(
        { error: 'Failed to fund escrow' },
        { status: 500 }
      );
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
                The funds are now secured and waiting for both parties to approve the release.
              </p>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  View Escrow Details
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Once both you and the payer approve, funds will be automatically released to you.
              </p>
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
        subject: `Escrow Funded Successfully - $${amountUsd}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2563EB; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Payment Secured</h1>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                Your payment of $${amountUsd} has been secured in escrow.
              </p>
              <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #1E40AF; font-size: 14px; margin: 0;">
                  <strong>What happens next?</strong><br>
                  When you're satisfied with the work, approve the release and funds will be sent to ${escrow.freelancer_email}.
                </p>
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

    return NextResponse.json({
      success: true,
      message: 'Escrow funded successfully (mock)',
      escrow: updatedEscrow,
      transactionHash: mockTxHash,
      note: 'This is a mock transaction. In production, this would process a real payment.'
    });

  } catch (error) {
    console.error('Mock fund error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}