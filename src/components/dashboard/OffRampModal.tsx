// src/components/dashboard/OffRampModal.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { transferUSDCForOfframp } from '@/lib/offramp-magic-transfer';

interface OffRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;
  userEmail: string;
  walletAddress: string;
  withdrawalId: string;
  isTestMode?: boolean;
}

type FlowStep = 'loading' | 'widget' | 'transferring' | 'complete' | 'error';

export function OffRampModal({
  isOpen,
  onClose,
  availableAmount,
  userEmail,
  walletAddress,
  withdrawalId,
  isTestMode = process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production',
}: OffRampModalProps) {
  const [flowStep, setFlowStep] = useState<FlowStep>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  
  // Use refs to prevent re-initialization
  const onrampInstanceRef = useRef<any>(null);
  const hasTransferredRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Memoize close handler
  const handleClose = useCallback(() => {
    if (onrampInstanceRef.current) {
      try {
        onrampInstanceRef.current.close();
      } catch (e) {
        console.log('Widget already closed');
      }
    }
    onClose();
  }, [onClose]);

  // Initialize SDK only once when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset on close
      if (onrampInstanceRef.current) {
        try {
          onrampInstanceRef.current.close();
        } catch (e) {}
        onrampInstanceRef.current = null;
      }
      setFlowStep('loading');
      setErrorMsg('');
      setTxHash('');
      hasTransferredRef.current = false;
      isInitializedRef.current = false;
      return;
    }

    // Prevent re-initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initSDK = async () => {
      try {
        const { OnrampWebSDK } = await import('@onramp.money/onramp-web-sdk');
        const appId = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || "1687307";

        const instance = new OnrampWebSDK({
          appId: Number(appId),
          flowType: 2,
          walletAddress: walletAddress,
          coinCode: 'usdc',
          network: 'matic20',
          coinAmount: availableAmount,
          merchantRecognitionId: withdrawalId,
          ...(isTestMode && { isTestNetwork: true }),
        } as any);

        // Event handlers
        instance.on('TX_EVENTS', async (event: any) => {
          console.log('TX_EVENT:', event.type, event.data);

          // Look for deposit address
          if ((event.type === 'ONRAMP_WIDGET_TX_FINDING' || 
               event.type === 'ONRAMP_WIDGET_TX_SELLING') && 
              !hasTransferredRef.current) {
            
            const depositAddress = event.data?.depositAddress;
            
            if (depositAddress) {
              console.log('Deposit address received:', depositAddress);
              setFlowStep('transferring');
              hasTransferredRef.current = true;

              // Transfer USDC using Magic
              const result = await transferUSDCForOfframp(depositAddress, availableAmount);

              if (result.success) {
                setTxHash(result.txHash || '');
                setFlowStep('widget');
              } else {
                setErrorMsg(result.error || 'Transfer failed');
                setFlowStep('error');
                instance.close();
              }
            }
          }

          if (event.type === 'ONRAMP_WIDGET_TX_COMPLETED') {
            setFlowStep('complete');
            setTimeout(handleClose, 3000);
          }

          if (event.type === 'ONRAMP_WIDGET_TX_SELLING_FAILED' || 
              event.type === 'ONRAMP_WIDGET_TX_SENDING_FAILED') {
            setErrorMsg('Transaction failed');
            setFlowStep('error');
          }
        });

        instance.on('WIDGET_EVENTS', (event: any) => {
          console.log('WIDGET_EVENT:', event.type);

          if (event.type === 'ONRAMP_WIDGET_READY') {
            setFlowStep('widget');
          }

          if (event.type === 'ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED') {
            handleClose();
          }

          if (event.type === 'ONRAMP_WIDGET_FAILED') {
            setErrorMsg('Widget failed to load');
            setFlowStep('error');
          }
        });

        onrampInstanceRef.current = instance;
        instance.show();

      } catch (error: any) {
        console.error('SDK init failed:', error);
        setErrorMsg(error.message || 'Failed to load widget');
        setFlowStep('error');
      }
    };

    initSDK();
  }, [isOpen]); // Only re-run when isOpen changes

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
            onClick={flowStep === 'error' ? handleClose : undefined} 
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E0E2E7] p-8">
              
              {flowStep === 'loading' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin" />
                  <p className="text-base font-medium text-black mt-6 mb-2">
                    Loading withdrawal
                  </p>
                  <p className="text-sm text-[#787B86]">
                    Powered by Onramp.money
                  </p>
                </div>
              )}

              {flowStep === 'transferring' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-[#E0E2E7] border-t-[#2962FF] rounded-full animate-spin" />
                  <p className="text-base font-medium text-black mt-6 mb-2">
                    Transferring ${availableAmount.toFixed(2)} USDC
                  </p>
                  <p className="text-sm text-[#787B86] text-center mb-4">
                    Please approve in the Magic popup
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8F9FD] rounded-lg">
                    <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-[#787B86]">No fees for you</span>
                  </div>
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
                    onClick={handleClose}
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
                  <p className="text-sm text-[#787B86] text-center mb-4">
                    Money arrives in 1-3 business days
                  </p>
                  {txHash && (
                    <a
                      href={`https://polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#2962FF] hover:underline inline-flex items-center gap-1"
                    >
                      View transaction
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}