// src/components/StripeCryptoPayment.tsx
'use client';

import { useState } from 'react';

interface StripeCryptoPaymentProps {
  escrow: any;
  isClient: boolean;
}

export default function StripeCryptoPayment({ escrow, isClient }: StripeCryptoPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCryptoPayment = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Create Stripe Crypto session
      const response = await fetch('/api/stripe/crypto/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId: escrow.id })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      if (data.onramp_url) {
        // Redirect to Stripe Crypto onramp
        window.location.href = data.onramp_url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err: any) {
      console.error('Crypto payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Pay with Card → USDC</h3>
        <p className="text-sm text-blue-700">
          Use Stripe to convert your card payment directly to USDC on {escrow.network === 'polygon-amoy' ? 'Polygon Amoy (Testnet)' : 'Polygon'}.
        </p>
        <ul className="text-sm text-blue-600 mt-2 space-y-1">
          <li>• Instant conversion from USD to USDC</li>
          <li>• No crypto wallet needed</li>
          <li>• Secure payment processing by Stripe</li>
        </ul>
      </div>

      <button
        onClick={handleCryptoPayment}
        disabled={isLoading || !isClient}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${escrow.amount_cents / 100} with Card`
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Test Card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
      </div>
    </div>
  );
}