// src/lib/email.ts
import { Resend } from 'resend';

// Initialize Resend only if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  // If no Resend client, just log (for build time)
  if (!resend) {
    console.log('📧 Email service not initialized (no API key)');
    return { id: 'no-email-service' };
  }
  
  // In test mode, redirect all emails to verified address
  const originalTo = options.to;
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' || process.env.NODE_ENV === 'development') {
    options.to = 'hello.saferelay@gmail.com';
    console.log('📧 Test mode: Redirecting email from', originalTo, 'to', options.to);
    
    // Add original recipient info to the email
    options.html = `
      <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
        <strong>TEST MODE:</strong> This email was originally for: ${originalTo}
      </div>
      ${options.html}
    `;
  }

  console.log('�� Sending email to:', options.to);
  console.log('📧 Subject:', options.subject);

  try {
    const { data, error } = await resend.emails.send({
      from: 'escrowhaven <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    console.log('✅ Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export const emailTemplates = {
  magicLink: ({ email, magicLink }: { email: string; magicLink: string }) => ({
    to: email,
    subject: 'Your escrowhaven Magic Link',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563EB; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Sign in to escrowhaven</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Click the button below to sign in to your escrowhaven account. This link will expire in 1 hour.
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${magicLink}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Sign In
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this link, you can safely ignore this email.
          </p>
        </div>
      </div>
    `
  }),

  escrowCreated: ({ recipientEmail, payerEmail, amount, escrowId }: {
    recipientEmail: string;
    payerEmail: string;
    amount: string;
    escrowId: string;
  }) => ({
    to: recipientEmail,
    subject: `You've been paid ${amount} via escrowhaven!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563EB; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">You've been paid!</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Great news! <strong>${payerEmail}</strong> has sent you a payment of <strong style="color: #059669;">${amount}</strong> through escrowhaven.
          </p>
          <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 14px; color: #065F46; margin-bottom: 8px;">Payment Amount</div>
            <div style="font-size: 36px; font-weight: 700; color: #065F46;">${amount}</div>
          </div>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            The funds are securely held in escrow. Once the payer funds the escrow and both parties approve, the payment will be released to you.
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #10B981; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Escrow Details
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Questions? Reply to this email or visit our help center.
          </p>
        </div>
      </div>
    `
  }),

  escrowFunded: ({ email, escrowId, amount }: {
    email: string;
    escrowId: string;
    amount: string;
  }) => ({
    to: email,
    subject: 'Escrow Funded - Ready for Approval',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Escrow Funded Successfully</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            The escrow for ${amount} has been funded and is ready for approval.
          </p>
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Both parties need to approve the release of funds. Once approved, the payment will be automatically sent to the recipient.
          </p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Review & Approve
            </a>
          </div>
        </div>
      </div>
    `
  }),

  paymentReleased: ({ recipientEmail, amount, transactionId }: {
    recipientEmail: string;
    amount: string;
    transactionId: string;
  }) => ({
    to: recipientEmail,
    subject: 'Payment Released! 🎉',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h1 style="color: white; margin: 0; font-size: 24px;">Payment Released!</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
            Great news! Your payment has been released and is on its way to your account.
          </p>
          <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #065F46;">Amount Released:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 700; font-size: 20px; color: #065F46;">${amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #065F46;">Transaction ID:</td>
                <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">
                  ${transactionId}
                </td>
              </tr>
            </table>
          </div>
          <p style="color: #374151; font-size: 14px; margin-bottom: 16px;">
            The funds have been sent to your registered payment method. Processing time depends on your bank or payment provider.
          </p>
          <div style="text-align: center; padding: 24px; background: #F8FAFC; border-radius: 8px;">
            <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">How was your experience?</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              We'd love to hear your feedback to improve escrowhaven.
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px; text-align: center;">
            Thank you for using escrowhaven! We hope to see you again soon.
          </p>
        </div>
      </div>
    `
  })
};
