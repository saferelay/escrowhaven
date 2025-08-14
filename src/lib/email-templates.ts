// src/lib/email-templates.ts

export const emailTemplates = {
    paymentReceived: (recipientEmail: string, payerEmail: string, amount: number, escrowId: string) => ({
      subject: "You've been paid! 💰",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <!-- Header -->
            <tr>
              <td style="background: #2563EB; padding: 32px 40px; text-align: center;">
                <div style="display: inline-block;">
                  <div style="width: 48px; height: 48px; background: white; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <span style="color: #2563EB; font-size: 24px; font-weight: bold;">S</span>
                  </div>
                  <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">You've been paid!</h1>
                </div>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="font-size: 16px; color: #374151; margin: 0 0 24px; line-height: 1.6;">
                  Hi ${recipientEmail},
                </p>
                
                <p style="font-size: 16px; color: #374151; margin: 0 0 32px; line-height: 1.6;">
                  Great news! <strong>${payerEmail}</strong> has sent you a payment of <strong style="color: #059669;">$${amount.toFixed(2)}</strong> through SafeRelay.
                </p>
                
                <!-- Amount Card -->
                <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 14px; color: #065F46; margin-bottom: 8px;">Payment Amount</div>
                  <div style="font-size: 48px; font-weight: 700; color: #065F46; font-family: monospace;">$${amount.toFixed(2)}</div>
                  <div style="font-size: 14px; color: #047857; margin-top: 8px;">Your payout: $${(amount * 0.9801).toFixed(2)} (after 1.99% fee)</div>
                </div>
                
                <p style="font-size: 16px; color: #374151; margin: 0 0 32px; line-height: 1.6;">
                  The funds are securely held in escrow. To receive payment, simply click below to review and approve the release:
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #10B981; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Review & Approve Payment
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #6B7280; margin: 0; line-height: 1.6;">
                  Questions? Reply to this email or visit our help center.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }),
    
    escrowCreated: (clientEmail: string, freelancerEmail: string, amount: number, escrowId: string) => ({
      subject: "Escrow Created Successfully",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <!-- Header -->
            <tr>
              <td style="background: #2563EB; padding: 32px 40px; text-align: center;">
                <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">Escrow Created Successfully</h1>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="font-size: 16px; color: #374151; margin: 0 0 24px; line-height: 1.6;">
                  Hi ${clientEmail},
                </p>
                
                <p style="font-size: 16px; color: #374151; margin: 0 0 32px; line-height: 1.6;">
                  Your escrow has been created and your payment is being processed.
                </p>
                
                <!-- Details Card -->
                <div style="background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                  <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">Escrow Details</h3>
                  <table style="width: 100%;">
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Recipient:</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600;">${freelancerEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Amount:</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: monospace;">$${amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Escrow ID:</td>
                      <td style="padding: 8px 0; text-align: right; font-family: monospace;">#${escrowId.slice(0, 8).toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Status:</td>
                      <td style="padding: 8px 0; text-align: right;">
                        <span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">Processing Payment</span>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="margin-bottom: 32px;">
                  <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">What happens next?</h3>
                  <ol style="margin: 0; padding-left: 20px; color: #374151;">
                    <li style="margin-bottom: 8px;">Your payment will be processed and funds secured in escrow</li>
                    <li style="margin-bottom: 8px;">The recipient will be notified via email</li>
                    <li style="margin-bottom: 8px;">Once work is complete, both parties approve release</li>
                    <li>Funds are automatically sent to the recipient</li>
                  </ol>
                </div>
                
                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}" style="display: inline-block; background: #2563EB; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    View Escrow Status
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #6B7280; margin: 0; line-height: 1.6;">
                  You'll receive an email when the recipient is ready for payment release.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }),
    pendingEscrowInvite: (recipientEmail: string, senderEmail: string, amount: number, pendingId: string) => ({
      subject: `${senderEmail} wants to send you $${amount.toFixed(2)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <!-- Header -->
            <tr>
              <td style="background: #10B981; padding: 32px 40px; text-align: center;">
                <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">You have a pending payment!</h1>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="font-size: 16px; color: #374151; margin: 0 0 24px; line-height: 1.6;">
                  Hi ${recipientEmail},
                </p>
                
                <p style="font-size: 16px; color: #374151; margin: 0 0 32px; line-height: 1.6;">
                  <strong>${senderEmail}</strong> wants to send you <strong style="color: #059669;">$${amount.toFixed(2)}</strong> through SafeRelay.
                </p>
                
                <!-- Amount Card -->
                <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 14px; color: #065F46; margin-bottom: 8px;">Payment Amount</div>
                  <div style="font-size: 48px; font-weight: 700; color: #065F46; font-family: monospace;">$${amount.toFixed(2)}</div>
                  <div style="font-size: 14px; color: #047857; margin-top: 8px;">Your payout: $${(amount * 0.9801).toFixed(2)} (after 1.99% fee)</div>
                </div>
                
                <p style="font-size: 16px; color: #374151; margin: 0 0 32px; line-height: 1.6;">
                  To receive this payment, you need to set up your payout method. It only takes a minute!
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/escrow/accept/${pendingId}" style="display: inline-block; background: #10B981; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Accept Payment
                  </a>
                </div>
                
                <!-- Security Notice -->
                <div style="background: #EFF6FF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 14px; color: #1E40AF;">
                    <strong>🔒 Secure & Protected</strong><br>
                    Funds are held in a smart contract escrow. Both parties must approve before release.
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #6B7280; margin: 0; line-height: 1.6;">
                  This invitation expires in 7 days. Questions? Reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })
};