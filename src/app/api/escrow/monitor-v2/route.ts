import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getProvider } from '@/lib/blockchain-provider-fixed';
import { config } from '@/lib/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// USDC addresses
const USDC_ADDRESSES = {
  testnet: '0x8B0180f2101c8260d49339abfEe87927412494B4', // Mock USDC on Polygon Amoy
  mainnet: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'  // USDC on Polygon mainnet
};

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json();
    
    console.log('=== V2 FUNDING MONITOR ===');
    console.log('Mode:', config.isTestMode ? 'TEST' : 'PRODUCTION');
    console.log('Escrow ID:', escrowId);
    
    // Get escrow details
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (error || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    if (!escrow.vault_address) {
      return NextResponse.json({ error: 'No vault address' }, { status: 400 });
    }
    
    // Skip if already funded or released
    if (['FUNDED', 'RELEASED', 'REFUNDED'].includes(escrow.status)) {
      return NextResponse.json({ 
        message: 'Already processed',
        status: escrow.status 
      });
    }
    
    // In production mode with TransakOne, funding is handled by webhook
    if (!config.isTestMode && escrow.funding_method === 'transak') {
      return NextResponse.json({
        message: 'Waiting for TransakOne webhook',
        mode: 'production'
      });
    }
    
    // For test mode or manual checks, verify on-chain balance
    const provider = getProvider();
    const usdcAddress = config.isTestMode ? USDC_ADDRESSES.testnet : USDC_ADDRESSES.mainnet;
    const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);
    
    const balance = await usdc.balanceOf(escrow.vault_address);
    const balanceInUsdc = parseFloat(ethers.utils.formatUnits(balance, 6));
    const expectedAmount = escrow.amount_cents / 100;
    
    console.log('Vault balance:', balanceInUsdc, 'USDC');
    console.log('Expected amount:', expectedAmount, 'USD');
    
    // Check if funded (allow 1% tolerance for fees/rounding)
    const isFunded = balanceInUsdc >= expectedAmount * 0.99;
    
    if (isFunded && escrow.status !== 'FUNDED') {
      console.log('✅ Escrow is funded! Updating status...');
      
      // Update escrow status
      const { error: updateError } = await supabase
        .from('escrows')
        .update({ 
          status: 'FUNDED',
          funded_at: new Date().toISOString(),
          funded_amount_cents: Math.round(balanceInUsdc * 100),
          funding_method: config.isTestMode ? 'mock_usdc' : 'manual',
          tx_hash: config.isTestMode ? `test_funding_${Date.now()}` : null
        })
        .eq('id', escrowId);
        
      if (updateError) {
        console.error('Failed to update status:', updateError);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
      }
      
      // Send notification emails
      try {
        // Import email function if available
        const { sendEmail } = await import('@/lib/email');
        
        // Notify freelancer
        await sendEmail({
          to: escrow.freelancer_email,
          subject: `Escrow Funded - $${expectedAmount} Ready`,
          html: `Your escrow has been funded with $${expectedAmount}. Both parties can now approve the release.`
        });
        
        // Notify client
        await sendEmail({
          to: escrow.client_email,
          subject: `Payment Confirmed - $${expectedAmount}`,
          html: `Your payment has been secured in escrow. The funds will be released when both parties approve.`
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
      
      return NextResponse.json({
        funded: true,
        balance: balanceInUsdc,
        status: 'FUNDED',
        mode: config.isTestMode ? 'test' : 'production',
        message: 'Escrow has been funded successfully'
      });
    }
    
    return NextResponse.json({
      funded: false,
      balance: balanceInUsdc,
      required: expectedAmount,
      status: escrow.status,
      mode: config.isTestMode ? 'test' : 'production',
      message: `Waiting for funding. Current: ${balanceInUsdc} USDC, Required: ${expectedAmount} USDC`
    });
    
  } catch (error: any) {
    console.error('Monitor error:', error);
    return NextResponse.json({ 
      error: 'Failed to monitor funding',
      details: error.message 
    }, { status: 500 });
  }
}
