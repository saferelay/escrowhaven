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

// Sign parameters server-side
async function signParams(params: Record<string, any>) {
  try {
    const response = await fetch('/api/moonpay/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params })
    });
    
    if (!response.ok) {
      throw new Error('Failed to sign parameters');
    }
    
    const { signature } = await response.json();
    return { ...params, signature };
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
  
  const baseParams: any = {
    apiKey: isProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
    defaultCurrencyCode: 'usdc_polygon',
    baseCurrencyCode: 'usd',
    baseCurrencyAmount: amount.toString(),
    walletAddress: walletAddress,
    theme: 'light',
    colorCode: '#2962FF',
    externalTransactionId: escrowId,
    lockAmount: true,
  };
  
  if (email) {
    baseParams.email = email;
  }
  
  // Sign parameters
  let finalParams = baseParams;
  try {
    finalParams = await signParams(baseParams);
  } catch (error) {
    console.error('Failed to sign parameters:', error);
    if (isProduction) {
      throw new Error('Security signature required');
    }
  }
  
  const moonPaySdk = moonPay({
    flow: 'buy',
    environment: isTestMode || !isProduction ? 'sandbox' : 'production',
    variant: 'overlay',
    params: finalParams
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
  
  const baseParams: any = {
    apiKey: isProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
    defaultCurrencyCode: 'usdc_polygon',
    baseCurrencyCode: 'usd',
    quoteCurrencyAmount: amount.toString(),
    walletAddress: walletAddress,
    theme: 'light',
    colorCode: '#2962FF',
    externalTransactionId: withdrawalId,
    lockAmount: true,
  };
  
  if (email) {
    baseParams.email = email;
  }
  
  // Sign parameters
  let finalParams = baseParams;
  try {
    finalParams = await signParams(baseParams);
  } catch (error) {
    console.error('Failed to sign parameters:', error);
    if (isProduction) {
      throw new Error('Security signature required');
    }
  }
  
  const moonPaySdk = moonPay({
    flow: 'sell',
    environment: isTestMode || !isProduction ? 'sandbox' : 'production',
    variant: 'overlay',
    params: finalParams
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
      theme: 'light',
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: '20',
      defaultCurrencyCode: 'eth'
    }
  });
  
  return moonPaySdk;
}