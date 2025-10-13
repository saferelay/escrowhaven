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

        console.log('Params:', Object.keys(params));

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

      {/* Ready State */}
      {status === 'ready' && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-black text-lg">Payment Window Open</p>
            <p className="text-sm text-[#787B86] mt-2">
              Complete your payment in the MoonPay window
            </p>
            
            {isSandbox && (
              <div className="mt-4 p-3 bg-[#FFF9E6] border border-[#F7931A] rounded-lg text-left text-xs text-[#787B86]">
                <p className="font-medium text-[#F7931A] mb-1">⚠️ Sandbox Test Mode</p>
                <p>Use MoonPay test card: <code className="bg-white px-1 rounded">4000 0209 5159 5032</code></p>
                <p className="mt-1">You can modify the wallet address in the widget if needed.</p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-[#F8F9FD] rounded-lg text-left text-sm text-[#787B86]">
              <p className="mb-1">💰 <strong>Amount:</strong> ${amount.toFixed(2)} USDC</p>
              <p className="mb-1">🔐 <strong>Vault:</strong> {vaultAddress.slice(0, 8)}...{vaultAddress.slice(-6)}</p>
              <p>⏱️ <strong>Processing:</strong> 5-30 minutes</p>
            </div>
            
            <p className="text-xs text-[#B2B5BE] mt-3">
              Your escrow will update automatically when payment completes
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-[#E0E2E7] text-[#787B86] rounded-lg hover:bg-[#D0D2D7] transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}