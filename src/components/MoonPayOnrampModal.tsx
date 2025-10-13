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
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setStatus('loading');
      setError('');
      setIframeUrl('');
      return;
    }

    const setupMoonPay = async () => {
      try {
        console.log('Setting up MoonPay iframe');

        // Get environment
        const mode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
        const apiKey = mode === 'production'
          ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
          : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;

        if (!apiKey) {
          throw new Error('MoonPay API key not configured');
        }

        // Build URL
        const baseUrl = mode === 'production'
          ? 'https://buy.moonpay.com'
          : 'https://buy-sandbox.moonpay.com';

        // Build parameters object (will be sorted by server)
        const params: Record<string, string> = {
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
          params.email = user.email;
        }

        console.log('=== MoonPay Configuration ===');
        console.log('Mode:', mode);
        console.log('Amount:', amount, 'USDC');
        console.log('Vault:', vaultAddress);

        // Sign the parameters (server will sort alphabetically)
        const signResponse = await fetch('/api/moonpay/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params })
        });

        if (!signResponse.ok) {
          const errorData = await signResponse.json();
          console.error('Signing failed:', errorData);
          throw new Error(errorData.error || 'Failed to sign MoonPay URL');
        }

        const { signature } = await signResponse.json();
        console.log('✅ URL signed successfully');

        // Build query string in alphabetical order
        const sortedKeys = Object.keys(params).sort();
        const queryParts: string[] = [];
        
        for (const key of sortedKeys) {
          queryParts.push(`${key}=${encodeURIComponent(params[key])}`);
        }
        
        const queryString = queryParts.join('&');
        
        // Build final URL with signature
        const finalUrl = `${baseUrl}?${queryString}&signature=${encodeURIComponent(signature)}`;
        
        console.log('MoonPay widget ready');
        setIframeUrl(finalUrl);
        setStatus('ready');

      } catch (err: any) {
        console.error('MoonPay setup error:', err);
        setError(err.message || 'Failed to load MoonPay');
        setStatus('error');
      }
    };

    setupMoonPay();
  }, [isOpen, vaultAddress, amount, escrowId, user?.email]);

  if (!isOpen) return null;

  const handleClose = () => {
    // If user closes with widget open, they might be completing payment
    if (status === 'ready') {
      // Optional: Show a confirmation or info message
      console.log('User closed MoonPay - payment may still be processing');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      {/* Loading State */}
      {status === 'loading' && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-medium text-black">Loading payment...</p>
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

      {/* MoonPay Iframe */}
      {status === 'ready' && iframeUrl && (
        <div className="relative w-full h-full max-w-[500px] max-h-[700px] m-4">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Info banner */}
          <div className="absolute -top-24 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-lg p-3 text-center text-sm text-[#787B86]">
            Payment processing can take 5-30 minutes. You can close this window - we'll update your escrow automatically.
          </div>
          
          {/* MoonPay iframe */}
          <iframe
            src={iframeUrl}
            className="w-full h-full rounded-xl shadow-2xl bg-white"
            allow="accelerometer; autoplay; camera; encrypted-media; gyroscope; payment"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            title="MoonPay Payment"
          />
        </div>
      )}
    </div>
  );
}