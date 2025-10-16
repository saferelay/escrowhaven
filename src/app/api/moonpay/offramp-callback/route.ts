// src/app/api/moonpay/offramp-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { transferUSDCForOfframp } from '@/lib/offramp-magic-transfer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for logging (optional but recommended)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  console.log('=== MoonPay Offramp Callback Received ===');
  
  const searchParams = request.nextUrl.searchParams;
  
  // MoonPay sends these as URL parameters
  const transactionId = searchParams.get('transactionId');
  const depositWalletAddress = searchParams.get('depositWalletAddress');
  const baseCurrencyAmount = searchParams.get('baseCurrencyAmount');
  const baseCurrencyCode = searchParams.get('baseCurrencyCode');
  const withdrawalId = searchParams.get('withdrawalId'); // Our custom param
  
  console.log('Callback parameters:', {
    transactionId,
    depositWalletAddress,
    baseCurrencyAmount,
    baseCurrencyCode,
    withdrawalId
  });
  
  // Validate required parameters
  if (!depositWalletAddress || !baseCurrencyAmount) {
    console.error('❌ Missing required parameters');
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?error=invalid_moonpay_callback`
    );
  }
  
  // Validate it's USDC
  if (baseCurrencyCode && baseCurrencyCode.toLowerCase() !== 'usdc') {
    console.error('❌ Invalid currency:', baseCurrencyCode);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?error=invalid_currency`
    );
  }
  
  try {
    const usdcAmount = parseFloat(baseCurrencyAmount);
    
    if (isNaN(usdcAmount) || usdcAmount <= 0) {
      throw new Error('Invalid USDC amount');
    }
    
    console.log(`💸 Initiating transfer of ${usdcAmount} USDC to MoonPay...`);
    console.log(`📍 Destination address: ${depositWalletAddress}`);
    
    // Transfer USDC from user's Magic wallet to MoonPay's deposit address
    const result = await transferUSDCForOfframp(
      depositWalletAddress,
      usdcAmount
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Transfer failed');
    }
    
    console.log('✅ USDC transferred to MoonPay successfully');
    console.log('📝 Transaction hash:', result.txHash);
    
    // Optional: Log the transaction to your database
    if (withdrawalId) {
      try {
        await supabase
          .from('withdrawals')
          .update({
            moonpay_transaction_id: transactionId,
            moonpay_deposit_address: depositWalletAddress,
            blockchain_tx_hash: result.txHash,
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', withdrawalId);
        
        console.log('✅ Database updated with transaction details');
      } catch (dbError) {
        console.error('⚠️  Database update failed (non-critical):', dbError);
        // Don't fail the whole flow if DB update fails
      }
    }
    
    // Redirect back to dashboard with success message
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?offramp=success&tx=${result.txHash}&moonpay_id=${transactionId || 'unknown'}`
    );
    
  } catch (error: any) {
    console.error('=== Offramp Transfer Failed ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    // Optional: Log the error to database
    if (withdrawalId) {
      try {
        await supabase
          .from('withdrawals')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', withdrawalId);
      } catch (dbError) {
        console.error('⚠️  Database error logging failed:', dbError);
      }
    }
    
    // Redirect back to dashboard with error
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?error=offramp_transfer_failed&message=${encodeURIComponent(error.message)}`
    );
  }
}

// Handle POST requests (if MoonPay sends webhooks in future)
export async function POST(request: NextRequest) {
  console.log('=== MoonPay Webhook Received (POST) ===');
  
  try {
    const body = await request.json();
    console.log('Webhook body:', body);
    
    // Handle webhook data here if needed
    // For now, just acknowledge receipt
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received' 
    });
    
  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}