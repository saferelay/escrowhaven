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
    
    // Important: Network selection (Polygon)
    params.append('network', 'polygon');

    const url = `${baseUrl}?${params.toString()}`;
    console.log('[Onramp] Generated deposit widget URL:', url);
    return url;
  } catch (error) {
    console.error('[Onramp] Error generating widget URL:', error);
    throw error;
  }
}

/**
 * Open deposit widget with proper error handling
 */
export function openDepositWidget(config: OnrampDirectConfig): void {
  try {
    const url = createOnrampDirectWidget(config);
    
    // Open in popup (better than new tab for modal feel)
    const popup = window.open(url, 'onramp_deposit', 'width=500,height=700,resizable=yes,scrollbars=yes');
    
    if (!popup) {
      console.error('[Onramp] Popup blocked - trying direct navigation');
      window.location.href = url;
    } else {
      console.log('[Onramp] Deposit widget opened in popup');
    }
  } catch (error) {
    console.error('[Onramp] Failed to open deposit widget:', error);
    throw error;
  }
}

// Functions are already exported above - no need to re-export