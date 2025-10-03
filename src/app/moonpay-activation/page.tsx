// src/app/moonpay-activation/page.tsx
// Protected version with secret URL parameter

'use client';

import { loadMoonPay } from '@moonpay/moonpay-js';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MoonPayActivationPage() {
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');


  useEffect(() => {
    // Simple protection - require a secret parameter
    const key = searchParams.get('key');
    if (key === 'activate2024') {
      setAuthorized(true);
    }
  }, [searchParams]);

  const handleTest = async () => {
    try {
      setStatus('loading');
      const moonPay = await loadMoonPay();
      
      const widget = moonPay({
        flow: 'buy',
        environment: 'sandbox',
        variant: 'overlay',
        params: {
          apiKey: 'pk_test_1Ggn4ZC8XVyBJhHROwNJbAMqKHpJuCv',
          theme: 'light',
          baseCurrencyCode: 'usd',
          baseCurrencyAmount: '100',
          defaultCurrencyCode: 'eth',
          colorCode: '#2962FF'
        }
      });
      
      widget.show();
      setStatus('success');
    } catch (error: any) {
      console.error('Test error:', error);
      setStatus('error');
      setErrorMsg(error.message || 'Failed to load widget');
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    );
  }
  
  // Rest of the component remains the same...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            MoonPay Account Activation
          </h1>
          <p className="text-sm text-gray-600">
            One-time test transaction required
          </p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-900 mb-2">Test Card Details</h3>
          <div className="space-y-2 text-sm text-amber-800">
            <div className="font-mono bg-white rounded px-2 py-1">
              Card: 4000 0209 5159 5032
            </div>
            <div className="font-mono bg-white rounded px-2 py-1">
              Expiry: 12/25 • CVV: 123
            </div>
          </div>
        </div>
        
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">
              ✓ Widget loaded! Complete the test purchase.
            </p>
          </div>
        )}
        
        <button
          onClick={handleTest}
          disabled={status === 'loading'}
          className="w-full bg-[#2962FF] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1E53E5] transition disabled:opacity-50"
        >
          {status === 'loading' ? 'Loading...' : 'Start Test Transaction'}
        </button>
      </div>
    </div>
  );
}