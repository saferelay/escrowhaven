// src/components/escrow/DisputePaymentModal.tsx
'use client';

import { useState } from 'react';

interface DisputePaymentModalProps {
  escrow: any;
  userEmail?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DisputePaymentModal({ escrow, userEmail, onClose, onSuccess }: DisputePaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleInitiateDispute = async () => {
    if (!confirm(
      'Initiate Kleros Arbitration?\n\n' +
      '• Cost: $350 (non-refundable)\n' +
      '• Resolution: 7-14 days\n' +
      '• Decision is final and automatic\n\n' +
      'Continue?'
    )) return;

    setLoading(true);
    try {
      // For now, just mark as initiated
      // Later we'll add payment flow
      alert('Dispute payment flow will be implemented here');
      onSuccess();
    } catch (error) {
      console.error('Failed to initiate dispute:', error);
      alert('Failed to initiate dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Request Kleros Arbitration</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Independent Blockchain Arbitration
            </p>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Cost: $350 (one-time, non-refundable)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Resolution time: 7-14 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Decision is final and automatically executed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Evidence submitted directly to Kleros Court</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleInitiateDispute}
              disabled={loading}
              className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all text-sm font-medium"
            >
              {loading ? 'Processing...' : 'Continue to Payment ($350)'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}