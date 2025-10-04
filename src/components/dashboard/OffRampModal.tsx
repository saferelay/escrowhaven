// src/components/dashboard/OffRampModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createOfframpWidget } from '@/lib/offramp';


interface OffRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;  // USDC amount available to withdraw
  userEmail: string;
  walletAddress: string;    // user's Polygon address (source of funds)
  withdrawalId: string;     // your reconciliation id
  isTestMode?: boolean;     // optional override; fallback to env/app state
}

export function OffRampModal({
  isOpen,
  onClose,
  availableAmount,
  userEmail,
  walletAddress,
  withdrawalId,
  isTestMode = process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production',
}: OffRampModalProps) {
  const [ready, setReady] = useState(false);

  // Build the widget URL once the modal opens
  const offrampUrl = useMemo(() => {
    if (!isOpen || availableAmount <= 0) return '';
    return createOfframpWidget({
      email: userEmail,
      usdcAmount: availableAmount,
      withdrawalId,
      userWalletAddress: walletAddress,
      isTestMode: !!isTestMode,
    });
  }, [isOpen, availableAmount, userEmail, withdrawalId, walletAddress, isTestMode]);

  // Disable background scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Little delay for nicer loader → iframe transition
  useEffect(() => {
    if (!isOpen) return setReady(false);
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-[#F8FAFC]">
            <span className="text-sm font-medium text-gray-700">
              Withdraw to bank
            </span>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Loader while iframe gets ready */}
          {!ready && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
              <div className="w-12 h-12 border-3 border-gray-200 border-t-[#2962FF] rounded-full animate-spin" />
              <div className="text-sm text-gray-700">
                Preparing withdrawal of ${availableAmount.toFixed(2)} USDC…
              </div>
              <div className="text-xs text-gray-400">
                Loading Onramp secure checkout…
              </div>
            </div>
          )}

          {/* Body */}
          <div className="w-full h-full">
            {offrampUrl && (
              <iframe
                title="Onramp Offramp"
                src={offrampUrl}
                className="w-full h-full"
                loading="eager"
                allow="payment *; clipboard-write; accelerometer; autoplay; gyroscope"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
