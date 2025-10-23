// src/lib/offramp.ts - Production Onramp Offramp Integration
import { ethers } from 'ethers';

const ONRAMP_APP_ID = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || '1687307';
const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com';
const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Polygon USDC

export interface OfframpConfig {
  email: string;
  usdcAmount: number;
  withdrawalId: string;
  userWalletAddress: string;
  isTestMode?: boolean;
}

/**
 * Create Onramp offramp (sell) widget URL
 * Based on Onramp documentation for hosted mode
 */
export function createOfframpWidget(config: OfframpConfig): string {
  try {
    // Always use production for offramp - per Onramp docs
    const baseUrl = 'https://onramp.money/main/sell';

    const params = new URLSearchParams();
    
    // Required parameters (per Onramp docs)
    params.append('appId', ONRAMP_APP_ID);
    params.append('walletAddress', config.userWalletAddress);
    
    // Crypto parameters - using Onramp's expected format
    // Note: For offramp, Onramp may expect different coin codes than onramp
    params.append('coinCode', 'USDC');  // Standard coin code
    params.append('network', 'matic20'); // Polygon network
    
    // Amount - what user is selling in USDC
    params.append('coinAmount', config.usdcAmount.toFixed(2));
    
    // Fiat currency - what user receives (commented out to let Onramp detect from location)
    // If USD is not supported for your account, try removing this or letting user select
    // params.append('fiatCurrency', 'USD');
    
    // User info
    params.append('userEmail', config.email);
    
    // Tracking/webhook identifier
    params.append('merchantRecognitionId', config.withdrawalId);
    
    // UX preferences
    params.append('isAmountEditable', 'false');
    params.append('isCoinCodeEditable', 'false');
    
    // Theme
    params.append('primaryColor', '2962FF');
    params.append('secondaryColor', '1E53E5');
    
    // Redirect URL with placeholders that Onramp will replace
    if (typeof window !== 'undefined') {
      const redirectUrl = `${window.location.origin}/dashboard?withdrawal=complete&orderId={orderId}&status={status}`;
      params.append('redirectUrl', redirectUrl);
    }

    const url = `${baseUrl}?${params.toString()}`;
    console.log('[Offramp] Widget URL:', url);
    return url;
  } catch (error) {
    console.error('[Offramp] Error generating widget URL:', error);
    throw error;
  }
}

/**
 * Open offramp widget
 * Using popup window for better compatibility (per best practices)
 */
export function openOfframpWidget(config: OfframpConfig): void {
  try {
    const url = createOfframpWidget(config);
    
    console.log('[Offramp] Opening withdrawal widget...');
    
    // Try popup first (recommended for payment flows)
    const width = 450;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      url,
      'OnrampWithdrawal',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      console.warn('[Offramp] Popup blocked, using iframe fallback');
      openOfframpIframe(url);
      return;
    }
    
    popup.focus();
    
    // Monitor popup
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        console.log('[Offramp] Widget closed');
        // Optionally trigger a refresh or callback here
        window.dispatchEvent(new Event('onramp-closed'));
      }
    }, 1000);
    
  } catch (error) {
    console.error('[Offramp] Failed to open widget:', error);
    throw error;
  }
}

/**
 * Fallback: Open in iframe with overlay
 */
function openOfframpIframe(url: string): void {
  // Remove existing container
  const existing = document.getElementById('onramp-widget-container');
  if (existing) existing.remove();
  
  // Create overlay container
  const container = document.createElement('div');
  container.id = 'onramp-widget-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  `;
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.allow = 'camera; microphone; payment; clipboard-read; clipboard-write';
  iframe.style.cssText = `
    width: 450px;
    height: 700px;
    max-width: 95vw;
    max-height: 95vh;
    border: none;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    background: white;
  `;
  
  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: white;
    color: #000;
    font-size: 24px;
    font-weight: 300;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    z-index: 10000;
  `;
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.transform = 'scale(1.1)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.transform = 'scale(1)';
  });
  closeBtn.addEventListener('click', () => {
    container.remove();
    window.dispatchEvent(new Event('onramp-closed'));
  });
  
  // Append elements
  container.appendChild(iframe);
  container.appendChild(closeBtn);
  document.body.appendChild(container);
  
  // Close on background click
  container.addEventListener('click', (e) => {
    if (e.target === container) {
      container.remove();
      window.dispatchEvent(new Event('onramp-closed'));
    }
  });
  
  // Close on ESC key
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      container.remove();
      window.dispatchEvent(new Event('onramp-closed'));
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

/**
 * Check if wallet has enough USDC for withdrawal
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
    const formatted = ethers.utils.formatUnits(balance, 6); // USDC has 6 decimals
    const hasEnough = parseFloat(formatted) >= requiredAmount;
    
    console.log('[Offramp] Balance check:', {
      wallet: walletAddress,
      balance: formatted,
      required: requiredAmount,
      hasEnough
    });
    
    return {
      hasEnough,
      balance: formatted
    };
  } catch (error) {
    console.error('[Offramp] Balance check failed:', error);
    // Don't block user - let Onramp handle the balance check
    return { hasEnough: true, balance: '0' };
  }
}