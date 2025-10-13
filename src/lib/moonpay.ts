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
  try {
    console.log('=== createMoonPayOnramp called ===');
    console.log('Input params:', { email, walletAddress, amount, escrowId, isTestMode });
    
    // Validate required parameters
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required');
    }
    if (!escrowId) {
      throw new Error('Escrow ID is required');
    }
    
    const moonPay = await loadMoonPay();
    console.log('MoonPay SDK loaded:', !!moonPay);
    
    // Check MoonPay mode specifically (not general app environment)
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const useMoonPayProduction = moonPayMode === 'production';
    
    const apiKey = useMoonPayProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;
    
    console.log('API Key present:', !!apiKey);
    console.log('API Key prefix:', apiKey?.substring(0, 10));
    
    if (!apiKey) {
      throw new Error(`MoonPay API key not found for ${useMoonPayProduction ? 'production' : 'sandbox'} mode`);
    }
    
    // Build base parameters - Based on MoonPay official docs
    const baseParams: Record<string, any> = {
      apiKey: apiKey,
      currencyCode: 'usdc_polygon',
      quoteCurrencyAmount: amount.toFixed(2),
      baseCurrencyCode: 'usd',
      walletAddress: walletAddress,
      colorCode: '2962FF',
      externalTransactionId: escrowId,
      showWalletAddressForm: 'false',
      debug: !useMoonPayProduction,
    };
    
    // Add email if provided
    if (email) {
      baseParams.email = email;
    }
    
    console.log('=== MoonPay Configuration ===');
    console.log('Environment:', useMoonPayProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Amount (USDC):', amount);
    console.log('Wallet:', walletAddress);
    console.log('Base params:', baseParams);
    
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
    
    console.log('Creating MoonPay SDK instance...');
    const moonPaySdk = moonPay({
      flow: 'buy',
      environment: useMoonPayProduction ? 'production' : 'sandbox',
      variant: 'overlay',
      params: finalParams as any
    });
    
    console.log('MoonPay SDK instance created:', !!moonPaySdk);
    return moonPaySdk;
    
  } catch (error) {
    console.error('=== createMoonPayOnramp ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
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
  
  // Build base parameters - FULLY LOCKED
  const baseParams: Record<string, any> = {
    apiKey: useMoonPayProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
    currencyCode: 'usdc_polygon',  // What crypto to sell
    baseCurrencyAmount: amount.toFixed(2),  // USDC amount to sell (locked)
    walletAddress: walletAddress,
    colorCode: '2962FF',
    externalTransactionId: withdrawalId,
    
    // LOCKING PARAMETERS
    lockAmount: 'true',  // Lock the crypto amount field
    showWalletAddressForm: 'false',  // Hide wallet address field (pre-filled)
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