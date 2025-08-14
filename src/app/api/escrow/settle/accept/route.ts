// src/app/api/escrow/settle/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId, userEmail, action, reason } = await request.json();
    
    // Get active proposal
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*, active_settlement:settlement_proposals!active_settlement_id(*)')
      .eq('id', escrowId)
      .single();

    if (!escrow || !escrow.active_settlement) {
      return NextResponse.json({ error: 'No active proposal' }, { status: 400 });
    }

    const proposal = escrow.active_settlement;
    const userRole = userEmail === escrow.client_email ? 'payer' : 'recipient';
    
    if (userRole === proposal.proposed_by) {
      return NextResponse.json({ error: 'Cannot respond to own proposal' }, { status: 400 });
    }

    if (action === 'accept') {
      await supabase
        .from('settlement_proposals')
        .update({
          status: 'ACCEPTED',
          accepted_by: userRole,
          accepted_by_email: userEmail,
          accepted_at: new Date().toISOString()
        })
        .eq('id', proposal.id);

      return NextResponse.json({ success: true, message: 'Proposal accepted' });
      
    } else {
      await supabase
        .from('settlement_proposals')
        .update({
          status: 'REJECTED',
          rejected_by: userRole,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', proposal.id);
        
      await supabase
        .from('escrows')
        .update({ active_settlement_id: null })
        .eq('id', escrowId);

      return NextResponse.json({ success: true, message: 'Proposal rejected' });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}