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
    
    // ✅ DYNAMIC IMPORT: Only loads MoonPay SDK when this function is called
    console.log('🚀 Dynamically loading MoonPay SDK...');
    const { loadMoonPay } = await import('@moonpay/moonpay-js');
    const moonPay = await loadMoonPay();
    console.log('✅ MoonPay SDK loaded on-demand');
    
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
    
    console.log('Creating MoonPay SDK instance...');
    
    // CRITICAL: When using walletAddress, signature is MANDATORY (even in sandbox)
    // MoonPay will not load the widget without it
    let finalParams = baseParams;
    const signatureRequired = !!baseParams.walletAddress;
    
    if (signatureRequired) {
      console.log('⚠️  Wallet address provided - URL signing REQUIRED');
      try {
        finalParams = await signParams(baseParams);
        console.log('✅ URL signed successfully');
      } catch (error) {
        console.error('❌ URL signing failed:', error);
        throw new Error('URL signing required when using wallet address');
      }
    } else if (useMoonPayProduction) {
      console.log('Production mode - signing URL');
      try {
        finalParams = await signParams(baseParams);
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
    
    // ✅ CORRECTED: Use usdc_polygon for Polygon USDC
    const baseParams = {
      apiKey: apiKey,
      baseCurrencyCode: 'usdc_polygon',  // ✅ Changed from 'usdc'
      quoteCurrencyCode: 'usd',
      baseCurrencyAmount: amount.toFixed(2),
      walletAddress: walletAddress,
      externalTransactionId: withdrawalId,
      redirectURL: `${origin}/api/moonpay/offramp-callback?withdrawalId=${withdrawalId}`,
      ...(email && { email })
    };
    
    console.log('=== MoonPay Offramp Configuration ===');
    console.log('Environment:', useMoonPayProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Amount (USDC):', amount);
    console.log('Wallet:', walletAddress);
    console.log('Currency Code:', 'usdc_polygon');
    console.log('Redirect URL:', baseParams.redirectURL);
    
    // Sign params - always sign when using walletAddress or in production
    let finalParams: any = { ...baseParams };
    
    if (useMoonPayProduction || walletAddress) {
      console.log('⚠️  Signing URL parameters...');
      try {
        const signed = await signParams(baseParams);
        // Ensure apiKey is preserved after signing
        finalParams = {
          ...signed,
          apiKey: apiKey // Explicitly preserve apiKey
        };
        console.log('✅ URL signed successfully');
        console.log('🔍 Final params keys:', Object.keys(finalParams));
      } catch (error) {
        console.error('❌ Failed to sign MoonPay parameters:', error);
        throw new Error('Security signature required for MoonPay');
      }
    }
    
    console.log('🔵 Creating SDK instance with flow: sell');
    
    // Use 'as any' to bypass TypeScript strict checking since we've ensured apiKey exists
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