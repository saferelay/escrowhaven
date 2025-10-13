// src/lib/moonpay.ts
import { loadMoonPay } from '@moonpay/moonpay-js';

interface MoonPayOnrampConfig {
  email?: string;
  walletAddress: string;
  amount: number;
  escrowId: string;
  isTestMode?: boolean;
}

interface MoonPayOfframpConfig {
  email?: string;
  walletAddress: string;
  amount: number;
  withdrawalId: string;
  isTestMode?: boolean;
}

// Sign parameters server-side (only for production)
async function signParams(params: Record<string, any>): Promise<Record<string, any>> {
  try {
    const response = await fetch('/api/moonpay/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sign parameters');
    }
    
    const { signedParams } = await response.json();
    return signedParams;
  } catch (error) {
    console.error('Parameter signing failed:', error);
    throw error;
  }
}

// On-ramp: Fund escrow vault
export async function createMoonPayOnramp({
  email,
  walletAddress,
  amount,
  escrowId,
  isTestMode = false
}: MoonPayOnrampConfig) {
  const moonPay = await loadMoonPay();
  
  // Check MoonPay mode specifically (not general app environment)
  const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
  const useMoonPayProduction = moonPayMode === 'production';
  
  // Build base parameters
  const baseParams: Record<string, any> = {
    apiKey: useMoonPayProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
    currencyCode: 'usdc_polygon',  // What crypto to buy
    quoteCurrencyAmount: amount.toFixed(2),  // USDC amount (locked) - THIS IS THE KEY CHANGE
    walletAddress: walletAddress,
    colorCode: '2962FF',
    externalTransactionId: escrowId,
    lockAmount: 'true',  // Lock the USDC amount
  };
  
  // Add email if provided
  if (email) {
    baseParams.email = email;
  }
  
  // Only sign parameters in MoonPay production mode
  let finalParams = baseParams;
  if (useMoonPayProduction) {
    try {
      finalParams = await signParams(baseParams);
      console.log('✅ MoonPay parameters signed for production');
    } catch (error) {
      console.error('❌ Failed to sign MoonPay parameters:', error);
      throw new Error('Security signature required for MoonPay production');
    }
  } else {
    console.log('ℹ️ MoonPay sandbox mode - skipping signature');
  }
  
  const moonPaySdk = moonPay({
    flow: 'buy',
    environment: useMoonPayProduction ? 'production' : 'sandbox',
    variant: 'overlay',
    params: finalParams as any
  });
  
  return moonPaySdk;
}

// Off-ramp: Withdraw to bank
export async function createMoonPayOfframp({
  email,
  walletAddress,
  amount,
  withdrawalId,
  isTestMode = false
}: MoonPayOfframpConfig) {
  const moonPay = await loadMoonPay();
  
  // Check MoonPay mode specifically (not general app environment)
  const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
  const useMoonPayProduction = moonPayMode === 'production';
  
  // Build base parameters
  const baseParams: Record<string, any> = {
    apiKey: useMoonPayProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
    currencyCode: 'usdc_polygon',  // What crypto to sell
    baseCurrencyAmount: amount.toFixed(2),  // USDC amount to sell (locked) - KEY CHANGE
    walletAddress: walletAddress,
    colorCode: '2962FF',
    externalTransactionId: withdrawalId,
    lockAmount: 'true',  // Lock the USDC amount
  };
  
  // Add email if provided
  if (email) {
    baseParams.email = email;
  }
  
  // Only sign parameters in MoonPay production mode
  let finalParams = baseParams;
  if (useMoonPayProduction) {
    try {
      finalParams = await signParams(baseParams);
      console.log('✅ MoonPay parameters signed for production');
    } catch (error) {
      console.error('❌ Failed to sign MoonPay parameters:', error);
      throw new Error('Security signature required for MoonPay production');
    }
  } else {
    console.log('ℹ️ MoonPay sandbox mode - skipping signature');
  }
  
  const moonPaySdk = moonPay({
    flow: 'sell',
    environment: useMoonPayProduction ? 'production' : 'sandbox',
    variant: 'overlay',
    params: finalParams as any
  });
  
  return moonPaySdk;
}