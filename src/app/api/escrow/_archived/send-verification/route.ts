import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

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

    // Verify user is participant
    const userEmail = user.email;
    const isClient = userEmail === escrow.client_email;
    const isFreelancer = userEmail === escrow.freelancer_email;

    if (!isClient && !isFreelancer) {
      return NextResponse.json(
        { error: 'Not authorized for this escrow' },
        { status: 403 }
      );
    }

    // Check if already approved
    if ((isClient && escrow.client_approved) || (isFreelancer && escrow.freelancer_approved)) {
      return NextResponse.json(
        { error: 'Already approved' },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing codes for this user/escrow
    await supabase
      .from('verification_codes')
      .delete()
      .eq('escrow_id', escrowId)
      .eq('email', userEmail);

    // Store new code
    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert({
        escrow_id: escrowId,
        email: userEmail,
        code: code
      });

    if (codeError) {
      console.error('Failed to store verification code:', codeError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send email with code
    try {
      await sendEmail({
        to: userEmail,
        subject: 'SafeRelay - Verification Code',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2563EB; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Verification Code</h1>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                Your verification code for approving the escrow is:
              </p>
              <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
                  ${code}
                </span>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
              </p>
              <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px;">
                <p style="color: #1e40af; font-size: 14px; margin: 0;">
                  <strong>Escrow Details:</strong><br>
                  Amount: $${(escrow.amount_cents / 100).toFixed(2)}<br>
                  ${isClient ? `Recipient: ${escrow.freelancer_email}` : `Payer: ${escrow.client_email}`}
                </p>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - code is stored
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}