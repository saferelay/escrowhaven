// src/components/dashboard/DepositModal.tsx - UPDATED

'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { openDepositWidget } from '@/lib/onramp';  // ✅ USE NEW FUNCTION

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedAmount?: number;
  userEmail?: string | null;
}

export function DepositModal({ isOpen, onClose, suggestedAmount, userEmail }: DepositModalProps) {
  const { user, authenticated } = usePrivy();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState<string>(suggestedAmount?.toString() || '');

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.wallet?.address || !isOpen) return;
      
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com'
        );
        
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const balance = await usdcContract.balanceOf(user.wallet.address);
        const formatted = ethers.utils.formatUnits(balance, 6);
        
        setBalance(parseFloat(formatted).toFixed(2));
        setLoading(false);
      } catch (error) {
        console.error('Balance fetch failed:', error);
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user?.wallet?.address, isOpen]);

  // Pre-fill suggested amount
  useEffect(() => {
    if (suggestedAmount && suggestedAmount > 0) {
      setAmount(suggestedAmount.toString());
    }
  }, [suggestedAmount]);

  const handleDeposit = async () => {
    console.log('[DepositModal] Starting deposit with:', { userEmail, wallet: user?.wallet?.address });

    if (!authenticated || !user?.wallet?.address || !userEmail) {
      alert('Please sign in first');
      return;
    }

    const depositAmount = parseFloat(amount);
    
    if (!depositAmount || depositAmount < 10) {
      alert('Minimum deposit is $10');
      return;
    }

    setProcessing(true);

    try {
      // ✅ Use the new openDepositWidget function
      openDepositWidget({
        email: userEmail,
        targetUsdcAmount: depositAmount,
        escrowId: `deposit-${Date.now()}`,
        vaultAddress: user.wallet.address,
        isTestMode: process.env.NEXT_PUBLIC_MOONPAY_MODE !== 'production'
      });

      onClose();
      
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Failed to open deposit widget: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
          <h3 className="text-lg font-medium text-black">Deposit Cash</h3>
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
          
          {/* Current Balance */}
          <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-4 mb-6">
            <div className="text-xs text-[#787B86] mb-1">Current Balance</div>
            {loading ? (
              <div className="text-xl font-medium text-black">Loading...</div>
            ) : (
              <div className="text-xl font-medium text-black">${balance}</div>
            )}
            <div className="text-xs text-[#787B86] mt-1">USDC</div>
          </div>

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
                Powered by Onramp.money. Funds arrive instantly and can be used immediately.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleDeposit}
            disabled={processing || !isValidAmount || !authenticated}
            className="w-full py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Opening...' : `Deposit $${amount || '0'}`}
          </button>
        </div>
      </div>
    </div>
  );
}