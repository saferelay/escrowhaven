// src/components/dashboard/OffRampModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createOfframpWidget } from '@/lib/offramp';

interface OffRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;
  userEmail: string;
  walletAddress: string;
  withdrawalId: string;
  isTestMode?: boolean;
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

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return setReady(false);
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-[#E0E2E7] flex flex-col" style={{ height: 'calc(100vh - 80px)', maxHeight: '700px' }}>
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E2E7] bg-white flex-shrink-0">
            <div>
              <h3 className="text-base font-medium text-black">Cash out to bank</h3>
              <p className="text-xs text-[#787B86] mt-0.5">Withdraw ${availableAmount.toFixed(2)} USDC</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F0F2F5] rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4 bg-[#F8F9FD] border-b border-[#E0E2E7] flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-black mb-3">Withdrawing ${availableAmount.toFixed(2)} USDC to your bank</p>
                
                <div className="space-y-2 text-sm text-[#787B86] mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-[#2962FF] font-medium min-w-[16px]">1.</span>
                    <span>Connect wallet (happens automatically with your email)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#2962FF] font-medium min-w-[16px]">2.</span>
                    <span>Approve USDC transfer (automatic, no action needed)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#2962FF] font-medium min-w-[16px]">3.</span>
                    <span>Enter your bank account details</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#2962FF] font-medium min-w-[16px]">4.</span>
                    <span>Money arrives in 1-3 business days</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E0E2E7] space-y-2">
                  <p className="text-xs font-medium text-[#26A69A]">
                    escrowhaven.io covers all blockchain fees
                  </p>
                  <p className="text-xs text-[#787B86]">
                    Onramp may use crypto terms like "MetaMask" or "gas" - ignore these. Just follow the steps like any normal bank transfer.
                  </p>
                  <a 
                    href="/help#withdrawal" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#2962FF] hover:underline inline-flex items-center gap-1"
                  >
                    Need help? View withdrawal guide
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {!ready && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white" style={{ top: '160px' }}>
              <div className="w-12 h-12 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin" />
              <div className="text-center mt-6">
                <p className="text-sm font-medium text-black mb-1">
                  Loading secure checkout
                </p>
                <p className="text-xs text-[#787B86]">
                  Powered by Onramp.money
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 relative">
            {offrampUrl && (
              <iframe
                title="Onramp Offramp"
                src={offrampUrl}
                className="absolute inset-0 w-full h-full"
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