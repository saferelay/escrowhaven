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
        console.log('Opening MoonPay modal with:', { vaultAddress, amount, escrowId });

        const mode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
        const apiKey = mode === 'production'
          ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
          : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;

        if (!apiKey) {
          throw new Error('MoonPay API key not configured');
        }

        console.log('Setting up MoonPay SDK');
        console.log('Environment:', mode);

        // Build base parameters object
        const baseParams: Record<string, string> = {
          apiKey: apiKey,
          currencyCode: 'usdc_polygon',
          baseCurrencyCode: 'usd',
          baseCurrencyAmount: amount.toString(),
          walletAddress: vaultAddress,
          colorCode: '2962FF',
          externalTransactionId: escrowId,
          showWalletAddressForm: 'false'
        };
        
        if (user?.email) {
          baseParams.email = user.email;
        }

        console.log('Base params:', Object.keys(baseParams));

        // CRITICAL: Sign the parameters before passing to SDK
        // When walletAddress is present, signature is REQUIRED
        console.log('Requesting signature from server...');
        
        const signResponse = await fetch('/api/moonpay/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params: baseParams })
        });

        if (!signResponse.ok) {
          const errorData = await signResponse.json();
          console.error('Signing failed:', errorData);
          throw new Error(errorData.error || 'Failed to sign MoonPay URL');
        }

        const { signature } = await signResponse.json();
        console.log('✅ Signature received');

        // Add signature to params (explicitly type as any to bypass strict typing)
        const signedParams: any = {
          ...baseParams,
          signature: signature
        };

        console.log('Initializing MoonPay SDK with signed params');

        // Load and initialize MoonPay SDK
        const moonPay = await loadMoonPay();
        
        const sdk = moonPay({
          flow: 'buy',
          environment: mode === 'production' ? 'production' : 'sandbox',
          variant: 'overlay',
          params: signedParams
        });

        console.log('✅ MoonPay SDK initialized');
        
        setMoonPaySdk(sdk);
        setStatus('ready');

        // Show the widget
        sdk.show();
        console.log('✅ MoonPay widget displayed');

      } catch (err: any) {
        console.error('❌ MoonPay error:', err);
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      {/* Loading State */}
      {status === 'loading' && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-medium text-black">Loading MoonPay...</p>
            <p className="mt-2 text-sm text-[#787B86]">Securing your payment...</p>
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

      {/* Ready State - Widget is shown by SDK */}
      {status === 'ready' && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-black text-lg">MoonPay Ready</p>
            <p className="text-sm text-[#787B86] mt-2">
              Complete your payment in the MoonPay window
            </p>
            <div className="mt-4 p-3 bg-[#F8F9FD] rounded-lg text-left text-sm text-[#787B86]">
              <p className="mb-1">💰 <strong>Amount:</strong> ${amount.toFixed(2)} USDC</p>
              <p className="mb-1">🔐 <strong>Vault:</strong> {vaultAddress.slice(0, 8)}...{vaultAddress.slice(-6)}</p>
              <p>⏱️ <strong>Processing:</strong> 5-30 minutes</p>
            </div>
            <p className="text-xs text-[#B2B5BE] mt-3">
              You can close this window - your escrow will update automatically when payment completes
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