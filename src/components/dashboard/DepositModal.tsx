'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedAmount?: number; // Optional pre-fill amount
}

export function DepositModal({ isOpen, onClose, suggestedAmount }: DepositModalProps) {
  const { user, supabase, ensureWallet } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState<string>(suggestedAmount?.toString() || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

  // Fetch wallet address
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?.email || !supabase || !isOpen) return;
      
      try {
        const { data } = await supabase
          .from('user_wallets')
          .select('wallet_address')
          .eq('email', user.email)
          .single();
        
        if (data?.wallet_address) {
          setWalletAddress(data.wallet_address);
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };

    fetchWallet();
  }, [user?.email, supabase, isOpen]);

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress || !isOpen) return;
      
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com'
        );
        
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const balance = await usdcContract.balanceOf(walletAddress);
        const formatted = ethers.utils.formatUnits(balance, 6);
        
        setBalance(parseFloat(formatted).toFixed(2));
        setLoading(false);
      } catch (error) {
        console.error('Balance fetch failed:', error);
        setLoading(false);
      }
    };

    fetchBalance();
  }, [walletAddress, isOpen]);

  // Pre-fill suggested amount
  useEffect(() => {
    if (suggestedAmount && suggestedAmount > 0) {
      setAmount(suggestedAmount.toString());
    }
  }, [suggestedAmount]);

  const handleDeposit = async () => {
    try {
      const depositAmount = parseFloat(amount);
      
      if (!depositAmount || depositAmount < 10) {
        alert('Minimum deposit is $10');
        return;
      }

      setProcessing(true);
      await ensureWallet();
      
      if (!walletAddress) {
        alert('Please connect first');
        return;
      }
      
      // Use MoonPay with the specified amount and payment preference
      const { createMoonPayOnramp } = await import('@/lib/moonpay');
      
      const moonPayWidget = await createMoonPayOnramp({
        email: user?.email || '',
        walletAddress: walletAddress,
        amount: depositAmount,
        escrowId: `deposit-${Date.now()}`,
      });

      moonPayWidget.show();
      onClose();
      
    } catch (error) {
      console.error('Deposit failed:', error);
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

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Credit/Debit Card */}
              <button
                onClick={() => setPaymentMethod('card')}
                className={`
                  border rounded-lg p-4 text-left transition-all
                  ${paymentMethod === 'card' 
                    ? 'border-[#2962FF] bg-[#F8F9FD]' 
                    : 'border-[#E0E2E7] bg-white hover:border-[#787B86]'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-6 h-6 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {paymentMethod === 'card' && (
                    <div className="w-4 h-4 rounded-full bg-[#2962FF] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-black">Card</div>
                <div className="text-xs text-[#787B86] mt-1">Credit or Debit</div>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`
                  border rounded-lg p-4 text-left transition-all
                  ${paymentMethod === 'bank' 
                    ? 'border-[#2962FF] bg-[#F8F9FD]' 
                    : 'border-[#E0E2E7] bg-white hover:border-[#787B86]'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-6 h-6 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  {paymentMethod === 'bank' && (
                    <div className="w-4 h-4 rounded-full bg-[#2962FF] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-black">Bank</div>
                <div className="text-xs text-[#787B86] mt-1">ACH Transfer</div>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg mb-6">
            <svg className="w-5 h-5 text-[#2962FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-[#787B86] leading-relaxed">
                Powered by MoonPay. Funds arrive instantly and can be used immediately for escrow transactions.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleDeposit}
            disabled={processing || !isValidAmount}
            className="w-full py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Opening MoonPay...' : `Deposit $${amount || '0'}`}
          </button>
        </div>
      </div>
    </div>
  );
}