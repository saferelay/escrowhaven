// src/components/dashboard/FundWalletButton.tsx - Fixed Privy wallet funding

'use client';

import { usePrivy } from '@privy-io/react-auth';

interface FundWalletButtonProps {
  className?: string;
}

export function FundWalletButton({ className }: FundWalletButtonProps) {
  const { user } = usePrivy();

  const handleFundWallet = () => {
    if (!user?.wallet?.address) {
      alert('Wallet not found. Please sign in first.');
      return;
    }

    console.log('[FundWallet] Opening Privy fund wallet for:', user.wallet.address);
    
    try {
      // Privy embedded wallets can be funded through their official fund page
      // Opens in new tab for user to fund their wallet
      const fundUrl = `https://privy.com/fund?wallet=${user.wallet.address}`;
      window.open(fundUrl, '_blank');
    } catch (error) {
      console.error('[FundWallet] Error opening fund wallet:', error);
      alert('Failed to open funding options. Please try again.');
    }
  };

  return (
    <button
      onClick={handleFundWallet}
      className={className || 'inline-flex items-center justify-center rounded-md px-3 py-2 bg-[#2962FF] text-white hover:bg-[#1E53E5] transition shadow-sm'}
      title="Fund your wallet with USDC"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Deposit Cash
    </button>
  );
}