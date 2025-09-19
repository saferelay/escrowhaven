// src/components/PaymentMethodModal.tsx
'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface PaymentMethod {
  id: 'stripe' | 'onramp';
  name: string;
  description: string;
  features: string[];
  processingTime: string;
  fees: string;
  recommended?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Card Payment (Instant)',
    description: 'Credit/debit cards, Apple Pay, Google Pay',
    features: [
      '✓ Instant funding',
      '✓ All major cards accepted',
      '✓ Apple Pay & Google Pay',
      '✓ No minimum amount'
    ],
    processingTime: 'Instant',
    fees: '2.9% + $0.30',
    recommended: true
  },
  {
    id: 'onramp',
    name: 'Bank Transfer',
    description: 'Direct bank transfer with lower fees',
    features: [
      '✓ Lower fees',
      '✓ ACH & wire transfers',
      '✓ Higher limits',
      '✓ No KYC under $1000'
    ],
    processingTime: '1-3 business days',
    fees: '1.99%'
  }
];

const CardIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const BankIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M3 10h18M5 21V10M9 21V10M14 21V10M19 21V10M12 7L3 2v5h18V2l-9 5z" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: 'stripe' | 'onramp') => void;
  amount: number;
}

export function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  amount 
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'onramp' | null>(null);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
  };

  // Calculate fees
  const stripeFee = amount * 0.029 + 0.30;
  const onrampFee = amount * 0.0199;
  const platformFee = amount * 0.0199; // Your 1.99% platform fee

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Choose Payment Method</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Add ${amount.toFixed(2)} to escrow
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={clsx(
                "relative border-2 rounded-lg p-4 cursor-pointer transition-all",
                selectedMethod === method.id 
                  ? "border-[#2962FF] bg-blue-50/50" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {method.recommended && (
                <span className="absolute -top-2 right-4 px-2 py-0.5 bg-[#2962FF] text-white text-xs font-medium rounded">
                  Recommended
                </span>
              )}
              
              <div className="flex items-start gap-4">
                {/* Radio button */}
                <div className="pt-1">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedMethod === method.id 
                      ? "border-[#2962FF]" 
                      : "border-gray-300"
                  )}>
                    {selectedMethod === method.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2962FF]" />
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  {method.id === 'stripe' ? (
                    <CardIcon className="w-8 h-8 text-gray-700" />
                  ) : (
                    <BankIcon className="w-8 h-8 text-gray-700" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  
                  {/* Features */}
                  <div className="mt-3 grid grid-cols-2 gap-1">
                    {method.features.map((feature, idx) => (
                      <div key={idx} className="text-xs text-gray-600">
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Meta info */}
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{method.processingTime}</span>
                    </div>
                    <div className="text-gray-600">
                      Payment fee: <span className="font-medium">{method.fees}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fee Breakdown */}
        {selectedMethod && (
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Escrow amount:</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment processing:</span>
                <span>
                  ${selectedMethod === 'stripe' ? stripeFee.toFixed(2) : onrampFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform fee (1.99%):</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Total to pay:</span>
                <span>
                  ${(amount + (selectedMethod === 'stripe' ? stripeFee : onrampFee) + platformFee).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedMethod}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                selectedMethod
                  ? "bg-[#2962FF] text-white hover:bg-[#1d4ed8]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Continue with {selectedMethod === 'stripe' ? 'Card' : 'Bank Transfer'}
            </button>
          </div>
        </div>

        {/* Payment method logos */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-center gap-3 opacity-50">
          <img src="/payment-icons/visa.svg" alt="Visa" className="h-5" />
          <img src="/payment-icons/mastercard.svg" alt="Mastercard" className="h-5" />
          <img src="/payment-icons/amex.svg" alt="Amex" className="h-5" />
          <img src="/payment-icons/apple-pay.svg" alt="Apple Pay" className="h-5" />
          <img src="/payment-icons/google-pay.svg" alt="Google Pay" className="h-5" />
          <span className="text-xs text-gray-400 mx-2">|</span>
          <img src="/payment-icons/bank.svg" alt="Bank" className="h-5" />
        </div>
      </div>
    </div>
  );
}