// src/components/dashboard/FundWalletButton.tsx - Privy wallet funding (FIXED)

'use client';

import { useFundWallet } from '@privy-io/react-auth';
import { usePrivy } from '@privy-io/react-auth';
import { polygon } from 'viem/chains';

interface FundWalletButtonProps {
  className?: string;
}

export function FundWalletButton({ className }: FundWalletButtonProps) {
  const { user } = usePrivy();
  const { fundWallet } = useFundWallet();

  const handleFundWallet = async () => {
    if (!user?.wallet?.address) {
      alert('Wallet not found. Please sign in first.');
      return;
    }

    console.log('[FundWallet] Opening Privy fund wallet for:', user.wallet.address);
    
    try {
      // Call Privy's fundWallet with USDC on Polygon
      await fundWallet({
        address: user.wallet.address,
        options: {
          chain: polygon,
          amount: '50', // Suggest $50 USDC
          asset: 'USDC',
          uiConfig: {
            receiveFundsTitle: 'Add Funds to Your Wallet',
            receiveFundsSubtitle: 'Choose a funding method to add USDC to your wallet'
          }
        }
      });
      
      console.log('[FundWallet] Fund wallet modal opened');
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