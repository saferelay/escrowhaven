'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ethers } from 'ethers';
import { DepositModal } from '@/components/dashboard/DepositModal';

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { user, supabase, ensureWallet } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const handleWithdraw = async () => {
    try {
      if (parseFloat(balance) < 1) {
        alert('Minimum withdrawal is $1 USDC');
        return;
      }

      setProcessing(true);
      await ensureWallet();
      
      if (!walletAddress) {
        alert('Please connect your wallet first');
        return;
      }
      
      // Use MoonPay for withdrawals
      const { createMoonPayOfframp } = await import('@/lib/moonpay');
      
      const moonPayWidget = await createMoonPayOfframp({
        email: user?.email || '',
        walletAddress: walletAddress,
        amount: parseFloat(balance),
        withdrawalId: `withdrawal-${Date.now()}`,
      });

      moonPayWidget.show();
      onClose();
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const canWithdraw = parseFloat(balance) >= 1;

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
          {/* Available Balance */}
          <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-4 mb-6">
            <div className="text-xs text-[#787B86] mb-1">Available to Withdraw</div>
            {loading ? (
              <div className="text-2xl font-medium text-black">Loading...</div>
            ) : (
              <div className="text-2xl font-medium text-black">${balance}</div>
            )}
            <div className="text-xs text-[#787B86] mt-1">USDC on Polygon</div>
          </div>

          {/* Info */}
          <div className="mb-6">
            <p className="text-sm text-[#787B86] mb-4">
              Withdraw funds from your wallet to your bank account using MoonPay.
            </p>
            
            {!canWithdraw && (
              <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg">
                <svg className="w-4 h-4 text-[#EF5350] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-[#EF5350]">
                  Minimum withdrawal amount is $1 USDC
                </p>
              </div>
            )}
            
            {canWithdraw && (
              <div className="flex items-start gap-2 p-3 bg-[#F8F9FD] rounded-lg">
                <svg className="w-4 h-4 text-[#2962FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-[#787B86]">
                  Withdrawals are processed via MoonPay and typically arrive in 1-3 business days.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleWithdraw}
            disabled={processing || !canWithdraw}
            className="w-full py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Opening MoonPay...' : 'Continue to MoonPay'}
          </button>
        </div>
      </div>
    </div>
  );
}