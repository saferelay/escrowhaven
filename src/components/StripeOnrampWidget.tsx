// src/components/StripeOnrampWidget.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    StripeOnramp: any;
    Stripe: any;
  }
}

interface StripeOnrampWidgetProps {
  clientSecret: string;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export function StripeOnrampWidget({ 
  clientSecret, 
  onComplete, 
  onError 
}: StripeOnrampWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const [vpnDetected, setVpnDetected] = useState(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const loadWithTimeout = async () => {
      const timeout = setTimeout(() => {
        setVpnDetected(true);
        setIsLoading(false);
        setError('Payment form blocked by VPN/network. Please disable VPN and try again.');
      }, 10000); // 10 second timeout for VPN users

      try {
        // Load scripts
        if (!window.Stripe) {
          const script1 = document.createElement('script');
          script1.src = 'https://js.stripe.com/basil/stripe.js';
          document.head.appendChild(script1);
          await new Promise((resolve, reject) => {
            script1.onload = resolve;
            script1.onerror = reject;
          });
        }

        if (!window.StripeOnramp) {
          const script2 = document.createElement('script');
          script2.src = 'https://crypto-js.stripe.com/crypto-onramp-outer.js';
          document.head.appendChild(script2);
          await new Promise((resolve, reject) => {
            script2.onload = resolve;
            script2.onerror = reject;
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        clearTimeout(timeout);

        if (!window.StripeOnramp) {
          throw new Error('Scripts loaded but StripeOnramp not available');
        }

        const stripeOnramp = window.StripeOnramp(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        );
        
        const session = stripeOnramp.createSession({ 
          clientSecret: clientSecret,
          appearance: { theme: 'light' }
        });

        session.addEventListener('onramp_session_updated', (e: any) => {
          console.log('Status:', e.payload.session.status);
          if (e.payload.session.status === 'fulfillment_complete') {
            if (onComplete) onComplete();
          }
        });

        session.addEventListener('onramp_ui_loaded', () => {
          setIsLoading(false);
        });

        if (containerRef.current) {
          session.mount(containerRef.current);
        }

      } catch (err: any) {
        clearTimeout(timeout);
        console.error('Error:', err);
        setError('Failed to load payment form. VPN or network may be blocking Stripe.');
        setIsLoading(false);
      }
    };

    loadWithTimeout();
  }, [clientSecret, onComplete, onError]);

  if (error || vpnDetected) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4">
          <div className="text-red-600 font-medium mb-2">Payment Form Blocked</div>
          <p className="text-sm text-gray-600">
            {vpnDetected 
              ? "VPN detected. Stripe requires VPN to be disabled for security."
              : error}
          </p>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            To continue:
            <ol className="mt-2 text-left inline-block">
              <li>1. Disable VPN (Opera's built-in VPN or any other)</li>
              <li>2. Refresh this page</li>
              <li>3. Try again</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry After Disabling VPN
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full mb-3" />
          <span>Loading payment form...</span>
          <span className="text-xs text-gray-500 mt-2">If using VPN, this may not load</span>
        </div>
      )}
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          minHeight: '600px',
          display: isLoading ? 'none' : 'block'
        }}
      />
    </>
  );
}