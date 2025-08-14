import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      escrowId, 
      acceptorWallet, 
      acceptorEmail,
      action = 'accept', // 'accept' or 'decline'
      declineReason
    } = await request.json();
    
    if (!escrowId || !acceptorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get escrow
    const { data: escrow, error: fetchError } = await supabase
      .from('pending_escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
    
    if (fetchError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Check if already accepted/declined
    if (escrow.status !== 'INITIATED') {
      return NextResponse.json(
        { error: `Escrow already ${escrow.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Handle decline action
    if (action === 'decline') {
      const { error: updateError } = await supabase
        .from('pending_escrows')
        .update({
          status: 'DECLINED',
          declined_at: new Date().toISOString(),
          declined_reason: declineReason || 'User declined'
        })
        .eq('id', escrowId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to decline escrow' },
          { status: 500 }
        );
      }

      // Notify initiator that escrow was declined
      try {
        await sendEmail({
          to: escrow.initiator_email,
          subject: 'Escrow Declined',
          html: `
            <p>Hi,</p>
            <p>Unfortunately, ${acceptorEmail} has declined the escrow request.</p>
            <p>Amount: $${escrow.amount_cents / 100}</p>
            ${declineReason ? `<p>Reason: ${declineReason}</p>` : ''}
            <p>You can create a new escrow if needed.</p>
          `
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      return NextResponse.json({
        success: true,
        status: 'DECLINED'
      });
    }

    // For accept action, wallet is required
    if (!acceptorWallet) {
      return NextResponse.json(
        { error: 'Wallet address required for acceptance' },
        { status: 400 }
      );
    }
    
    // Determine acceptor role
    const acceptorRole = acceptorEmail.toLowerCase() === escrow.client_email.toLowerCase() ? 'payer' : 'recipient';
    
    // Update with the missing wallet
    const updateData: any = {
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString()
    };
    
    if (acceptorRole === 'payer') {
      updateData.payer_wallet_address = acceptorWallet;
    } else {
      updateData.recipient_wallet_address = acceptorWallet;
    }
    
    const { error: updateError } = await supabase
      .from('pending_escrows')
      .update(updateData)
      .eq('id', escrowId);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to accept escrow' },
        { status: 500 }
      );
    }
    
    // Notify initiator that escrow was accepted
    try {
      await sendEmail({
        to: escrow.initiator_email,
        ...emailTemplates.escrowAccepted({
          acceptorEmail,
          amountUsd: escrow.amount_cents / 100,
          escrowUrl: `${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrowId}`
        })
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      status: 'ACCEPTED'
    });
    
  } catch (error) {
    console.error('Accept error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}