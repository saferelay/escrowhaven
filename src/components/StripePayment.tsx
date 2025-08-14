'use client';

import { useState } from 'react';
import StripeCryptoPayment from './StripeCryptoPayment';

interface PaymentSectionProps {
  escrow: any;
  isClient: boolean;
}

type PaymentMethod = 'card' | 'crypto' | 'manual';

export default function PaymentSection({ escrow, isClient }: PaymentSectionProps) {
  console.log('PaymentSection received:', { escrow, isClient });
  console.log('Escrow status:', escrow?.status);
  console.log('Is client?:', isClient);
  console.log('PaymentSection received:', { escrow, isClient });
  console.log('Escrow status:', escrow?.status);
  console.log('Is client?:', isClient);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  // Safety checks
  if (!escrow) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-800">Loading payment options...</p>
      </div>
    );
  }

  if (!escrow.status || !escrow.id || typeof escrow.amount_cents === 'undefined') {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">Error: Invalid escrow data</p>
        <p className="text-xs text-red-500 mt-1">
          Missing: {!escrow.status && 'status'} {!escrow.id && 'id'} {typeof escrow.amount_cents === 'undefined' && 'amount'}
        </p>
      </div>
    );
  }

  if (escrow.status !== 'PENDING' || !isClient) {
    return null;
  }

  const handleCardPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escrowId: escrow.id,
          paymentMethod: 'card'
        })
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestFund = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/escrow/test-fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId: escrow.id })
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Test funding failed');
      }
    } catch (error) {
      console.error('Test fund error:', error);
      alert('Test funding failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Fund Escrow</h2>
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">Select payment method:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPaymentMethod('crypto')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'crypto' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium">Card → USDC</div>
            <div className="text-xs text-gray-500 mt-1">Stripe Crypto</div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('card')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'card' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium">Card Only</div>
            <div className="text-xs text-gray-500 mt-1">Manual Convert</div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('manual')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'manual' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium">Send USDC</div>
            <div className="text-xs text-gray-500 mt-1">Direct Transfer</div>
          </button>
        </div>
      </div>

      {/* Payment Method Content */}
      {paymentMethod === 'crypto' && escrow && (
        <StripeCryptoPayment escrow={escrow} isClient={isClient} />
      )}

      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-sm text-amber-800">
              ⚠️ Card payment only - you'll need to manually convert to USDC and send to the vault.
            </p>
          </div>
          
          <button
            onClick={handleCardPayment}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Processing...' : `Pay $${escrow.amount_cents / 100} with Card`}
          </button>
        </div>
      )}

      {paymentMethod === 'manual' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-3">Send USDC directly to the vault:</p>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Vault Address:</p>
                <code className="text-xs bg-white p-2 rounded border block break-all mt-1">
                  {escrow.vault_address || 'Loading...'}
                </code>
              </div>
              
              <div>
                <p className="text-xs text-gray-600">Network:</p>
                <p className="text-sm font-medium">
                  {escrow.network === 'polygon-amoy' ? 'Polygon Amoy (Testnet)' : 'Polygon Mainnet'}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-600">Amount:</p>
                <p className="text-sm font-medium">{escrow.amount_cents / 100} USDC</p>
              </div>
            </div>

            <button
              onClick={() => setShowManualInstructions(!showManualInstructions)}
              className="text-sm text-blue-600 hover:underline mt-3"
            >
              {showManualInstructions ? 'Hide' : 'Show'} detailed instructions
            </button>
          </div>

          {showManualInstructions && (
            <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">To send USDC manually:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Ensure you have USDC on {escrow.network === 'polygon-amoy' ? 'Polygon Amoy' : 'Polygon'}</li>
                <li>Copy the vault address above</li>
                <li>Send exactly {escrow.amount_cents / 100} USDC</li>
                <li>Wait for transaction confirmation</li>
                <li>The escrow will automatically update to FUNDED</li>
              </ol>
              {escrow.network === 'polygon-amoy' && (
                <p className="text-xs text-gray-600 mt-2">
                  Need test USDC? Get some from the Polygon Amoy faucet.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Development Test Button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleTestFund}
            disabled={isLoading}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-gray-400 text-sm"
          >
            🧪 Test Fund (Dev Only - Skip Payment)
          </button>
        </div>
      )}
    </div>
  );
}