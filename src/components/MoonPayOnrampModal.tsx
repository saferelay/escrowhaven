// src/components/MoonPayOnrampModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadMoonPay } from '@moonpay/moonpay-js';

interface MoonPayOnrampModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultAddress: string;
  amount: number;
  escrowId: string;
  onSuccess?: () => void;
}

export function MoonPayOnrampModal({
  isOpen,
  onClose,
  vaultAddress,
  amount,
  escrowId,
  onSuccess
}: MoonPayOnrampModalProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [moonPaySdk, setMoonPaySdk] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (moonPaySdk) {
        try {
          moonPaySdk.close();
        } catch (e) {
          // Ignore errors on close
        }
      }
      setStatus('loading');
      setError('');
      setMoonPaySdk(null);
      return;
    }

    const setupMoonPay = async () => {
      try {
        console.log('Opening MoonPay modal');

        const mode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
        const apiKey = mode === 'production'
          ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
          : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;

        if (!apiKey) {
          throw new Error('MoonPay API key not configured');
        }

        console.log('MoonPay Environment:', mode);

        // For sandbox approval: Don't pre-fill wallet, let user enter it
        // For production: Pre-fill the vault address
        const isSandbox = mode === 'sandbox';

        const params: any = {
          apiKey: apiKey,
          currencyCode: 'usdc_polygon',
          baseCurrencyCode: 'usd',
          baseCurrencyAmount: amount.toString(),
          colorCode: '2962FF',
          externalTransactionId: escrowId,
          lockAmount: true, // Lock the amount so user can't change it
        };

        // Only add wallet address in production mode
        if (!isSandbox) {
          params.walletAddress = vaultAddress;
          params.showWalletAddressForm = false;
        } else {
          // In sandbox, show wallet form and let reviewer enter test address
          params.showWalletAddressForm = true;
          // Optionally pre-fill for convenience (reviewer can change it)
          params.walletAddress = vaultAddress;
        }
        
        if (user?.email) {
          params.email = user.email;
        }

        console.log('Full params:', params);

        // Load and initialize MoonPay SDK
        const moonPay = await loadMoonPay();
        
        console.log('Creating SDK instance...');
        
        const sdk = moonPay({
          flow: 'buy',
          environment: mode === 'production' ? 'production' : 'sandbox',
          variant: 'overlay',
          params: params
        });

        console.log('✅ MoonPay SDK initialized');
        
        setMoonPaySdk(sdk);
        setStatus('ready');

        // Show the widget
        sdk.show();
        console.log('✅ MoonPay widget displayed');

      } catch (err: any) {
        console.error('❌ MoonPay error:', err);
        console.error('Stack:', err.stack);
        setError(err.message || 'Failed to load MoonPay');
        setStatus('error');
      }
    };

    setupMoonPay();

    return () => {
      if (moonPaySdk) {
        try {
          moonPaySdk.close();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [isOpen, vaultAddress, amount, escrowId, user?.email]);

  const handleClose = () => {
    if (moonPaySdk) {
      try {
        moonPaySdk.close();
      } catch (e) {
        // Ignore
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const isSandbox = (process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox') === 'sandbox';

  // When MoonPay widget is ready, don't show backdrop - MoonPay SDK handles the overlay
  if (status === 'ready') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      {/* Loading State */}
      {status === 'loading' && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-medium text-black">Loading MoonPay...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#EF5350]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-black">Payment Setup Failed</p>
            <p className="text-sm text-[#787B86] mt-2">{error}</p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* No ready state UI - MoonPay SDK handles its own overlay */}
    </div>
  );
}