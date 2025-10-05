// src/lib/email.ts
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.log('📧 Email service not initialized (no API key)');
    return { id: 'no-email-service' };
  }
  
  const originalTo = options.to;
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' || process.env.NODE_ENV === 'development') {
    options.to = 'hello.saferelay@gmail.com';
    console.log('📧 Test mode: Redirecting email from', originalTo, 'to', options.to);
    
    options.html = `
      <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
        <strong>TEST MODE:</strong> This email was originally for: ${originalTo}
      </div>
      ${options.html}
    `;
  }

  console.log('📧 Sending email to:', options.to);
  console.log('📧 Subject:', options.subject);

  try {
    const { data, error } = await resend.emails.send({
      from: 'escrowhaven <notifications@escrowhaven.io>',
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

const emailWrapper = (content: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 40px auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0;">escrowhaven.io</h2>
    </div>
    ${content}
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Secured by smart contracts on Polygon
      </p>
    </div>
  </div>
`;

export const emailTemplates = {
  escrowInvitation: ({ 
    recipientEmail, 
    senderEmail, 
    amount, 
    description, 
    escrowLink,
    role 
  }: { 
    recipientEmail: string; 
    senderEmail: string; 
    amount: string; 
    description?: string; 
    escrowLink: string;
    role: 'payer' | 'recipient';
  }) => ({
    to: recipientEmail,
    subject: `${senderEmail} sent you an escrow invitation`,
    html: emailWrapper(`
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">Escrow invitation</p>
        <p style="font-size: 28px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">${amount}</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">
          ${role === 'payer' ? 'to receive from' : 'to send to'} ${senderEmail}
        </p>
        
        ${description ? `
          <div style="background: #f9fafb; border-radius: 4px; padding: 12px; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #6b7280; margin: 0;">${description}</p>
          </div>
        ` : ''}
        
        <a href="${escrowLink}" 
           style="display: block; text-align: center; background: #111827; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 500;">
          View Invitation
        </a>
        
        <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0 0; text-align: center;">
          You'll need to accept the terms to proceed
        </p>
      </div>
    `)
  })
};