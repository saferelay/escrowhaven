'use client';

import { useState } from 'react';

export default function MoonPayTestPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleTestTransaction = async () => {
    setLoading(true);
    setError('');
    setStatus('Loading MoonPay widget...');

    try {
      // Import MoonPay SDK
      const { loadMoonPay } = await import('@moonpay/moonpay-js');
      
      // Initialize SDK
      const moonPay = await loadMoonPay();
      
      const moonPaySdk = moonPay({
        flow: 'buy',
        environment: 'sandbox',
        variant: 'overlay',
        params: {
          apiKey: 'pk_test_AoimiLsh01zxodm85PrpDJe0Vgqw3o',
          theme: 'light',
          baseCurrencyCode: 'usd',
          baseCurrencyAmount: '20',
          defaultCurrencyCode: 'eth'  // MoonPay requires ETH for test
        }
      });

      setStatus('MoonPay widget opened! Complete the test transaction.');
      
      // Show the widget
      moonPaySdk.show();
      
    } catch (err: any) {
      console.error('MoonPay error:', err);
      setError(err.message || 'Failed to load MoonPay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-normal text-black mb-3">
            MoonPay Test Transaction
          </h1>
          <p className="text-lg text-[#787B86]">
            Complete a test transaction to activate your MoonPay account
          </p>
        </div>

        {/* Instructions Card */}
        <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-normal text-black mb-4">Instructions:</h2>
          <ol className="space-y-2 text-[#787B86]">
            <li>1. Click the button below to open MoonPay test widget</li>
            <li>2. Use test card: <code className="bg-white px-2 py-1 rounded text-sm">4000 0209 5159 5032</code></li>
            <li>3. Any future date for expiry (e.g., 12/25)</li>
            <li>4. Any 3-digit CVV (e.g., 123)</li>
            <li>5. Complete the test purchase ($20 ETH)</li>
            <li>6. MoonPay will auto-detect your test transaction</li>
          </ol>
        </div>

        {/* Status Messages */}
        {status && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800">{status}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Test Button */}
        <button
          onClick={handleTestTransaction}
          disabled={loading}
          className="w-full py-4 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Start Test Transaction'}
        </button>

        {/* Test Card Info */}
        <div className="mt-6 border border-[#E0E2E7] rounded-lg p-4">
          <h3 className="font-medium text-black mb-2">Test Card Details:</h3>
          <div className="space-y-1 text-sm text-[#787B86] font-mono">
            <div>Card: 4000 0209 5159 5032</div>
            <div>Expiry: 12/25 (any future date)</div>
            <div>CVV: 123 (any 3 digits)</div>
            <div>Amount: $20 USD</div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a sandbox test environment. No real money will be charged. 
            After completing the test, MoonPay will automatically verify your integration within 24-72 hours.
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-[#2962FF] hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}