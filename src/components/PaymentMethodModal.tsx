// src/components/PaymentMethodModal.tsx
'use client';

import { useState } from 'react';

// Replace the paymentMethods array with this properly typed version:
const paymentMethods: Array<{
  id: 'card' | 'bank';
  name: string;
  description: string;
  features: string[];
  processingTime: string;
  moonpayFee: number;
  minFee: number;
  recommended?: boolean;
}> = [
  {
    id: 'card',
    name: 'Card Payment',
    description: 'Credit/debit cards, Apple Pay, Google Pay',
    features: [
      'Instant funding',
      'All major cards',
      'Apple Pay & Google Pay',
      'Secure checkout'
    ],
    processingTime: 'Instant',
    moonpayFee: 4.5,
    minFee: 3.99,
    recommended: true
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct from your bank account',
    features: [
      'Lowest fees',
      'Higher limits',
      'ACH & SEPA',
      'Secure transfer'
    ],
    processingTime: '1-3 business days',
    moonpayFee: 1.0,
    minFee: 3.99,
  }
];

const CardIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const BankIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M3 10h18M5 21V10M9 21V10M14 21V10M19 21V10M12 7L3 2v5h18V2l-9 5z" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const LockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: 'card' | 'bank') => void;
  amount: number;
}

export function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  amount 
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank' | null>(null);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
  };

  const calculateFees = (method: typeof paymentMethods[0]) => {
    const paymentFee = Math.max((amount * method.moonpayFee / 100), method.minFee);
    const total = amount + paymentFee;
    return { paymentFee, total };
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E0E2E7]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-black">Fund Escrow</h3>
              <p className="text-sm text-[#787B86] mt-0.5">
                Secure ${amount.toFixed(2)} in escrow vault
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#F0F2F5] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* How it works section */}
        <div className="px-6 py-4 bg-[#F8F9FD] border-b border-[#E0E2E7]">
          <h4 className="text-sm font-medium text-black mb-3 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-[#2962FF]" />
            How Escrow Funding Works
          </h4>
          <div className="space-y-2 text-xs text-[#787B86]">
            <div className="flex items-start gap-2">
              <span className="text-[#2962FF] font-medium flex-shrink-0">1.</span>
              <span>Choose your payment method below</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2962FF] font-medium flex-shrink-0">2.</span>
              <span>Complete secure checkout with our payment processor</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2962FF] font-medium flex-shrink-0">3.</span>
              <span>Funds are immediately locked in the escrow vault</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#2962FF] font-medium flex-shrink-0">4.</span>
              <span>Release funds only when you approve</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-4">
          <h4 className="text-sm font-medium text-black mb-2">Select Payment Method</h4>
          
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;
            
            return (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id as 'card' | 'bank')}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? "border-[#2962FF] bg-blue-50/30" 
                    : "border-[#E0E2E7] hover:border-[#B2B5BE]"
                }`}
              >
                {method.recommended && (
                  <span className="absolute -top-2 right-4 px-2 py-0.5 bg-[#2962FF] text-white text-xs font-medium rounded">
                    Recommended
                  </span>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Radio button */}
                  <div className="pt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-[#2962FF]" : "border-[#B2B5BE]"
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2962FF]" />
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {method.id === 'card' ? (
                      <CardIcon className="w-8 h-8 text-[#787B86]" />
                    ) : (
                      <BankIcon className="w-8 h-8 text-[#787B86]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{method.name}</h4>
                    <p className="text-sm text-[#787B86] mt-1">{method.description}</p>
                    
                    {/* Features */}
                    <div className="mt-3 grid grid-cols-2 gap-1">
                      {method.features.map((feature, idx) => (
                        <div key={idx} className="text-xs text-[#787B86]">
                          ✓ {feature}
                        </div>
                      ))}
                    </div>

                    {/* Meta info */}
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5 text-[#B2B5BE]" />
                        <span className="text-[#787B86]">{method.processingTime}</span>
                      </div>
                      <div className="text-[#787B86]">
                        Payment fee: <span className="font-medium text-black">
                          {method.moonpayFee}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fee Breakdown */}
        {selectedMethodData && (
          <div className="px-6 pb-4">
            <div className="bg-[#F8F9FD] rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-[#787B86]">
                <span>Escrow amount:</span>
                <span className="text-black font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#787B86]">
                <span>Payment processing ({selectedMethodData.moonpayFee}%):</span>
                <span className="text-black">
                  ${calculateFees(selectedMethodData).paymentFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E0E2E7] font-medium">
                <span className="text-black">Total to pay:</span>
                <span className="text-black text-base">
                  ${calculateFees(selectedMethodData).total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <LockIcon className="w-4 h-4 text-[#2962FF] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-900 font-medium mb-1">
                    What happens next
                  </p>
                  <p className="text-xs text-blue-800">
                    You'll be redirected to our secure payment processor to complete your {selectedMethodData.id === 'card' ? 'card payment' : 'bank transfer'}. 
                    Funds are immediately secured in the escrow vault and protected until you approve release.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-[#787B86] mt-2 text-center">
              Minimum payment fee: ${selectedMethodData.minFee} • Platform fee (1.99%) charged at settlement
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E0E2E7] bg-white">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#787B86] bg-white border border-[#E0E2E7] rounded-lg hover:border-[#787B86] hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedMethod}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedMethod
                  ? "bg-[#2962FF] text-white hover:bg-[#1E53E5]"
                  : "bg-[#B2B5BE] text-white cursor-not-allowed"
              }`}
            >
              Continue to Secure Checkout →
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="px-6 py-3 border-t border-[#E0E2E7] bg-[#F8F9FD]">
          <div className="flex items-center justify-center gap-4 text-xs text-[#787B86]">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              <span>Bank-level security</span>
            </div>
            <span className="text-[#E0E2E7]">|</span>
            <div className="flex items-center gap-1">
              <LockIcon className="w-3.5 h-3.5" />
              <span>256-bit encryption</span>
            </div>
            <span className="text-[#E0E2E7]">|</span>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>PCI compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}