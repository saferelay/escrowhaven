// src/app/api/escrow/settle/propose/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { escrowId, userEmail, settlementProposal } = await request.json();
    
    // Get escrow
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    const isClient = userEmail.toLowerCase() === escrow.client_email.toLowerCase();
    const isFreelancer = userEmail.toLowerCase() === escrow.freelancer_email.toLowerCase();
    
    if (!isClient && !isFreelancer) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const proposerRole = isClient ? 'payer' : 'recipient';
    
    // Calculate remaining amount
    const originalAmount = escrow.amount_cents;
    const settledAmount = escrow.total_settled_cents || 0;
    const remainingAmount = originalAmount - settledAmount;
    
    const freelancerAmountCents = Math.round(settlementProposal.freelancerAmount * 100);
    const clientRefundCents = remainingAmount - freelancerAmountCents;
    
    if (freelancerAmountCents < 0 || freelancerAmountCents > remainingAmount) {
      return NextResponse.json({ 
        error: `Invalid amount. Remaining in escrow: $${remainingAmount / 100}` 
      }, { status: 400 });
    }
    
    // Cancel any pending proposals
    await supabase
      .from('settlement_proposals')
      .update({ status: 'CANCELLED' })
      .eq('escrow_id', escrowId)
      .eq('status', 'PENDING');
    
    // Create new proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('settlement_proposals')
      .insert({
        escrow_id: escrowId,
        proposed_by: proposerRole,
        proposed_by_email: userEmail,
        freelancer_amount_cents: freelancerAmountCents,
        client_refund_cents: clientRefundCents,
        reason: settlementProposal.reason || null
      })
      .select()
      .single();
      
    if (proposalError) {
      return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
    }
    
    // Update escrow with active proposal
    await supabase
      .from('escrows')
      .update({
        active_settlement_id: proposal.id,
        last_action_by: userEmail,
        last_action_at: new Date().toISOString()
      })
      .eq('id', escrowId);

    return NextResponse.json({
      success: true,
      proposal: {
        id: proposal.id,
        freelancerGets: freelancerAmountCents / 100,
        clientGetsBack: clientRefundCents / 100,
        remainingInEscrow: remainingAmount / 100,
        previouslySettled: settledAmount / 100
      }
    });

  } catch (error: any) {
    console.error('Proposal error:', error);
    return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 });
  }
}