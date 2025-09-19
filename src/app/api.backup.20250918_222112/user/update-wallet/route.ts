import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, pendingId, walletField, walletSource } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    console.log('Updating wallet:', { walletAddress, pendingId, walletField, walletSource });

    // If we have a pendingId, update that specific pending escrow
    if (pendingId) {
      const updateData: any = {
        recipient_wallet_setup_at: new Date().toISOString()
      };
      
      // Use the appropriate field based on wallet type
      if (walletField === 'test_wallet_address') {
        updateData.test_wallet_address = walletAddress;
        updateData.wallet_source = 'test';
      } else {
        updateData.recipient_wallet_address = walletAddress;
        updateData.wallet_source = walletSource || 'transak';
      }
      
      const { error } = await supabase
        .from('pending_escrows')
        .update(updateData)
        .eq('id', pendingId);
      
      if (error) {
        console.error('Error updating pending escrow:', error);
        throw error;
      }
    }
    
    return NextResponse.json({ success: true, walletAddress });
    
  } catch (error: any) {
    console.error('Error updating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update wallet' },
      { status: 500 }
    );
  }
}