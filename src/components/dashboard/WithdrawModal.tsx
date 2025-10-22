// src/components/dashboard/WithdrawModal.tsx - UPDATED

'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/contexts/AuthContext';
import { openOfframpWidget, checkUsdcBalance } from '@/lib/offramp';  // ✅ USE NEW FUNCTIONS

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export function WithdrawModal({ isOpen, onClose, userEmail }: WithdrawModalProps) {
  const { user } = usePrivy();
  const { supabase } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    console.log('[WithdrawModal] Starting withdrawal with:', { userEmail, wallet: user?.wallet?.address });

    if (!userEmail || !user?.wallet?.address) {
      setError('Please sign in first');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount < 10) {
      setError('Minimum withdrawal is $10');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Pre-check balance to provide better UX
      const balanceCheck = await checkUsdcBalance(user.wallet.address, withdrawAmount);
      
      if (!balanceCheck.hasEnough) {
        setError(`Insufficient balance. You have $${balanceCheck.balance} USDC available.`);
        setProcessing(false);
        return;
      }

      // Create withdrawal record in database first
      console.log('[WithdrawModal] Creating withdrawal record:', {
        user_email: userEmail,
        amount_cents: Math.floor(withdrawAmount * 100),
        wallet_address: user.wallet.address,
        status: 'PENDING',
        provider: 'onramp',
      });

      const { data: withdrawal, error: dbError } = await supabase
        .from('withdrawals')
        .insert({
          user_email: userEmail,
          amount_cents: Math.floor(withdrawAmount * 100),
          wallet_address: user.wallet.address,
          status: 'PENDING',
          provider: 'onramp',
        })
        .select()
        .single();

      if (dbError) {
        console.error('[WithdrawModal] Database error:', {
          message: dbError.message,
          code: dbError.code,
          details: dbError.details,
        });
        setError(`Failed to create withdrawal: ${dbError.message}`);
        setProcessing(false);
        return;
      }

      if (!withdrawal) {
        console.error('[WithdrawModal] No withdrawal returned from database');
        setError('Failed to create withdrawal. Please try again.');
        setProcessing(false);
        return;
      }

      console.log('[WithdrawModal] Withdrawal created:', withdrawal.id);

      console.log('[WithdrawModal] Created withdrawal record:', withdrawal.id);

      // ✅ Open Onramp offramp widget (live mode) - handles WalletConnect automatically
      openOfframpWidget({
        email: userEmail,
        usdcAmount: withdrawAmount,
        withdrawalId: withdrawal.id,
        userWalletAddress: user.wallet.address,
        isTestMode: false  // Use live Onramp endpoint
      });

      onClose();
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const isValidAmount = parseFloat(amount) >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2E7] px-6 py-4">
          <h3 className="text-lg font-medium text-black">Withdraw Cash</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F8F9FD] rounded transition-colors"
          >
            <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787B86] text-base">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="10.00"
                min="10"
                step="0.01"
                className="w-full bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg pl-8 pr-4 py-3 text-base text-black focus:bg-white focus:border-[#2962FF] focus:outline-none focus:ring-2 focus:ring-[#2962FF]/10 transition-all"
              />
            </div>
            <p className="text-xs text-[#787B86] mt-2">Minimum $10</p>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg mb-6">
            <svg className="w-5 h-5 text-[#2962FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-[#787B86] leading-relaxed">
                Withdrawals are processed to your bank account within 1-2 business days. You'll be asked to connect your wallet to sign the transaction.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleWithdraw}
            disabled={processing || !isValidAmount}
            className="w-full py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : `Withdraw $${amount || '0'}`}
          </button>
        </div>
      </div>
    </div>
  );
}