// src/components/MoonPayOnrampModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
        console.log('🌙 MoonPay Setup Starting:', { vaultAddress, amount, escrowId });

        // ✅ STEP 1: Load MoonPay SDK dynamically
        console.log('📦 Loading MoonPay SDK...');
        const { loadMoonPay } = await import('@moonpay/moonpay-js');
        
        const mode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
        const apiKey = mode === 'production'
          ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
          : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;

        if (!apiKey) {
          throw new Error('MoonPay API key not configured');
        }

        console.log('✅ MoonPay Environment:', mode);

        // ✅ STEP 2: Build base params
        const isSandbox = mode === 'sandbox';
        
        const baseParams: any = {
          apiKey: apiKey,
          currencyCode: isSandbox ? 'eth' : 'usdc_polygon',
          baseCurrencyCode: 'usd',
          baseCurrencyAmount: amount.toString(),
          colorCode: '2962FF',
          externalTransactionId: escrowId,
          lockAmount: true,
        };

        if (!isSandbox) {
          baseParams.walletAddress = vaultAddress;
          baseParams.showWalletAddressForm = false;
        } else {
          baseParams.showWalletAddressForm = true;
          baseParams.walletAddress = vaultAddress;
        }
        
        if (user?.email) {
          baseParams.email = user.email;
        }

        console.log('📝 Base params:', baseParams);

        // ✅ STEP 3: Get signature from your backend
        console.log('🔐 Requesting signature from /api/moonpay/sign...');
        
        const signResponse = await fetch('/api/moonpay/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            params: baseParams
          })
        });

        if (!signResponse.ok) {
          const errorData = await signResponse.json();
          throw new Error(`Signature failed: ${errorData.error || signResponse.statusText}`);
        }

        const { signature } = await signResponse.json();
        console.log('✅ Signature received:', signature.substring(0, 20) + '...');

        // ✅ STEP 4: Add signature to params
        const paramsWithSignature = {
          ...baseParams,
          signature: signature
        };

        console.log('📋 Full params with signature ready');

        // ✅ STEP 5: Initialize MoonPay SDK
        console.log('🚀 Initializing MoonPay SDK...');
        const moonPay = await loadMoonPay();
        
        const sdk = moonPay({
          flow: 'buy',
          environment: mode === 'production' ? 'production' : 'sandbox',
          variant: 'overlay',
          params: paramsWithSignature
        });

        console.log('✅ SDK instance created');
        
        setMoonPaySdk(sdk);
        setStatus('ready');

        // Show the widget
        console.log('💫 Displaying MoonPay widget...');
        sdk.show();

      } catch (err: any) {
        console.error('❌ MoonPay Setup Error:', err);
        console.error('Error message:', err.message);
        console.error('Full error:', err);
        
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
    </div>
  );
}