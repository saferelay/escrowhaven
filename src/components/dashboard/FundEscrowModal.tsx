// src/components/dashboard/FundEscrowModal.tsx
'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

interface FundEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowAmount: number;
  escrowId: string;
  vaultAddress: string;
  onSuccess: () => void;
  onDeposit?: (suggestedAmount?: number) => void;
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
  const { createWallet } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleFund = async () => {
    setLoading(true);
    setStatus('Preparing transfer...');

    try {
      console.log('[Fund] Starting transfer of $' + escrowAmount);

      // Get wallet
      setStatus('Setting up your account...');
      
      let wallet = wallets.find((w) => 
        w.walletClientType === 'privy' && 
        w.connectorType === 'embedded'
      );
      
      if (!wallet) {
        console.log('[Fund] Creating wallet...');
        await createWallet();
        await new Promise(resolve => setTimeout(resolve, 2000));
        wallet = wallets.find((w) => 
          w.walletClientType === 'privy' && 
          w.connectorType === 'embedded'
        );
      }

      if (!wallet) {
        throw new Error('Unable to access your account. Please refresh and try again.');
      }

      console.log('[Fund] Using wallet:', wallet.address);

      // Network setup
      const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
      const chainId = isProduction ? 137 : 80002;
      
      await wallet.switchChain(chainId);

      // Get provider
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      // USDC contract
      const USDC_ADDRESS = isProduction
        ? '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
        : '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582';

      const USDC_ABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address owner) view returns (uint256)'
      ];

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

      // Check balance
      const userAddress = await signer.getAddress();
      const balance = await usdc.balanceOf(userAddress);
      const balanceFormatted = ethers.utils.formatUnits(balance, 6);
      
      console.log('[Fund] Account balance: $' + balanceFormatted);

      if (parseFloat(balanceFormatted) < escrowAmount) {
        if (onDeposit) {
          const needed = escrowAmount - parseFloat(balanceFormatted);
          setLoading(false);
          setStatus('');
          onClose();
          onDeposit(needed);
          return;
        } else {
          throw new Error(`Insufficient funds. You have $${balanceFormatted} but need $${escrowAmount}.`);
        }
      }

      // Transfer
      const amount = ethers.utils.parseUnits(escrowAmount.toString(), 6);
      
      console.log('[Fund] Transferring $' + escrowAmount + ' to secure vault');
      setStatus('Please approve the transfer...');

      const tx = await usdc.transfer(vaultAddress, amount);
      
      console.log('[Fund] Transfer initiated:', tx.hash);
      setStatus('Processing transfer...');

      await tx.wait();
      
      console.log('[Fund] Transfer complete!');

      // Notify backend
      setStatus('Confirming...');
      
      try {
        await fetch('/api/escrow/confirm-funding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            escrowId,
            txHash: tx.hash,
            vaultAddress: vaultAddress
          })
        });
      } catch (error) {
        console.warn('[Fund] Backend notification failed, but transfer succeeded');
      }

      // Success
      setStatus('Transfer complete!');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('[Fund] Transfer failed:', error);
      setStatus('');
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('Transfer cancelled. Please try again when ready.');
      } else if (error.message?.includes('Insufficient funds') || error.message?.includes('insufficient')) {
        alert('You don\'t have enough funds. Please add money to your account first.');
      } else {
        alert(`Transfer failed: ${error.message || 'Please try again or contact support.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Fund Escrow</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Amount Display */}
          <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 mb-2">Amount to transfer</p>
            <p className="text-4xl font-bold text-gray-900">${escrowAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Secure escrow payment</p>
          </div>

          {/* Status Message */}
          {status && (
            <div className="flex items-center gap-3 py-3 px-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm text-blue-900 font-medium">{status}</span>
            </div>
          )}

          {/* Info Box */}
          {!loading && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Protection</p>
                  <p className="text-xs text-gray-600 mt-0.5">Funds held safely until work is approved</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">You're In Control</p>
                  <p className="text-xs text-gray-600 mt-0.5">Release payment only when satisfied</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">No Hidden Fees</p>
                  <p className="text-xs text-gray-600 mt-0.5">What you see is what you pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleFund}
              disabled={loading}
              className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Transfer ${escrowAmount.toFixed(2)}</span>
                </>
              )}
            </button>
            
            {!loading && (
              <button
                onClick={onClose}
                className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500">
              Funds will be held securely in escrow until you approve release to the freelancer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}