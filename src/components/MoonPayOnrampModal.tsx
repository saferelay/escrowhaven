// src/components/MoonPayOnrampModal.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { createMoonPayOnramp } from '@/lib/moonpay';
import { useAuth } from '@/contexts/AuthContext';

interface MoonPayOnrampModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultAddress: string;
  amount: number;
  escrowId: string;
  onSuccess?: () => void;
}

type FlowStep = 'connecting' | 'widget' | 'complete' | 'error';

export function MoonPayOnrampModal({
  isOpen,
  onClose,
  vaultAddress,
  amount,
  escrowId,
  onSuccess
}: MoonPayOnrampModalProps) {
  const { user, ensureWallet } = useAuth();
  const [flowStep, setFlowStep] = useState<FlowStep>('connecting');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const moonPayInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (moonPayInstanceRef.current) {
        try {
          moonPayInstanceRef.current.close();
        } catch (e) {}
        moonPayInstanceRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setFlowStep('connecting');
      setErrorMsg('');
      isInitializedRef.current = false;
      return;
    }

    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initMoonPay = async () => {
      try {
        setFlowStep('connecting');
        const walletAddress = await ensureWallet();
        
        if (!walletAddress) {
          throw new Error('Failed to connect wallet');
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        const moonPayWidget = await createMoonPayOnramp({
          email: user?.email,
          walletAddress: vaultAddress,
          amount: amount,
          escrowId: escrowId,
        });

        moonPayInstanceRef.current = moonPayWidget;

        setFlowStep('widget');
        moonPayWidget.show();

        // Start polling vault balance
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const balanceResponse = await fetch('/api/vault/balance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vaultAddress })
            });

            if (balanceResponse.ok) {
              const { balance } = await balanceResponse.json();
              const requiredAmount = amount;

              if (balance >= requiredAmount) {
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                }

                setFlowStep('complete');
                
                if (moonPayInstanceRef.current) {
                  try {
                    moonPayInstanceRef.current.close();
                  } catch (e) {}
                }

                if (onSuccess) {
                  setTimeout(() => {
                    onSuccess();
                    onClose();
                  }, 2000);
                }
              }
            }
          } catch (error) {
            console.error('Balance check error:', error);
          }
        }, 10000);

        setTimeout(() => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }, 30 * 60 * 1000);

      } catch (error: any) {
        console.error('MoonPay init failed:', error);
        setErrorMsg(error.message || 'Failed to load payment');
        setFlowStep('error');
      }
    };

    initMoonPay();
  }, [isOpen, vaultAddress, amount, escrowId, user?.email, ensureWallet, onSuccess, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showCustomOverlay = flowStep !== 'widget';

  return (
    <>
      {showCustomOverlay && (
        <div className="fixed inset-0 z-[150]">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={flowStep === 'error' ? onClose : undefined} 
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E0E2E7] p-8">
              
              {flowStep === 'connecting' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin" />
                  <p className="text-base font-medium text-black mt-6 mb-2">
                    Preparing secure payment
                  </p>
                  <p className="text-sm text-[#787B86] text-center">
                    Setting up your escrow funding session...
                  </p>
                </div>
              )}

              {flowStep === 'error' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-[#EF5350]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-black mb-2">
                    Payment setup failed
                  </p>
                  <p className="text-sm text-[#787B86] text-center mb-6">
                    {errorMsg}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-[#2962FF] text-white text-sm font-medium rounded-lg hover:bg-[#1E53E5] transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {flowStep === 'complete' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-black mb-2">
                    Escrow Funded!
                  </p>
                  <p className="text-sm text-[#787B86] text-center mb-1">
                    ${amount.toFixed(2)} secured in vault
                  </p>
                  <p className="text-xs text-[#787B86] text-center">
                    Funds protected until you approve release
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* REMOVED: The helper overlay that was showing "Complete Your Payment" */}
    </>
  );
}