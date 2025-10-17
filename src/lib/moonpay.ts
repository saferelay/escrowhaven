// src/lib/moonpay.ts
// ✅ NO TOP-LEVEL IMPORTS - Dynamic loading only when needed

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

// Sign parameters server-side - returns just the signature string
async function signParams(params: Record<string, any>): Promise<string> {
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
    
    const { signature } = await response.json();
    return signature;
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
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required');
    }
    if (!escrowId) {
      throw new Error('Escrow ID is required');
    }
    
    console.log('🚀 Dynamically loading MoonPay SDK...');
    const { loadMoonPay } = await import('@moonpay/moonpay-js');
    const moonPay = await loadMoonPay();
    console.log('✅ MoonPay SDK loaded on-demand');
    
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
    
    if (email) {
      baseParams.email = email;
    }
    
    console.log('=== MoonPay Configuration ===');
    console.log('Environment:', useMoonPayProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Amount (USDC):', amount);
    console.log('Wallet:', walletAddress);
    
    let finalParams = baseParams;
    const signatureRequired = !!baseParams.walletAddress;
    
    if (signatureRequired) {
      console.log('⚠️  Wallet address provided - URL signing REQUIRED');
      try {
        const signature = await signParams(baseParams);
        finalParams = { ...baseParams, signature };
        console.log('✅ URL signed successfully');
      } catch (error) {
        console.error('❌ URL signing failed:', error);
        throw new Error('URL signing required when using wallet address');
      }
    } else if (useMoonPayProduction) {
      console.log('Production mode - signing URL');
      try {
        const signature = await signParams(baseParams);
        finalParams = { ...baseParams, signature };
        console.log('✅ MoonPay parameters signed for production');
      } catch (error) {
        console.error('❌ Failed to sign MoonPay parameters:', error);
        throw new Error('Security signature required for MoonPay production');
      }
    } else {
      console.log('ℹ️ MoonPay sandbox mode - no wallet address, skipping signature');
    }
    
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

// Off-ramp: Withdraw to bank (with programmatic transfer support)
export async function createMoonPayOfframp({
  email,
  walletAddress,
  amount,
  withdrawalId,
  isTestMode = false
}: MoonPayOfframpConfig) {
  try {
    console.log('=== createMoonPayOfframp called ===');
    console.log('Input params:', { email, walletAddress, amount, withdrawalId, isTestMode });
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required');
    }
    if (!withdrawalId) {
      throw new Error('Withdrawal ID is required');
    }
    
    console.log('🚀 Dynamically loading MoonPay SDK for off-ramp...');
    const { loadMoonPay } = await import('@moonpay/moonpay-js');
    const moonPay = await loadMoonPay();
    console.log('✅ MoonPay SDK loaded on-demand');
    
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const useMoonPayProduction = moonPayMode === 'production';
    
    const apiKey = useMoonPayProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;
    
    if (!apiKey) {
      throw new Error(`MoonPay API key not found for ${useMoonPayProduction ? 'production' : 'sandbox'} mode`);
    }
    
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const baseParams: Record<string, any> = {
      apiKey: apiKey,
      baseCurrencyCode: 'usdc_polygon',
      quoteCurrencyCode: 'usd',
      baseCurrencyAmount: amount.toFixed(2),
      walletAddress: walletAddress,
      externalTransactionId: withdrawalId,
      redirectURL: `${origin}/api/moonpay/offramp-callback?withdrawalId=${withdrawalId}`,
    };
    
    if (email) {
      baseParams.email = email;
    }
    
    console.log('=== MoonPay Offramp Configuration ===');
    console.log('Environment:', useMoonPayProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Amount (USDC):', amount);
    console.log('Wallet:', walletAddress);
    console.log('Currency Code:', 'usdc_polygon');
    console.log('Redirect URL:', baseParams.redirectURL);
    
    let finalParams: any = { ...baseParams };
    
    if (useMoonPayProduction || walletAddress) {
      console.log('⚠️  Signing URL parameters...');
      try {
        const signature = await signParams(baseParams);
        finalParams = {
          ...baseParams,
          signature
        };
        console.log('✅ URL signed successfully');
        console.log('🔍 Signature:', signature);
      } catch (error) {
        console.error('❌ Failed to sign MoonPay parameters:', error);
        throw new Error('Security signature required for MoonPay');
      }
    }
    
    console.log('🔵 Creating SDK instance with flow: sell');
    
    const moonPaySdk = moonPay({
      flow: 'sell',
      environment: useMoonPayProduction ? 'production' : 'sandbox',
      variant: 'overlay',
      params: finalParams as any
    });
    
    console.log('✅ MoonPay Offramp SDK instance created:', !!moonPaySdk);
    
    return moonPaySdk;
    
  } catch (error) {
    console.error('=== createMoonPayOfframp ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}