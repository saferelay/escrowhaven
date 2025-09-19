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

  console.log('📧 Sending email to:', options.to);
  console.log('📧 Subject:', options.subject);

  try {
    const { data, error } = await resend.emails.send({
      from: 'escrowhaven.io <onboarding@resend.dev>',
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

// Minimal email wrapper for consistency
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
  // When someone creates an escrow invitation
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
  }),

  // When escrow is accepted (terms agreed)
  escrowAccepted: ({ 
    email, 
    acceptedBy, 
    amount,
    escrowId,
    isInitiator 
  }: { 
    email: string;
    acceptedBy: string;
    amount: string;
    escrowId: string;
    isInitiator: boolean;
  }) => ({
    to: email,
    subject: isInitiator ? 'Terms accepted - ready to fund' : 'Escrow terms accepted',
    html: emailWrapper(`
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px;">
        <p style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 500;">
          ✓ Terms accepted
        </p>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">
          ${isInitiator ? `${acceptedBy} has accepted the escrow terms` : 'Both parties have agreed to the terms'}
        </p>
        
        <div style="background: #f9fafb; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">Amount</p>
          <p style="font-size: 18px; color: #111827; font-weight: 600; margin: 0;">${amount}</p>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" 
           style="display: block; text-align: center; background: #111827; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 500;">
          ${isInitiator ? 'Fund Escrow' : 'View Escrow'}
        </a>
      </div>
    `)
  }),

  // When escrow is funded and contract deployed
  escrowFunded: ({ 
    email, 
    amount, 
    escrowId,
    role 
  }: {
    email: string;
    amount: string;
    escrowId: string;
    role: 'payer' | 'recipient';
  }) => ({
    to: email,
    subject: 'Escrow funded',
    html: emailWrapper(`
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px;">
        <p style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 500;">
          Escrow is active
        </p>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">
          ${amount} secured on blockchain
        </p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #166534; margin: 0;">
            ${role === 'payer' 
              ? 'Funds are protected until you approve release' 
              : 'Funds will be released upon approval'}
          </p>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" 
           style="display: block; text-align: center; background: #111827; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Manage Escrow
        </a>
      </div>
    `)
  }),

  // When payment is released
  paymentReleased: ({ 
    recipientEmail, 
    amount,
    netAmount,
    senderEmail 
  }: {
    recipientEmail: string;
    amount: string;
    netAmount: string;
    senderEmail: string;
  }) => ({
    to: recipientEmail,
    subject: 'Payment received',
    html: emailWrapper(`
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px;">
        <p style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 500;">
          Payment received
        </p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 16px; margin-bottom: 16px;">
          <p style="font-size: 24px; color: #166534; font-weight: 600; margin: 0;">${netAmount}</p>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">sent to your wallet</p>
        </div>
        
        <p style="font-size: 13px; color: #6b7280; margin: 0;">
          From: ${senderEmail}
        </p>
      </div>
    `)
  }),

  // Payment confirmation for sender
  paymentSent: ({ 
    senderEmail, 
    recipientEmail, 
    amount 
  }: {
    senderEmail: string;
    recipientEmail: string;
    amount: string;
  }) => ({
    to: senderEmail,
    subject: 'Payment sent',
    html: emailWrapper(`
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px;">
        <p style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 500;">
          Payment complete
        </p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          ${amount} sent to ${recipientEmail}
        </p>
      </div>
    `)
  }),

  // When escrow is refunded
  escrowRefunded: ({ 
    email, 
    amount,
    isInitiator 
  }: { 
    email: string; 
    amount: string;
    isInitiator: boolean;
  }) => ({
    to: email,
    subject: 'Escrow refunded',
    html: emailWrapper(`
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px;">
        <p style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 500;">
          Refund complete
        </p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          ${amount} ${isInitiator ? 'returned to your wallet' : 'refunded to sender'}
        </p>
      </div>
    `)
  }),

  // Settlement proposed
  settlementProposed: ({ 
    email, 
    proposedBy,
    yourAmount,
    escrowId 
  }: {
    email: string;
    proposedBy: string;
    yourAmount: string;
    escrowId: string;
  }) => ({
    to: email,
    subject: 'Settlement proposed',
    html: emailWrapper(`
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px;">
        <p style="font-size: 14px; color: #111827; margin: 0 0 12px 0; font-weight: 500;">
          Settlement proposal
        </p>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 16px 0;">
          ${proposedBy} proposed a settlement
        </p>
        
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px; padding: 12px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #92400e; margin: 0 0 4px 0;">Your portion:</p>
          <p style="font-size: 18px; color: #92400e; font-weight: 600; margin: 0;">${yourAmount}</p>
        </div>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" 
           style="display: block; text-align: center; background: #111827; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Review Settlement
        </a>
      </div>
    `)
  })
};