// src/app/api/escrow/connect-transak/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  console.log('Connect Transak endpoint called');
  
  try {
    // Parse request body
    const body = await request.json();
    const { 
      pendingEscrowId,
      walletAddress,
      transakUserId,
      userEmail,
      connectMethod = 'widget' // 'widget', 'oauth', 'email'
    } = body;

    // Validation
    if (!pendingEscrowId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Get the pending escrow
    const { data: pendingEscrow, error: fetchError } = await supabase
      .from('pending_escrows')
      .select('*')
      .eq('id', pendingEscrowId)
      .single();

    if (fetchError || !pendingEscrow) {
      return NextResponse.json(
        { error: 'Pending escrow not found' },
        { status: 404 }
      );
    }

    // Verify the user connecting is the recipient
    if (userEmail && userEmail !== pendingEscrow.freelancer_email) {
      return NextResponse.json(
        { error: 'Only the recipient can connect their Transak account' },
        { status: 403 }
      );
    }

    // Update the pending escrow with wallet info
    const { data: updatedEscrow, error: updateError } = await supabase
      .from('pending_escrows')
      .update({
        recipient_wallet_address: walletAddress,
        recipient_transak_user_id: transakUserId || null,
        recipient_wallet_setup_at: new Date().toISOString(),
        wallet_source: 'transak',
        transak_connect_method: connectMethod
      })
      .eq('id', pendingEscrowId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update wallet information' },
        { status: 500 }
      );
    }

    console.log('Successfully connected Transak wallet:', walletAddress);

    // Determine next action
    let nextAction: string;
    let message: string;

    if (pendingEscrow.status === 'INITIATED' && pendingEscrow.initiator_role === 'recipient') {
      // Recipient initiated and now has wallet - waiting for payer
      nextAction = 'await-payer';
      message = 'Transak connected! Waiting for payer to accept.';
    } else if (pendingEscrow.status === 'INITIATED') {
      // Need to accept the escrow now that wallet is connected
      nextAction = 'accept-escrow';
      message = 'Transak connected! You can now accept the escrow.';
    } else if (pendingEscrow.status === 'ACCEPTED') {
      // Already accepted - ready for funding
      nextAction = 'ready-to-fund';
      message = 'Transak connected! The payer can now fund the escrow.';
    } else {
      nextAction = 'view-escrow';
      message = 'Transak account connected successfully.';
    }

    return NextResponse.json({
      success: true,
      walletAddress,
      nextAction,
      message,
      escrow: updatedEscrow
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if wallet is already connected
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pendingEscrowId = searchParams.get('pendingEscrowId');
    const userEmail = searchParams.get('userEmail');

    if (!pendingEscrowId) {
      return NextResponse.json(
        { error: 'Missing pendingEscrowId parameter' },
        { status: 400 }
      );
    }

    // Get the pending escrow
    const { data: pendingEscrow, error } = await supabase
      .from('pending_escrows')
      .select('recipient_wallet_address, recipient_transak_user_id, freelancer_email')
      .eq('id', pendingEscrowId)
      .single();

    if (error || !pendingEscrow) {
      return NextResponse.json(
        { error: 'Pending escrow not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized
    if (userEmail && userEmail !== pendingEscrow.freelancer_email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      connected: !!pendingEscrow.recipient_wallet_address,
      walletAddress: pendingEscrow.recipient_wallet_address,
      transakUserId: pendingEscrow.recipient_transak_user_id
    });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}