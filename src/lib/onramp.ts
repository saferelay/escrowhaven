// src/lib/onramp.ts - FIXED WITH WALLET INTEGRATION
import type { SupabaseClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const ONRAMP_APP_ID = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || '1687307';
const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com';

export interface OnrampDirectConfig {
  email: string;
  targetUsdcAmount: number;       // e.g., 125.50
  escrowId: string;
  vaultAddress: string;           // wallet to receive USDC
  isTestMode: boolean;
}

/**
 * Create Onramp direct widget URL (deposit flow - no smart contract call)
 * User buys USDC which gets sent to vaultAddress
 */
export function createOnrampDirectWidget(config: OnrampDirectConfig): string {
  try {
    // Use correct Onramp endpoint - /app/ for buy/onramp
    const baseUrl = config.isTestMode
      ? 'https://sandbox.onramp.money/app'
      : 'https://onramp.money/app';

    // Build query params exactly as Onramp expects
    const params = new URLSearchParams();
    
    // Required
    params.append('appId', ONRAMP_APP_ID);
    params.append('walletAddress', config.vaultAddress);
    params.append('coinCode', 'USDC');
    params.append('coinAmount', config.targetUsdcAmount.toFixed(2));
    
    // UX settings - lock amount/coin for clarity
    params.append('isAmountEditable', 'false');
    params.append('isCoinCodeEditable', 'false');
    params.append('isFiatCurrencyEditable', 'true');
    
    // Tracking
    params.append('userEmail', config.email);
    params.append('partnerOrderId', config.escrowId);
    
    // Theme (hex without #)
    params.append('primaryColor', '2962FF');      // Your brand blue
    params.append('secondaryColor', '1E53E5');    // Hover blue
    params.append('isDarkMode', 'false');
    
    // Important: Network selection (Polygon - use 'matic20' for Onramp)
    params.append('network', 'matic20');

    const url = `${baseUrl}?${params.toString()}`;
    console.log('[Onramp] Generated deposit widget URL:', url);
    return url;
  } catch (error) {
    console.error('[Onramp] Error generating widget URL:', error);
    throw error;
  }
}

/**
 * Open deposit widget in overlay mode (embedded in page)
 */
export function openDepositWidget(config: OnrampDirectConfig): void {
  try {
    const url = createOnrampDirectWidget(config);
    
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
    
    console.log('[Onramp] Deposit widget opened in overlay mode');
  } catch (error) {
    console.error('[Onramp] Failed to open deposit widget:', error);
    throw error;
  }
}

// Functions are already exported above - no need to re-export