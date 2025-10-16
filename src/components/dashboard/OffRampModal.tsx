// src/components/dashboard/OffRampModal.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface OffRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;
  userEmail: string;
  walletAddress: string;
  withdrawalId: string;
}

type FlowStep = 'connecting' | 'widget' | 'complete' | 'error';

export function OffRampModal({
  isOpen,
  onClose,
  availableAmount,
  userEmail,
  walletAddress,
  withdrawalId,
}: OffRampModalProps) {
  const { ensureWallet } = useAuth();
  const [flowStep, setFlowStep] = useState<FlowStep>('connecting');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const moonPayInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      if (moonPayInstanceRef.current) {
        try {
          moonPayInstanceRef.current.close();
        } catch (e) {}
        moonPayInstanceRef.current = null;
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
        console.log('🔵 [OffRamp] Starting initialization...');
        console.log('🔵 [OffRamp] Available amount:', availableAmount);
        console.log('🔵 [OffRamp] User email:', userEmail);
        console.log('🔵 [OffRamp] Withdrawal ID:', withdrawalId);
        
        // Step 1: Ensure Magic wallet is connected
        setFlowStep('connecting');
        console.log('🔵 [OffRamp] Ensuring wallet connection...');
        const userWalletAddress = await ensureWallet();
        
        if (!userWalletAddress) {
          throw new Error('Failed to connect wallet');
        }
        
        console.log('✅ [OffRamp] Wallet connected:', userWalletAddress);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));

        // ✅ DYNAMIC IMPORT: Only loads createMoonPayOfframp (and MoonPay SDK) when modal opens
        console.log('🚀 [OffRamp] Dynamically loading MoonPay off-ramp...');
        const { createMoonPayOfframp } = await import('@/lib/moonpay');
        console.log('✅ [OffRamp] MoonPay module loaded');

        // Step 2: Initialize MoonPay sell widget
        console.log('🔵 [OffRamp] Creating MoonPay widget...');
        const moonPayWidget = await createMoonPayOfframp({
          email: userEmail,
          walletAddress: userWalletAddress,
          amount: availableAmount,
          withdrawalId: withdrawalId,
        });

        console.log('✅ [OffRamp] MoonPay widget created:', !!moonPayWidget);
        moonPayInstanceRef.current = moonPayWidget;

        // Show widget
        console.log('🔵 [OffRamp] Showing MoonPay widget...');
        setFlowStep('widget');
        moonPayWidget.show();
        console.log('✅ [OffRamp] Widget shown successfully');

      } catch (error: any) {
        console.error('❌ [OffRamp] Initialization failed:', error);
        console.error('❌ [OffRamp] Error message:', error.message);
        console.error('❌ [OffRamp] Error stack:', error.stack);
        setErrorMsg(error.message || 'Failed to load withdrawal');
        setFlowStep('error');
      }
    };

    initMoonPay();
  }, [isOpen, availableAmount, userEmail, withdrawalId, ensureWallet]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const showCustomOverlay = flowStep !== 'widget';

  return (
    <>
      {showCustomOverlay && (
        <div className="fixed inset-0 z-[100]">
          <div 
            className="absolute inset-0 bg-black/70" 
            onClick={flowStep === 'error' ? onClose : undefined} 
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E0E2E7] p-8">
              
              {flowStep === 'connecting' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin" />
                  <p className="text-base font-medium text-black mt-6 mb-2">
                    Preparing withdrawal
                  </p>
                  <p className="text-sm text-[#787B86]">
                    Connecting to payment processor...
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
                    Withdrawal failed
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
                    Withdrawal complete!
                  </p>
                  <p className="text-sm text-[#787B86] text-center">
                    Funds will arrive in 1-3 business days
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}