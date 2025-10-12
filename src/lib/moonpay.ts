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
  
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
  
  // Build base parameters
  const baseParams: Record<string, any> = {
    apiKey: isProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
    currencyCode: 'usdc_polygon',
    baseCurrencyCode: 'usd',
    baseCurrencyAmount: amount.toFixed(2),
    walletAddress: walletAddress,
    colorCode: '2962FF',
    externalTransactionId: escrowId,
    lockAmount: 'true',
  };
  
  // Add email if provided
  if (email) {
    baseParams.email = email;
  }
  
  // IMPORTANT: Only sign parameters in production
  let finalParams = baseParams;
  if (isProduction && !isTestMode) {
    try {
      finalParams = await signParams(baseParams);
      console.log('✅ Parameters signed for production');
    } catch (error) {
      console.error('❌ Failed to sign parameters:', error);
      throw new Error('Security signature required for production');
    }
  } else {
    console.log('ℹ️ Test mode - skipping signature');
  }
  
  const moonPaySdk = moonPay({
    flow: 'buy',
    environment: isTestMode || !isProduction ? 'sandbox' : 'production',
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
  
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
  
  // Build base parameters
  const baseParams: Record<string, any> = {
    apiKey: isProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
    currencyCode: 'usdc_polygon',
    baseCurrencyCode: 'usd',
    quoteCurrencyAmount: amount.toFixed(2),
    walletAddress: walletAddress,
    colorCode: '2962FF',
    externalTransactionId: withdrawalId,
    lockAmount: 'true',
  };
  
  // Add email if provided
  if (email) {
    baseParams.email = email;
  }
  
  // IMPORTANT: Only sign parameters in production
  let finalParams = baseParams;
  if (isProduction && !isTestMode) {
    try {
      finalParams = await signParams(baseParams);
      console.log('✅ Parameters signed for production');
    } catch (error) {
      console.error('❌ Failed to sign parameters:', error);
      throw new Error('Security signature required for production');
    }
  } else {
    console.log('ℹ️ Test mode - skipping signature');
  }
  
  const moonPaySdk = moonPay({
    flow: 'sell',
    environment: isTestMode || !isProduction ? 'sandbox' : 'production',
    variant: 'overlay',
    params: finalParams as any
  });
  
  return moonPaySdk;
}

// Test transaction (for activation)
export async function createMoonPayTestWidget() {
  const moonPay = await loadMoonPay();
  
  const moonPaySdk = moonPay({
    flow: 'buy',
    environment: 'sandbox',
    variant: 'overlay',
    params: {
      apiKey: process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: '20',
      currencyCode: 'eth'
    } as any
  });
  
  return moonPaySdk;
}