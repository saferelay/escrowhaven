// src/lib/moonpay.ts
// ✅ FIXED: Exposes Magic globally so MoonPay handlers can access it

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

    // 🔥 CRITICAL FIX: Make Magic globally available BEFORE opening widget
    console.log('🔧 Exposing Magic globally for MoonPay handlers...');
    const { getMagicInstance } = await import('./magic');
    const magicInstance = getMagicInstance();
    
    if (!magicInstance) {
      throw new Error('Magic wallet not initialized. Please connect your wallet first.');
    }
    
    // Check if user is logged in BEFORE opening the widget
    const isLoggedIn = await magicInstance.user.isLoggedIn();
    if (!isLoggedIn) {
      throw new Error('Please connect your wallet before withdrawing.');
    }
    
    // ✅ Make Magic globally accessible for the handler
    if (typeof window !== 'undefined') {
      (window as any).escrowhavenMagic = magicInstance;
      console.log('✅ Magic instance attached to window.escrowhavenMagic');
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
    
    const sdkParams: Record<string, any> = {
      apiKey: apiKey,
      currencyCode: currencyCode,
      quoteCurrencyCode: 'usd',
      baseCurrencyAmount: amount.toFixed(2),
      walletAddress: walletAddress,
      externalTransactionId: withdrawalId,
    };
    
    if (email) {
      sdkParams.email = email;
    }
    
    console.log('=== MoonPay Offramp Configuration ===');
    console.log('Environment:', useMoonPayProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Currency:', currencyCode);
    console.log('Amount:', amount);
    console.log('Wallet:', walletAddress);
    console.log('✅ SDK params prepared');
    
    const moonPaySdk = moonPay({
      flow: 'sell',
      environment: useMoonPayProduction ? 'production' : 'sandbox',
      variant: 'overlay',
      params: sdkParams as any,
      handlers: {
        onInitiateDeposit: (async (depositInfo: any) => {
          console.log('✅ User clicked "Send with escrowhaven.io"');
          console.log('Deposit info:', depositInfo);
          
          const { depositWalletAddress, cryptoAmount, cryptoCurrencyCode } = depositInfo;
          
          try {
            console.log(`Preparing to send ${cryptoAmount} ${cryptoCurrencyCode} to ${depositWalletAddress}...`);
            
            // Access Magic from global window object
            const magic = (window as any).escrowhavenMagic;
            
            if (!magic) {
              throw new Error('Magic wallet not found. Please refresh and try again.');
            }
            
            console.log('✅ Magic instance retrieved from window');
            console.log('Calling transferUSDCForOfframp...');
            
            // Use Magic.link to send USDC to MoonPay's deposit address
            const result = await transferUSDCForOfframp(
              depositWalletAddress,
              parseFloat(cryptoAmount)
            );
            
            if (result.success) {
              console.log('✅ Transaction successful:', result.txHash);
              alert(`Transaction sent successfully!\n\nHash: ${result.txHash}\n\nYour withdrawal will be processed shortly.`);
              
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
          alert('🎉 Withdrawal successful! Funds will arrive in your bank account soon.');
        }) as any,
        onClose: (async () => {
          console.log('Widget closed');
          // Clean up global Magic reference
          if (typeof window !== 'undefined') {
            delete (window as any).escrowhavenMagic;
            console.log('🧹 Cleaned up Magic instance from window');
          }
        }) as any
      }
    });
    
    console.log('✅ MoonPay Offramp SDK instance created');
    return moonPaySdk;
    
  } catch (error) {
    console.error('=== createMoonPayOfframp ERROR ===');
    console.error('Error:', error);
    // Clean up on error
    if (typeof window !== 'undefined') {
      delete (window as any).escrowhavenMagic;
    }
    throw error;
  }
}