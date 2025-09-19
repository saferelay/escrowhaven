import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, initiatorEmail, initiatorRole, amountUsd, description, inviteUrl } = await request.json();

    // For now, just log the email that would be sent
    console.log('Would send email:', {
      to,
      subject: `Escrow Invitation from ${initiatorEmail}`,
      initiatorRole,
      amountUsd,
      description,
      inviteUrl
    });

    // TODO: Implement actual email sending with Resend or another service
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-invite:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
