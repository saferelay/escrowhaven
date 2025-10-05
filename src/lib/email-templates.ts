// src/lib/email-templates.ts

export const emailTemplates = {
  paymentReleased: ({ 
    recipientEmail, 
    senderEmail, 
    amount,
    netAmount,
    escrowLink
  }: { 
    recipientEmail: string; 
    senderEmail: string; 
    amount: string;
    netAmount?: string;
    escrowLink?: string;
  }) => ({
    to: recipientEmail,
    subject: `Payment Released: ${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
        <div style="background: #10B981; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Released!</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${recipientEmail},</p>
          <p><strong>${senderEmail}</strong> has released your payment of <strong>${amount}</strong>.</p>
          ${netAmount ? `<p style="color: #059669;"><strong>You'll receive: ${netAmount}</strong> (after 1.99% platform fee)</p>` : ''}
          ${escrowLink ? `
          <div style="text-align: center; margin-top: 24px;">
            <a href="${escrowLink}" style="background: #10B981; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; display: inline-block;">View Transaction</a>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }),

  paymentSent: ({ 
    recipientEmail, 
    senderEmail, 
    amount,
    escrowLink
  }: { 
    recipientEmail: string; 
    senderEmail: string; 
    amount: string;
    escrowLink?: string;
  }) => ({
    to: senderEmail,
    subject: `Payment Sent: ${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
        <div style="background: #2563EB; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Sent</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${senderEmail},</p>
          <p>Your payment of <strong>${amount}</strong> has been sent to <strong>${recipientEmail}</strong>.</p>
          ${escrowLink ? `
          <div style="text-align: center; margin-top: 24px;">
            <a href="${escrowLink}" style="background: #2563EB; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; display: inline-block;">View Transaction</a>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }),

  escrowRefunded: ({ 
    email,
    amount,
    isInitiator,
    escrowLink
  }: { 
    email: string;
    amount: string;
    isInitiator?: boolean;
    escrowLink?: string;
  }) => ({
    to: email,
    subject: `Escrow Refunded: ${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
        <div style="background: #F59E0B; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">Escrow Refunded</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${email},</p>
          <p>Your escrow of <strong>${amount}</strong> has been refunded to your wallet.</p>
          ${escrowLink ? `
          <div style="text-align: center; margin-top: 24px;">
            <a href="${escrowLink}" style="background: #F59E0B; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; display: inline-block;">View Transaction</a>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }),

  escrowFunded: ({ 
    email,
    amount,
    escrowId,
    role
  }: { 
    email: string;
    amount: string;
    escrowId: string;
    role?: 'payer' | 'recipient';
  }) => ({
    to: email,
    subject: `Escrow Funded: ${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
        <div style="background: #2563EB; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">Escrow Funded</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${email},</p>
          <p>The escrow has been funded with <strong>${amount}</strong> and is now secured in the vault.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="background: #2563EB; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; display: inline-block;">View Escrow</a>
          </div>
        </div>
      </body>
      </html>
    `
  }),

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
    subject: `${senderEmail} sent you a transaction invitation`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
        <div style="background: #2962FF; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">Transaction Invitation</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${recipientEmail},</p>
          <p><strong>${senderEmail}</strong> has invited you to a transaction${role === 'recipient' ? ` for ${amount}` : ''}.</p>
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          <div style="text-align: center; margin-top: 24px;">
            <a href="${escrowLink}" style="background: #2962FF; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; display: inline-block;">Review & Accept</a>
          </div>
        </div>
      </body>
      </html>
    `
  })
};