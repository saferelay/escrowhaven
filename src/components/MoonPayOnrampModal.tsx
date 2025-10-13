// src/components/MoonPayOnrampModal.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [status, setStatus] = useState<'loading' | 'ready' | 'complete' | 'error'>('loading');
  const [error, setError] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup
      if (pollingRef.current) clearInterval(pollingRef.current);
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

        // Build query string
        const queryParts: string[] = [];
        for (const [key, value] of Object.entries(params)) {
          queryParts.push(`${key}=${encodeURIComponent(value)}`);
        }
        const queryString = queryParts.join('&');
        
        console.log('=== MoonPay URL Construction ===');
        console.log('Base URL:', baseUrl);
        console.log('Query params:', params);
        console.log('Query string:', queryString);

        // Sign the query string
        const signResponse = await fetch('/api/moonpay/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queryString })
        });

        if (!signResponse.ok) {
          const errorData = await signResponse.json();
          console.error('Signing failed:', errorData);
          throw new Error(errorData.error || 'Failed to sign URL');
        }

        const { signature } = await signResponse.json();
        console.log('Signature received, length:', signature.length);
        
        // Build final URL with signature
        const finalUrl = `${baseUrl}?${queryString}&signature=${encodeURIComponent(signature)}`;
        
        console.log('Final URL preview:', finalUrl.substring(0, 150) + '...');
        setIframeUrl(finalUrl);
        setStatus('ready');

        // Start polling vault balance
        pollingRef.current = setInterval(async () => {
          try {
            const res = await fetch('/api/vault/balance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vaultAddress })
            });

            if (res.ok) {
              const { balance } = await res.json();

              if (balance >= amount) {
                // Success!
                if (pollingRef.current) clearInterval(pollingRef.current);
                
                setStatus('complete');
                
                setTimeout(() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }, 2000);
              }
            }
          } catch (err) {
            console.error('Balance check failed:', err);
          }
        }, 10000);

        // Stop after 30 minutes
        setTimeout(() => {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }, 30 * 60 * 1000);

      } catch (err: any) {
        console.error('MoonPay error:', err);
        setError(err.message || 'Failed to load MoonPay');
        setStatus('error');
      }
    };

    setupMoonPay();
  }, [isOpen, vaultAddress, amount, escrowId, user?.email, onSuccess, onClose]);

  if (!isOpen) return null;

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
            <p className="mt-4 font-medium text-black">Error</p>
            <p className="text-sm text-[#787B86] mt-2">{error}</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Complete State */}
      {status === 'complete' && (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-black text-lg">Escrow Funded!</p>
            <p className="text-sm text-[#787B86] mt-2">${amount.toFixed(2)} secured in vault</p>
          </div>
        </div>
      )}

      {/* MoonPay Iframe */}
      {status === 'ready' && iframeUrl && (
        <div className="relative w-full h-full max-w-[500px] max-h-[700px] m-4">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <iframe
            src={iframeUrl}
            className="w-full h-full rounded-xl shadow-2xl bg-white"
            allow="accelerometer; autoplay; camera; encrypted-media; gyroscope; payment"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      )}
    </div>
  );
}