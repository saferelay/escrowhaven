import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Settlement API received:', body);
    
    const { escrowId, action, userEmail } = body;

    if (!escrowId || !action || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: { escrowId: !!escrowId, action: !!action, userEmail: !!userEmail }
      }, { status: 400 });
    }

    // Get escrow details
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (error || !escrow) {
      console.error('Escrow fetch error:', error);
      return NextResponse.json({ 
        error: 'Escrow not found',
        details: error?.message 
      }, { status: 404 });
    }

    // Determine user role
    const userRole = escrow.client_email === userEmail ? 'payer' : 
                    escrow.freelancer_email === userEmail ? 'recipient' : null;

    if (!userRole) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'User email does not match escrow parties'
      }, { status: 403 });
    }

    console.log('Processing action:', action.type, 'by', userRole);

    // Handle different actions
    switch (action.type) {
      case 'approve_full':
        return await handleFullApproval(escrow, userRole);
        
      case 'refund_full':
        return await handleFullRefund(escrow, userRole);
        
      case 'propose_settlement':
        return await handleSettlementProposal(escrow, userRole, action.amount, action.reason);
        
      case 'waive_amount':
        return await handleWaiveAmount(escrow, userRole, action.amount, action.reason);
        
      case 'accept_settlement':
        return await handleAcceptSettlement(escrow, userRole);
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          details: `Unknown action type: ${action.type}`
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Settlement action error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

async function handleFullApproval(escrow: any, userRole: string) {
  if (userRole !== 'payer') {
    return NextResponse.json({ error: 'Only payer can approve' }, { status: 403 });
  }

  // Update database to trigger monitor
  const { error } = await supabase
    .from('escrows')
    .update({
      client_approved: true,
      last_action_by: 'payer',
      last_action_at: new Date().toISOString(),
      settlement_proposed_by: null,
      settlement_amount_cents: null,
      settlement_reason: null
    })
    .eq('id', escrow.id);

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update escrow',
      details: error.message
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: 'full_approval' });
}

async function handleFullRefund(escrow: any, userRole: string) {
  if (userRole !== 'recipient') {
    return NextResponse.json({ error: 'Only recipient can refund' }, { status: 403 });
  }

  // Check if there's a refund_requested column
  const updateData: any = {
    last_action_by: 'recipient',
    last_action_at: new Date().toISOString()
  };

  // Use payer_wants_cancel for refund request
  updateData.recipient_wants_cancel = true;

  const { error } = await supabase
    .from('escrows')
    .update(updateData)
    .eq('id', escrow.id);

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update escrow',
      details: error.message
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: 'full_refund' });
}

async function handleSettlementProposal(escrow: any, userRole: string, amountCents: number, reason: string) {
  const remainingAmount = escrow.amount_remaining_cents || escrow.amount_cents;
  
  // Validate amount
  if (!amountCents || amountCents <= 0 || amountCents > remainingAmount) {
    return NextResponse.json({ 
      error: 'Invalid amount',
      details: `Amount must be between 0 and ${remainingAmount}`
    }, { status: 400 });
  }

  const { error } = await supabase
    .from('escrows')
    .update({
      settlement_proposed_by: userRole,
      settlement_amount_cents: amountCents,
      settlement_reason: reason || '',
      settlement_proposed_at: new Date().toISOString(),
      last_action_by: userRole,
      last_action_at: new Date().toISOString()
    })
    .eq('id', escrow.id);

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update escrow',
      details: error.message
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: 'settlement_proposed' });
}

async function handleWaiveAmount(escrow: any, userRole: string, amountCents: number, reason: string) {
  if (userRole !== 'recipient') {
    return NextResponse.json({ error: 'Only recipient can waive' }, { status: 403 });
  }

  const currentRemaining = escrow.amount_remaining_cents || escrow.amount_cents;
  const currentReleased = escrow.amount_released_cents || 0;
  
  if (!amountCents || amountCents <= 0 || amountCents > currentRemaining) {
    return NextResponse.json({ 
      error: 'Invalid amount',
      details: `Amount must be between 0 and ${currentRemaining}`
    }, { status: 400 });
  }

  // This triggers immediate partial refund via monitor
  const newReleasedAmount = currentReleased + amountCents;
  const newRemainingAmount = currentRemaining - amountCents;

  // Update settlement history
  const settlementHistory = escrow.settlement_history || [];
  settlementHistory.push({
    type: 'waive',
    amount: amountCents,
    by: 'recipient',
    reason: reason || '',
    timestamp: new Date().toISOString()
  });

  const { error } = await supabase
    .from('escrows')
    .update({
      amount_released_cents: newReleasedAmount,
      amount_remaining_cents: newRemainingAmount,
      waive_pending: true,
      waive_amount_cents: amountCents,
      last_action_by: 'recipient',
      last_action_at: new Date().toISOString(),
      settlement_history: settlementHistory
    })
    .eq('id', escrow.id);

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update escrow',
      details: error.message
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: 'amount_waived' });
}

async function handleAcceptSettlement(escrow: any, userRole: string) {
  if (!escrow.settlement_proposed_by || escrow.settlement_proposed_by === userRole) {
    return NextResponse.json({ 
      error: 'No valid settlement to accept',
      details: 'No pending settlement proposal from other party'
    }, { status: 400 });
  }

  const remainingAmount = escrow.amount_remaining_cents || escrow.amount_cents;
  
  // Determine what happens based on who proposed and who accepts
  const updateData: any = {
    settlement_accepted: true,
    settlement_accepted_at: new Date().toISOString(),
    last_action_by: userRole,
    last_action_at: new Date().toISOString()
  };

  if (escrow.settlement_proposed_by === 'payer') {
    // Payer proposed to pay X amount, recipient accepts
    updateData.payer_gets_cents = remainingAmount - escrow.settlement_amount_cents;
    updateData.recipient_gets_cents = escrow.settlement_amount_cents;
  } else {
    // Recipient proposed to waive X amount, payer accepts
    updateData.payer_gets_cents = escrow.settlement_amount_cents;
    updateData.recipient_gets_cents = remainingAmount - escrow.settlement_amount_cents;
  }

  const { error } = await supabase
    .from('escrows')
    .update(updateData)
    .eq('id', escrow.id);

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update escrow',
      details: error.message
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: 'settlement_accepted' });
}
