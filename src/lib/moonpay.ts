// src/lib/moonpay.ts
import { loadMoonPay } from '@moonpay/moonpay-js';

interface MoonPayWidgetParams {
  email?: string;
  vaultAddress: string;
  amount: number;
  escrowId: string;
  isTestMode?: boolean;
}

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
    
    const { signedParams } = await response.json();
    return signedParams;
  } catch (error) {
    console.error('Parameter signing failed:', error);
    throw error;
  }
}

export async function createMoonPayWidget({
  email,
  vaultAddress,
  amount,
  escrowId,
  isTestMode = false
}: MoonPayWidgetParams) {
  const moonPay = await loadMoonPay();
  
  // Base parameters
  const baseParams: any = {
    apiKey: isTestMode 
      ? process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!,
    defaultCurrencyCode: 'usdc_polygon',
    baseCurrencyCode: 'usd',
    baseCurrencyAmount: amount.toString(),
    walletAddress: vaultAddress,
    theme: 'dark',
    colorCode: '#2962FF',
    externalTransactionId: escrowId
  };
  
  // Add email if provided
  if (email) {
    baseParams.email = email;
  }
  
  // Sign parameters if we have sensitive data (wallet or email)
  let finalParams = baseParams;
  if (vaultAddress || email) {
    try {
      finalParams = await signParams(baseParams);
    } catch (error) {
      console.error('Failed to sign parameters, proceeding without signature:', error);
      // In development, you might proceed without signing
      // In production, you should throw an error
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
        throw new Error('Security signature required');
      }
    }
  }
  
  const moonPaySdk = moonPay({
    flow: 'buy',
    environment: isTestMode ? 'sandbox' : 'production',
    variant: 'overlay',
    params: finalParams
  });
  
  return moonPaySdk;
}

// For test transaction (required for activation)
export async function createMoonPayTestWidget() {
  const moonPay = await loadMoonPay();
  
  const moonPaySdk = moonPay({
    flow: 'buy',
    environment: 'sandbox',
    variant: 'overlay',
    params: {
      apiKey: 'pk_test_AoimiLsh01zxodm85PrpDJe0Vgqw3o',
      theme: 'dark',
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: '100',
      defaultCurrencyCode: 'eth' // Must use ETH for test
    }
  });
  
  return moonPaySdk;
}