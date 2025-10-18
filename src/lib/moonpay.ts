// src/lib/moonpay.ts
// ✅ Complete implementation with Magic.link wallet integration

import { transferUSDCForOfframp } from './offramp-magic-transfer';

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

// Sign URL by having backend generate the signature
async function signUrl(params: Record<string, any>, flow: 'buy' | 'sell'): Promise<string> {
  try {
    const response = await fetch('/api/moonpay/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params, flow })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sign URL');
    }
    
    const { signature } = await response.json();
    return signature;
  } catch (error) {
    console.error('URL signing failed:', error);
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
    console.log('Input params:', { email, walletAddress, amount, escrowId });
    
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
    
    if (!apiKey) {
      throw new Error(`MoonPay API key not found for ${useMoonPayProduction ? 'production' : 'sandbox'} mode`);
    }
    
    const currencyCode = useMoonPayProduction ? 'usdc_polygon' : 'eth';
    
    const baseParams: Record<string, any> = {
      apiKey: apiKey,
      currencyCode: currencyCode,
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: amount.toFixed(2),
      colorCode: '2962FF',
      externalTransactionId: escrowId,
      lockAmount: true,
    };
    
    if (email) {
      baseParams.email = email;
    }
    
    console.log('=== MoonPay Configuration ===');
    console.log('Environment:', useMoonPayProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Currency:', currencyCode);
    console.log('Amount:', amount);
    console.log('✅ No wallet pre-fill - user will enter in widget');
    
    const moonPaySdk = moonPay({
      flow: 'buy',
      environment: useMoonPayProduction ? 'production' : 'sandbox',
      variant: 'overlay',
      params: baseParams as any
    });
    
    console.log('✅ MoonPay SDK instance created');
    return moonPaySdk;
    
  } catch (error) {
    console.error('=== createMoonPayOnramp ERROR ===');
    console.error('Error:', error);
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
  try {
    console.log('=== createMoonPayOfframp called ===');
    
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
    
    const currencyCode = useMoonPayProduction ? 'usdc_polygon' : 'eth';
    
    // Build params for offramp following MoonPay's sell flow documentation
    // baseCurrencyCode = fiat (usd), defaultCurrencyCode = crypto being sold (eth)
    const paramsForSigning: Record<string, any> = {
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: amount.toFixed(2),
      defaultCurrencyCode: currencyCode,
      walletAddress: walletAddress,
      externalTransactionId: withdrawalId,
    };
    
    if (email) {
      paramsForSigning.email = email;
    }
    
    console.log('=== MoonPay Offramp Configuration ===');
    console.log('Environment:', useMoonPayProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Crypto (defaultCurrencyCode):', currencyCode);
    console.log('Fiat (baseCurrencyCode):', 'usd');
    console.log('Amount:', amount);
    console.log('Wallet:', walletAddress);
    
    // Get signature from backend (backend will add apiKey before signing)
    const signature = await signUrl(paramsForSigning, 'sell');
    console.log('✅ URL signed successfully');
    
    // Now add apiKey AND signature for the SDK
    const paramsWithSignature = {
      apiKey: apiKey,
      ...paramsForSigning,
      signature
    };
    
    const moonPaySdk = moonPay({
      flow: 'sell',
      environment: useMoonPayProduction ? 'production' : 'sandbox',
      variant: 'overlay',
      params: paramsWithSignature as any,
      handlers: {
        onInitiateDeposit: (async (depositInfo: any) => {
          console.log('✅ User initiated deposit');
          console.log('Deposit info:', depositInfo);
          
          const { depositWalletAddress, cryptoAmount, cryptoCurrencyCode } = depositInfo;
          
          try {
            console.log(`Sending ${cryptoAmount} ${cryptoCurrencyCode} to ${depositWalletAddress}...`);
            
            // Use Magic.link to send USDC to MoonPay's deposit address
            const result = await transferUSDCForOfframp(
              depositWalletAddress,
              parseFloat(cryptoAmount)
            );
            
            if (result.success) {
              console.log('✅ Transaction successful:', result.txHash);
              
              // Return transaction hash to MoonPay
              return {
                transactionHash: result.txHash
              };
            } else {
              console.error('❌ Transaction failed:', result.error);
              throw new Error(result.error || 'Transaction failed');
            }
          } catch (error: any) {
            console.error('❌ Transfer error:', error);
            alert(`Transaction failed: ${error.message}`);
            throw error;
          }
        }) as any,
        onTransactionCompleted: (async (transaction: any) => {
          console.log('✅ MoonPay transaction completed:', transaction);
          alert('Withdrawal successful! Funds will arrive in your bank account soon.');
        }) as any,
        onClose: (async () => {
          console.log('Widget closed');
        }) as any
      }
    });
    
    console.log('✅ MoonPay Offramp SDK instance created');
    return moonPaySdk;
    
  } catch (error) {
    console.error('=== createMoonPayOfframp ERROR ===');
    console.error('Error:', error);
    throw error;
  }
}