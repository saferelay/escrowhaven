'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/contexts/AuthContext';

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

  const handleWithdraw = async () => {
    console.log('[WithdrawModal] userEmail from prop:', userEmail);
    console.log('[WithdrawModal] wallet address:', user?.wallet?.address);

    // ✅ Use userEmail from prop
    if (!userEmail || !user?.wallet?.address) {
      alert('Please sign in first');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount < 10) {
      alert('Minimum withdrawal is $10');
      return;
    }

    setProcessing(true);

    try {
      // Initialize withdrawal request
      const { data: withdrawal, error } = await supabase
        .from('withdrawals')
        .insert({
          user_email: userEmail,
          amount_cents: Math.floor(withdrawAmount * 100),
          wallet_address: user.wallet.address,
          status: 'PENDING',
          provider: 'offramp',
        })
        .select()
        .single();

      if (error) {
        alert('Failed to initiate withdrawal: ' + error.message);
        return;
      }

      if (withdrawal) {
        // Redirect to off-ramp provider
        window.location.href = `/api/withdraw?id=${withdrawal.id}`;
      }
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Failed to process withdrawal');
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
                onChange={(e) => setAmount(e.target.value)}
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
                Withdrawals are processed to your bank account within 1-2 business days.
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