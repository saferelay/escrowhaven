// src/lib/moonpay-offramp.ts - Official MoonPay SDK Integration (Fixed)
import { loadMoonPay } from '@moonpay/moonpay-js';
import { ethers } from 'ethers';

const MOONPAY_API_KEY = process.env.NEXT_PUBLIC_MOONPAY_PUBLISHABLE_KEY || '';
const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com';
const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

export interface MoonPayOfframpConfig {
  email: string;
  usdcAmount: number;
  withdrawalId: string;
  userWalletAddress: string;
  isTestMode?: boolean;
}

/**
 * Open MoonPay Offramp Widget using Official SDK
 * Following MoonPay's 1-click integration guide
 */
export async function openMoonPayOfframpWidget(config: MoonPayOfframpConfig): Promise<void> {
  try {
    console.log('[MoonPay SDK] Initializing offramp widget...');
    
    // Load MoonPay SDK
    const moonPay = await loadMoonPay();
    
    // Initialize SDK with sell flow
    const moonPaySdk = moonPay({
      flow: 'sell', // CRITICAL: 'sell' for offramp
      environment: config.isTestMode ? 'sandbox' : 'production',
      variant: 'overlay', // Opens as modal overlay
      params: {
        // API Key
        apiKey: MOONPAY_API_KEY,
        
        // Crypto to sell
        baseCurrencyCode: 'usdc_polygon', // USDC on Polygon
        baseCurrencyAmount: config.usdcAmount.toString(),
        
        // Fiat currency (default, user can change)
        defaultCurrencyCode: 'usd',
        
        // User wallet address (from Privy)
        walletAddress: config.userWalletAddress,
        
        // User email (pre-fill KYC)
        email: config.email,
        
        // External tracking ID
        externalTransactionId: config.withdrawalId,
        
        // Theme
        theme: 'light',
        colorCode: '#2962FF',
        
        // Lock amount (user can't edit) - MUST BE STRING
        lockAmount: 'true',
        
        // Redirect after completion
        redirectURL: `${window.location.origin}/dashboard?withdrawal=complete&id=${config.withdrawalId}`,
      }
    });
    
    // Note: Event listeners may not be available in all SDK versions
    // If you need event tracking, use postMessage listeners instead
    // or check MoonPay docs for your SDK version
    
    // Show the widget
    moonPaySdk.show();
    console.log('[MoonPay SDK] Widget displayed');
    
    // Listen for widget close via postMessage (alternative to .on())
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === 'https://buy.moonpay.com' || event.origin === 'https://buy-staging.moonpay.com') {
        console.log('[MoonPay SDK] Message received:', event.data);
        
        if (event.data.type === 'close') {
          window.dispatchEvent(new Event('moonpay-closed'));
          window.removeEventListener('message', handleMessage);
        }
        
        if (event.data.type === 'transaction_created') {
          window.dispatchEvent(new CustomEvent('moonpay-transaction-created', { detail: event.data }));
        }
        
        if (event.data.type === 'transaction_completed') {
          window.dispatchEvent(new CustomEvent('moonpay-transaction-completed', { detail: event.data }));
        }
        
        if (event.data.type === 'transaction_failed') {
          window.dispatchEvent(new CustomEvent('moonpay-transaction-failed', { detail: event.data }));
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
  } catch (error) {
    console.error('[MoonPay SDK] Failed to initialize widget:', error);
    throw error;
  }
}

/**
 * Check USDC balance before withdrawal
 */
export async function checkUsdcBalance(
  walletAddress: string,
  requiredAmount: number
): Promise<{ hasEnough: boolean; balance: string }> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC);
    const abi = ['function balanceOf(address owner) view returns (uint256)'];
    const contract = new ethers.Contract(USDC_ADDRESS, abi, provider);
    
    const balance = await contract.balanceOf(walletAddress);
    const formatted = ethers.utils.formatUnits(balance, 6);
    const hasEnough = parseFloat(formatted) >= requiredAmount;
    
    console.log('[MoonPay] Balance check:', {
      wallet: walletAddress,
      balance: formatted,
      required: requiredAmount,
      hasEnough
    });
    
    return { hasEnough, balance: formatted };
  } catch (error) {
    console.error('[MoonPay] Balance check failed:', error);
    return { hasEnough: true, balance: '0' };
  }
}

