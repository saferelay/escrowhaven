// src/components/MoonPayTestTransaction.tsx
// Temporary component to complete required test transaction for MoonPay activation

'use client';

import { useState } from 'react';
import { createMoonPayTestWidget } from '@/lib/moonpay';

export function MoonPayTestTransaction() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const handleTestTransaction = async () => {
    try {
      setLoading(true);
      const widget = await createMoonPayTestWidget();
      widget.show();
      
      // Note: Test transaction will complete in MoonPay's system
      // They will automatically detect it for activation
      
      setTimeout(() => {
        setCompleted(true);
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error('Test transaction error:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm shadow-lg">
      <h4 className="font-medium text-yellow-900 mb-2">
        MoonPay Activation Required
      </h4>
      
      <p className="text-sm text-yellow-800 mb-3">
        Complete a test transaction to activate MoonPay live mode.
      </p>
      
      {!completed ? (
        <>
          <button
            onClick={handleTestTransaction}
            disabled={loading}
            className="w-full bg-yellow-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Loading Test Widget...' : 'Start Test Transaction'}
          </button>
          
          <div className="mt-3 text-xs text-yellow-700 space-y-1">
            <p>• Use card: 4000 0209 5159 5032</p>
            <p>• Expiry: 12/25, CVV: 123</p>
            <p>• Purchase $100 of ETH (test)</p>
          </div>
        </>
      ) : (
        <div className="text-sm text-green-700">
          ✓ Test widget launched! Complete the purchase to activate.
        </div>
      )}
    </div>
  );
}

