// src/components/dashboard/OffRampModal.tsx
import { useEffect, useState } from 'react';

interface OffRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;
  userEmail: string;
  walletAddress: string;
  withdrawalId: string;
}

export function OffRampModal({ 
  isOpen, 
  onClose, 
  availableAmount, 
  userEmail, 
  walletAddress,
  withdrawalId 
}: OffRampModalProps) {
  const [offRampUrl, setOffRampUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && availableAmount > 0) {
      // Build the Onramp off-ramp URL with proper parameters
      const params = new URLSearchParams({
        appId: process.env.NEXT_PUBLIC_ONRAMP_APP_ID || '1687307',
        walletAddress: walletAddress,
        coinCode: 'usdc',
        network: 'matic20',
        coinAmount: availableAmount.toFixed(6),
        merchantRecognitionId: withdrawalId,
        fiatType: '1', // 1 = INR, 2 = TRY, etc. Check which currencies Onramp supports
        redirectUrl: `${window.location.origin}/dashboard?withdrawal=complete`,
      });
      
      
      // Use the SELL endpoint for off-ramp
      setOffRampUrl(`https://onramp.money/main/sell/?${params.toString()}`);
      setLoading(false);
    }
  }, [isOpen, availableAmount, walletAddress, withdrawalId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-[520px] w-full flex flex-col shadow-2xl" style={{ height: 'auto', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Withdraw ${availableAmount.toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Convert USDC to your bank account
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Info section */}
        <div className="px-6 py-3 bg-green-50 border-b border-green-100">
          <div className="flex items-center gap-2">
            <span className="text-green-600">💰</span>
            <p className="text-sm text-green-900">
              Withdrawing {availableAmount.toFixed(2)} USDC to your bank
            </p>
          </div>
        </div>
        
        {/* Onramp iframe */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {loading || !offRampUrl ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-600">Loading withdrawal form...</p>
              </div>
            </div>
          ) : (
            <iframe
              src={offRampUrl}
              className="w-full"
              style={{ 
                border: 'none',
                height: '600px',
                display: 'block'
              }}
              allow="camera;microphone;payment"
            />
          )}
        </div>
      </div>
    </div>
  );
}