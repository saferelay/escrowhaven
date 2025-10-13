// src/components/MoonPayOnrampModal.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import MoonPay widget to prevent SSR issues
const MoonPayBuyWidget = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayBuyWidget),
  { ssr: false }
);

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
  const [showWidget, setShowWidget] = useState(false);
  
  const isInitializedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // URL signature handler - required when using walletAddress parameter
  const handleUrlSignatureRequested = async (url: string): Promise<string> => {
    try {
      console.log('🔐 Requesting signature for URL');
      
      const response = await fetch('/api/moonpay/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign URL');
      }
      
      const { signature } = await response.json();
      console.log('✅ URL signed successfully');
      return signature;
    } catch (error) {
      console.error('❌ URL signing failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Cleanup on close
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setFlowStep('connecting');
      setErrorMsg('');
      setShowWidget(false);
      isInitializedRef.current = false;
      return;
    }

    if (isInitializedRef.current) {
      console.log('⚠️ Already initialized, skipping');
      return;
    }
    
    isInitializedRef.current = true;
    console.log('🚀 Starting initialization...');

    const initMoonPay = async () => {
      try {
        setFlowStep('connecting');
        
        console.log('=== MoonPay Initialization Start ===');
        console.log('Vault Address:', vaultAddress);
        console.log('Amount:', amount);
        console.log('Escrow ID:', escrowId);
        console.log('User email:', user?.email);
        
        // Ensure wallet is connected
        console.log('Ensuring wallet...');
        const walletAddress = await ensureWallet();
        
        if (!walletAddress) {
          throw new Error('Failed to connect wallet');
        }
        console.log('✅ Wallet connected');

        // Check if MoonPay API key exists
        const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
        const apiKey = moonPayMode === 'production'
          ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
          : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;
        
        console.log('Environment:', moonPayMode);
        console.log('API Key exists:', !!apiKey);
        console.log('API Key prefix:', apiKey?.substring(0, 10));
        
        if (!apiKey) {
          throw new Error(`MoonPay API key not found for ${moonPayMode} mode`);
        }

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log('✅ About to show widget');
        // Show the widget
        setFlowStep('widget');
        setShowWidget(true);
        console.log('✅ Widget state set to true');

        // Start polling vault balance to detect when funding completes
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
                // Success! Vault is funded
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                }

                setFlowStep('complete');
                setShowWidget(false);

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
        }, 10000); // Check every 10 seconds

        // Auto-stop polling after 30 minutes
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
        setShowWidget(false);
      }
    };

    initMoonPay();
  }, [isOpen, vaultAddress, amount, escrowId, user?.email, ensureWallet, onSuccess, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Handle escape key
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
      {/* Custom overlay for loading/error/complete states */}
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
      
      {/* MoonPay Widget - only show when in widget state */}
      {showWidget && (
        <MoonPayBuyWidget
          variant="overlay"
          visible={true}
          baseCurrencyCode="usd"
          baseCurrencyAmount={amount.toString()}
          defaultCurrencyCode="usdc_polygon"
          walletAddress={vaultAddress}
          colorCode="2962FF"
          externalTransactionId={escrowId}
          email={user?.email}
          showWalletAddressForm="false"
          onUrlSignatureRequested={handleUrlSignatureRequested}
          onLogin={async () => {
            console.log('✅ MoonPay: Customer logged in');
          }}
          onTransactionCompleted={async (data: any) => {
            console.log('✅ MoonPay: Transaction completed', data);
          }}
        />
      )}
    </>
  );
}