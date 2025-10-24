// src/components/dashboard/FundEscrowModal.tsx
'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

interface FundEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowAmount: number;
  escrowId: string;
  vaultAddress?: string;
  onSuccess: () => void;
  onDeposit?: (suggestedAmount?: number) => void;
}

export function FundEscrowModal({
  isOpen,
  onClose,
  escrowAmount,
  escrowId,
  vaultAddress: initialVaultAddress,
  onSuccess,
  onDeposit
}: FundEscrowModalProps) {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [vaultAddress, setVaultAddress] = useState(initialVaultAddress);

  if (!isOpen) return null;

  const handleFund = async () => {
    setLoading(true);
    setStatus('Preparing vault...');

    try {
      // Step 1: Deploy vault contract (backend pays gas)
      console.log('[Fund] Step 1: Deploying vault...');
      setStatus('Deploying secure vault...');

      const deployResponse = await fetch('/api/escrow/deploy-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId })
      });

      if (!deployResponse.ok) {
        const error = await deployResponse.json();
        throw new Error(error.error || 'Failed to deploy vault');
      }

      const { vaultAddress: deployedVault, alreadyDeployed } = await deployResponse.json();
      setVaultAddress(deployedVault);

      console.log('[Fund] Vault ready:', deployedVault);
      if (alreadyDeployed) {
        console.log('[Fund] Vault was already deployed');
      }

      // Step 2: Transfer USDC to vault using Privy gasless
      console.log('[Fund] Step 2: Transferring USDC...');
      setStatus('Please approve USDC transfer in your wallet...');

      // Get Privy embedded wallet
      const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
      
      if (!embeddedWallet) {
        throw new Error('Privy wallet not found. Please reconnect your wallet.');
      }

      // Determine network
      const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
      const chainId = isProduction ? 137 : 80002; // Polygon mainnet : Amoy testnet
      
      console.log('[Fund] Switching to chain:', chainId);
      await embeddedWallet.switchChain(chainId);

      // Get provider and signer
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      // USDC contract address
      const USDC_ADDRESS = isProduction
        ? '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' // Polygon mainnet USDC
        : '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582'; // Amoy testnet USDC

      console.log('[Fund] Using USDC at:', USDC_ADDRESS);

      // USDC contract ABI
      const USDC_ABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

      // Check user's USDC balance
      const userAddress = await signer.getAddress();
      const balance = await usdc.balanceOf(userAddress);
      const balanceFormatted = ethers.utils.formatUnits(balance, 6);
      
      console.log('[Fund] User USDC balance:', balanceFormatted);

      if (parseFloat(balanceFormatted) < escrowAmount) {
        // User doesn't have enough USDC
        if (onDeposit) {
          // Offer to deposit USDC first
          const needed = escrowAmount - parseFloat(balanceFormatted);
          setLoading(false);
          setStatus('');
          onClose();
          onDeposit(needed);
          return;
        } else {
          throw new Error(`Insufficient USDC. You have ${balanceFormatted} USDC but need ${escrowAmount} USDC.`);
        }
      }

      // Convert amount to USDC units (6 decimals)
      const amount = ethers.utils.parseUnits(escrowAmount.toString(), 6);
      
      console.log('[Fund] Transferring', escrowAmount, 'USDC to vault:', deployedVault);
      setStatus('Transferring USDC to vault...');

      // Transfer USDC to vault
      // With Privy gasless enabled, user won't need MATIC!
      const tx = await usdc.transfer(deployedVault, amount);
      
      console.log('[Fund] Transaction sent:', tx.hash);
      setStatus('Confirming transaction...');

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('[Fund] Transaction confirmed in block:', receipt.blockNumber);

      // Step 3: Confirm funding with backend
      console.log('[Fund] Step 3: Confirming funding...');
      setStatus('Finalizing...');

      const confirmResponse = await fetch('/api/escrow/confirm-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId,
          txHash: tx.hash,
          vaultAddress: deployedVault
        })
      });

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json();
        throw new Error(error.error || 'Failed to confirm funding');
      }

      const confirmData = await confirmResponse.json();
      console.log('[Fund] Funding confirmed:', confirmData);

      // Success!
      setStatus('Vault funded successfully!');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('[Fund] Funding failed:', error);
      setStatus('');
      
      // Handle specific errors
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('Transaction cancelled. Please try again.');
      } else if (error.message?.includes('insufficient funds')) {
        alert('Insufficient USDC balance. Please deposit USDC first.');
      } else if (error.message?.includes('Insufficient USDC')) {
        alert(error.message);
      } else {
        alert(`Funding failed: ${error.message || 'Unknown error'}`);
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
            <h3 className="text-lg font-semibold text-gray-900">Fund Vault</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
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
          <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Amount to fund</p>
            <p className="text-3xl font-bold text-gray-900">${escrowAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">USDC on Polygon</p>
          </div>

          {/* Vault Address (if available) */}
          {vaultAddress && (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500 mb-1">Vault Address</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {vaultAddress}
              </p>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div className="flex items-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              <span>{status}</span>
            </div>
          )}

          {/* Info Box */}
          {!loading && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Gasless transaction - no MATIC needed!</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Secure vault deployed on Polygon blockchain</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Protected until you approve release</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleFund}
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Fund Vault
                </>
              )}
            </button>
            
            {!loading && (
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Small Print */}
          <p className="text-xs text-center text-gray-500">
            Make sure you have at least ${escrowAmount.toFixed(2)} USDC in your wallet
          </p>
        </div>
      </div>
    </div>
  );
}