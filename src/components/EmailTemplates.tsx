export const emailTemplates = {
    paymentReceived: {
      subject: "You've been paid! - SafeRelay",
      preview: "Great news! You have a payment waiting for approval.",
      template: `
        <h1>You've been paid!</h1>
        <p>Hi {{recipientName}},</p>
        <p>Great news! <strong>{{payerName}}</strong> has sent you a payment of <strong>${{amount}}</strong> through SafeRelay.</p>
        <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
          <p style="font-size: 14px; color: #065F46; margin-bottom: 8px;">Payment Amount</p>
          <p style="font-size: 48px; font-weight: 700; color: #065F46; font-family: monospace;">${{amount}}</p>
          <p style="font-size: 14px; color: #047857; margin-top: 8px;">Your payout: ${{recipientAmount}} (after 1.99% fee)</p>
        </div>
        <p>The funds are securely held in escrow. To receive payment, simply click below to review and approve the release:</p>
        <a href="{{magicLink}}" style="display: inline-block; background: #10B981; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Review & Approve Payment
        </a>
        <div style="background: #EFF6FF; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p><strong>🔒 This is a secure, one-time link</strong><br>It will expire in 24 hours and can only be used once. No password needed.</p>
        </div>
      `
    },
    
    escrowCreated: {
      subject: "Escrow Created Successfully - SafeRelay",
      preview: "Your escrow has been created and is ready for funding.",
      template: `
        <h1>Escrow Created Successfully</h1>
        <p>Hi {{payerName}},</p>
        <p>Your escrow has been created and your payment is being processed.</p>
        <div style="background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <h3>Escrow Details</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Recipient:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{recipientEmail}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Amount:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: monospace;">${{amount}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Escrow ID:</td>
              <td style="padding: 8px 0; text-align: right; font-family: monospace;">#{{escrowId}}</td>
            </tr>
          </table>
        </div>
        <a href="{{escrowLink}}" style="display: inline-block; background: #2563EB; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Escrow Status
        </a>
      `
    },
    
    approvalRequired: {
      subject: "Action Required: Approval Needed - SafeRelay",
      preview: "The other party has approved. Your approval is needed to release funds.",
      template: `
        <h1>Action Required: Approval Needed</h1>
        <p>Hi {{userName}},</p>
        <p><strong>{{otherParty}}</strong> has approved the release of your escrow payment. Your approval is now needed to complete the transaction.</p>
        <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 20px; margin: 32px 0; text-align: center;">
          <p style="font-size: 32px; margin-bottom: 8px;">⏳</p>
          <p style="font-size: 18px; font-weight: 600; color: #92400E; margin-bottom: 8px;">Waiting for Your Approval</p>
          <p style="font-size: 14px; color: #78350F;">1 of 2 approvals received</p>
        </div>
        <a href="{{escrowLink}}" style="display: inline-block; background: #F59E0B; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Review & Approve
        </a>
      `
    },
    
    fundsReleased: {
      subject: "Payment Released! - SafeRelay",
      preview: "Your payment has been released successfully.",
      template: `
        <div style="text-align: center;">
          <p style="font-size: 48px; margin-bottom: 16px;">🎉</p>
          <h1>Payment Released!</h1>
        </div>
        <p>Hi {{recipientName}},</p>
        <p>Great news! Your payment has been released and is on its way to your account.</p>
        <div style="background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #065F46;">Amount Released:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 700; font-family: monospace; font-size: 20px; color: #065F46;">${{amount}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #065F46;">Transaction ID:</td>
              <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">
                <a href="{{txLink}}" style="color: #059669;">{{txHash}}</a>
              </td>
            </tr>
          </table>
        </div>
        <p>Thank you for using SafeRelay! We hope you had a great experience.</p>
      `
    }
  };