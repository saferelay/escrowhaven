import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { payerEmail, recipientEmail, escrowId, amount } = await request.json();

    await sendEmail({
      to: payerEmail,
      subject: 'Ready to Fund - Wallet Setup Complete',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10B981; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Wallet Ready! 💳</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              ${recipientEmail} has set up their wallet and is ready to receive payment.
            </p>
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
              You can now fund the escrow for <strong>$${amount}</strong>.
            </p>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Fund Escrow Now
              </a>
            </div>
          </div>
        </div>
      `
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending wallet ready notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
