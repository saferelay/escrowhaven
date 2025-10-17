// src/components/dashboard/TransferPage.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

export function TransferPage() {
  const { user, supabase, ensureWallet } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [showOnramp, setShowOnramp] = useState(false);
  const [showOfframp, setShowOfframp] = useState(false);

  // Fetch wallet address
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?.email || !supabase) return;
      
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
  }, [user?.email, supabase]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletAddress) return;
      
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
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const handleDepositCash = async () => {
    try {
      await ensureWallet();
      
      if (!walletAddress) {
        alert('Please connect your wallet first');
        return;
      }
      
      setShowOnramp(true);
      
      // Use MoonPay for deposits (wallet-first approach)
      const { createMoonPayOnramp } = await import('@/lib/moonpay');
      
      const moonPayWidget = await createMoonPayOnramp({
        email: user?.email || '',
        walletAddress: walletAddress,
        amount: 10, // Default amount, user can change in widget
        escrowId: `deposit-${Date.now()}`, // Temporary ID for deposit
      });
  
      moonPayWidget.show();
      
      // Widget handles the flow
      setShowOnramp(false);
      
    } catch (error) {
      console.error('Deposit failed:', error);
      setShowOnramp(false);
    }
  };

  const handleWithdrawCash = async () => {
    try {
      if (parseFloat(balance) < 1) {
        alert('Minimum withdrawal is $1 USDC');
        return;
      }
      
      await ensureWallet();
      
      if (!walletAddress) {
        alert('Please connect your wallet first');
        return;
      }
      
      setShowOfframp(true);
      
      // Dynamic import of MoonPay offramp
      const { createMoonPayOfframp } = await import('@/lib/moonpay');
      
      const moonPayWidget = await createMoonPayOfframp({
        email: user?.email || '',
        walletAddress: walletAddress,
        amount: parseFloat(balance),
        withdrawalId: `withdrawal-${Date.now()}`,
      });

      moonPayWidget.show();
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setShowOfframp(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-normal text-black mb-2">Transfer</h1>
          <p className="text-base text-[#787B86]">
            Manage your wallet balance
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-white border border-[#E0E2E7] rounded-xl p-8 mb-6">
          <div className="text-sm text-[#787B86] mb-2">Available Balance</div>
          {loading ? (
            <div className="text-4xl font-normal text-black">Loading...</div>
          ) : (
            <>
              <div className="text-5xl font-normal text-black mb-1">
                ${balance}
              </div>
              <div className="text-sm text-[#787B86]">USDC on Polygon</div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Deposit Cash */}
          <button
            onClick={handleDepositCash}
            disabled={showOnramp}
            className="bg-white border border-[#E0E2E7] rounded-xl p-6 hover:border-[#2962FF] hover:bg-[#F8F9FD] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-full bg-[#F8F9FD] flex items-center justify-center group-hover:bg-[#2962FF] transition-colors">
                <svg className="w-6 h-6 text-[#2962FF] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-medium text-black mb-2">Deposit Cash</h3>
            <p className="text-sm text-[#787B86]">
                    Add funds to your wallet using MoonPay (credit card, bank transfer, Apple Pay, Google Pay)
                    </p>
          </button>

          {/* Withdraw Cash */}
          <button
            onClick={handleWithdrawCash}
            disabled={showOfframp || parseFloat(balance) < 1}
            className="bg-white border border-[#E0E2E7] rounded-xl p-6 hover:border-[#2962FF] hover:bg-[#F8F9FD] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-full bg-[#F8F9FD] flex items-center justify-center group-hover:bg-[#2962FF] transition-colors">
                <svg className="w-6 h-6 text-[#2962FF] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l-4-4m4 4l4-4" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-medium text-black mb-2">Withdraw Cash</h3>
            <p className="text-sm text-[#787B86]">
              Send funds from your wallet to your bank account
            </p>
            {parseFloat(balance) < 1 && (
              <p className="text-xs text-[#EF5350] mt-2">Minimum $1 required</p>
            )}
          </button>

        </div>

        {/* Info Box */}
        <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#2962FF] bg-opacity-10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-medium text-black mb-2">How it works</h4>
              <ol className="text-sm text-[#787B86] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-black">1.</span>
                  <span>Deposit cash into your wallet using MoonPay (supports credit cards, bank transfers, and more)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-black">2.</span>
                  <span>Use your balance to fund escrow transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-black">3.</span>
                  <span>Withdraw unused funds back to your bank account anytime</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Wallet Address (for transparency) */}
        {walletAddress && (
          <div className="mt-6 p-4 bg-[#F8F9FD] rounded-lg">
            <div className="text-xs text-[#787B86] mb-1">Your Wallet Address</div>
            <div className="text-sm font-mono text-black break-all">{walletAddress}</div>
          </div>
        )}

      </div>
    </div>
  );
}