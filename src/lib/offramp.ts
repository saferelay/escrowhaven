// src/lib/offramp.ts - FIXED WITH WALLET CONNECTION
import { ethers } from 'ethers';

const ONRAMP_APP_ID = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || '1687307';
const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com';
const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Polygon USDC

export interface OfframpConfig {
  email: string;
  usdcAmount: number;              // Amount to withdraw
  withdrawalId: string;            // Order ID
  userWalletAddress: string;       // User's wallet (from Privy)
  isTestMode?: boolean;
}

/**
 * Create Onramp offramp (sell) widget URL
 * User sells USDC, receives fiat to bank account
 */
export function createOfframpWidget(config: OfframpConfig): string {
  try {
    const baseUrl = config.isTestMode
      ? 'https://sandbox.onramp.money/main/sell'
      : 'https://onramp.money/main/sell';

    const params = new URLSearchParams();
    
    // Required
    params.append('appId', ONRAMP_APP_ID);
    params.append('walletAddress', config.userWalletAddress);
    
    // USDC on Polygon
    params.append('coinCode', 'USDC');
    params.append('network', 'matic20');  // Correct network code for Polygon
    params.append('coinAmount', config.usdcAmount.toFixed(2));
    
    // UX - lock amount/coin
    params.append('isAmountEditable', 'false');
    params.append('isCoinCodeEditable', 'false');
    params.append('isFiatCurrencyEditable', 'true');
    
    // Tracking
    params.append('userEmail', config.email);
    params.append('merchantRecognitionId', config.withdrawalId);
    
    // Theme
    params.append('primaryColor', '2962FF');
    params.append('secondaryColor', '1E53E5');
    params.append('isDarkMode', 'false');
    
    // Redirect after completion
    if (typeof window !== 'undefined') {
      const redirectUrl = `${window.location.origin}/dashboard?withdrawal=complete&orderId={orderId}&status={status}`;
      params.append('redirectUrl', redirectUrl);
    }

    const url = `${baseUrl}?${params.toString()}`;
    console.log('[Offramp] Generated withdraw widget URL:', url);
    return url;
  } catch (error) {
    console.error('[Offramp] Error generating widget URL:', error);
    throw error;
  }
}

/**
 * Open offramp widget in overlay mode (embedded in page)
 * Onramp will request wallet connection via WalletConnect
 */
export function openOfframpWidget(config: OfframpConfig): void {
  try {
    const url = createOfframpWidget(config);
    
    // Add 'widgetMode=overlay' to embed widget in the page
    const overlayUrl = url.includes('?') 
      ? `${url}&widgetMode=overlay` 
      : `${url}?widgetMode=overlay`;
    
    // Create container for overlay if it doesn't exist
    let container = document.getElementById('onramp-widget-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'onramp-widget-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      document.body.appendChild(container);
    }
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = overlayUrl;
    iframe.style.cssText = `
      width: 500px;
      height: 700px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;
    
    container.innerHTML = '';
    container.appendChild(iframe);
    
    // Close on background click
    container.addEventListener('click', (e) => {
      if (e.target === container) {
        container.remove();
      }
    });
    
    console.log('[Offramp] Withdraw widget opened in overlay mode - WalletConnect will handle connection');
  } catch (error) {
    console.error('[Offramp] Failed to open offramp widget:', error);
    throw error;
  }
}

/**
 * OPTIONAL: Pre-check wallet has enough USDC before showing offramp
 * This improves UX by catching issues early
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
    
    return {
      hasEnough,
      balance: formatted
    };
  } catch (error) {
    console.error('[Offramp] Balance check failed:', error);
    // Don't block the user - let Onramp handle it
    return { hasEnough: true, balance: '0' };
  }
}
