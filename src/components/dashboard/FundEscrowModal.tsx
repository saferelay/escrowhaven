'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

interface FundEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowAmount: number;
  escrowId: string;
  vaultAddress: string;
  onSuccess: () => void;
  onDeposit: () => void; // Opens deposit modal
}

export function FundEscrowModal({
  isOpen,
  onClose,
  escrowAmount,
  escrowId,
  vaultAddress,
  onSuccess,
  onDeposit
}: FundEscrowModalProps) {
  const { user, supabase } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);

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
    
    // Refresh every 5 seconds while modal is open
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [walletAddress, isOpen]);

  const handleFund = async () => {
    try {
      setFunding(true);

      // Call gasless-transfer API to move funds from wallet to vault
      const response = await fetch('/api/wallet/gasless-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit-to-escrow',
          userAddress: walletAddress,
          destinationAddress: vaultAddress,
          amount: escrowAmount,
          signature: 'placeholder', // You'll need to implement signing
          nonce: Date.now()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }

      const result = await response.json();
      console.log('✅ Escrow funded:', result);

      // Update escrow status
      await supabase
        .from('escrows')
        .update({
          status: 'FUNDED',
          funded_at: new Date().toISOString()
        })
        .eq('id', escrowId);

      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Funding failed:', error);
      alert(`Failed to fund escrow: ${error.message}`);
    } finally {
      setFunding(false);
    }
  };

  if (!isOpen) return null;

  const balanceNum = parseFloat(balance);
  const hasEnoughFunds = balanceNum >= escrowAmount;
  const shortfall = escrowAmount - balanceNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2E7] px-6 py-4">
          <h3 className="text-lg font-medium text-black">Fund Escrow Vault</h3>
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
          {/* Amount Needed */}
          <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-4 mb-4">
            <div className="text-xs text-[#787B86] mb-1">Amount Required</div>
            <div className="text-2xl font-medium text-black">${escrowAmount.toFixed(2)}</div>
            <div className="text-xs text-[#787B86] mt-1">USDC</div>
          </div>

          {/* Current Balance */}
          <div className="bg-white border border-[#E0E2E7] rounded-lg p-4 mb-6">
            <div className="text-xs text-[#787B86] mb-1">Your Wallet Balance</div>
            {loading ? (
              <div className="text-xl font-medium text-black">Loading...</div>
            ) : (
              <>
                <div className="text-xl font-medium text-black">${balance}</div>
                <div className="text-xs text-[#787B86] mt-1">USDC on Polygon</div>
              </>
            )}
          </div>

            {/* Insufficient Funds Warning */}
            {!loading && !hasEnoughFunds && (
            <div className="mb-6">
                <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg mb-4">
                <svg className="w-5 h-5 text-[#EF5350] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                    <p className="text-sm font-medium text-[#EF5350] mb-1">Add ${shortfall.toFixed(2)} More</p>
                    <p className="text-xs text-[#EF5350]">
                    Your current balance: ${balance} • Need: ${escrowAmount.toFixed(2)}
                    </p>
                </div>
                </div>

                <button
                onClick={() => {
                    onClose();
                    onDeposit();
                }}
                className="w-full py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium"
                >
                Add Funds
                </button>
            </div>
            )}

          {/* Sufficient Funds - Confirm */}
          {!loading && hasEnoughFunds && (
            <div className="mb-6">
              <div className="flex items-start gap-2 p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg mb-4">
                <svg className="w-5 h-5 text-[#2962FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-[#2962FF] mb-1">Ready to Fund</p>
                  <p className="text-xs text-[#787B86]">
                    ${escrowAmount.toFixed(2)} will be transferred from your wallet to the escrow vault. No gas fees required.
                  </p>
                </div>
              </div>

              <button
                onClick={handleFund}
                disabled={funding}
                className="w-full py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {funding ? 'Funding Vault...' : 'Confirm & Fund Vault'}
              </button>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-[#F8F9FD] rounded-lg">
            <svg className="w-4 h-4 text-[#2962FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-[#787B86]">
              This is a gasless transaction. Funds will be securely transferred from your wallet to the escrow smart contract.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}