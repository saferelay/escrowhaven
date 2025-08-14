import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Transak webhook received:', JSON.stringify(body, null, 2));
    
    const { eventType, data } = body;
    
    switch (eventType) {
      case 'ORDER_COMPLETED':
      case 'ORDER_CREATED':
        // Extract wallet info from order
        const walletAddress = data.walletAddress || 
                           data.toWalletAddress || 
                           data.cryptocurrency_address ||
                           data.cryptoAddress;
        
        const userEmail = data.email || data.userEmail;
        const partnerOrderId = data.partnerOrderId;
        
        if (walletAddress && partnerOrderId?.startsWith('wallet_')) {
          // This is a wallet creation order
          const escrowId = partnerOrderId.replace('wallet_', '');
          
          console.log('Wallet creation detected:', {
            escrowId,
            walletAddress,
            userEmail
          });
          
          // Update the pending escrow with wallet
          const { error } = await supabase
            .from('pending_escrows')
            .update({
              recipient_wallet_address: walletAddress,
              status: 'ACCEPTED',
              accepted_at: new Date().toISOString(),
              wallet_source: 'transak_order',
              recipient_wallet_setup_at: new Date().toISOString()
            })
            .eq('id', escrowId);
          
          if (error) {
            console.error('Failed to update escrow with wallet:', error);
          } else {
            console.log('Successfully saved wallet for escrow:', escrowId);
            
            // Also save to user's profile for future use
            if (userEmail) {
              // Try to update or create user wallet record
              const { error: profileError } = await supabase
                .from('user_wallets')
                .upsert({
                  email: userEmail,
                  wallet_address: walletAddress,
                  source: 'transak',
                  created_at: new Date().toISOString()
                }, {
                  onConflict: 'email'
                });
                
              if (profileError) {
                console.error('Failed to save wallet to profile:', profileError);
              }
            }
          }
        }
        break;
        
      case 'USER_KYC_COMPLETED':
        console.log('User KYC completed:', data.email);
        // KYC complete but wallet might not be created yet
        break;
        
      default:
        console.log('Unhandled event type:', eventType);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}