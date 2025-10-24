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
      
      console.log('[Fund] Switching to chain:', chainId);
      await wallet.switchChain(chainId);

      // Get ethereum provider
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const userAddress = await ethersProvider.getSigner().getAddress();

      // USDC contract
      const USDC_ADDRESS = isProduction
        ? '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
        : '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582';

      const USDC_ABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address owner) view returns (uint256)'
      ];

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, ethersProvider);

      // Check USDC balance
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

      // Prepare transaction
      const amount = ethers.utils.parseUnits(escrowAmount.toString(), 6);
      const usdcInterface = new ethers.utils.Interface(USDC_ABI);
      const data = usdcInterface.encodeFunctionData('transfer', [vaultAddress, amount]);
      
      console.log('[Fund] Transferring $' + escrowAmount + ' to secure vault');
      console.log('[Fund] Using Privy gas sponsorship...');
      setStatus('Please approve the transfer...');

      // CRITICAL: Use provider.request() to send transaction through Privy's paymaster
      const txRequest = {
        from: userAddress,
        to: USDC_ADDRESS,
        data: data,
        value: '0x0'
      };

      console.log('[Fund] Sending transaction via Privy provider...');
      
      // This routes through Privy's paymaster for gas sponsorship
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txRequest]
      });
      
      console.log('[Fund] Transaction sent:', txHash);
      console.log('[Fund] Gas sponsored by Privy! User paid $0 for gas');
      setStatus('Processing transfer...');

      // Wait for confirmation
      const receipt = await ethersProvider.waitForTransaction(txHash as string);
      
      console.log('[Fund] Transfer complete in block:', receipt.blockNumber);

      // Notify backend
      setStatus('Confirming...');
      
      try {
        await fetch('/api/escrow/confirm-funding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            escrowId,
            txHash: txHash,
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
      } else if (error.message?.includes('gas')) {
        alert('Transaction failed. Please contact support if this continues.');
      } else {
        alert(`Transfer failed: ${error.message || 'Please try again or contact support.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)' }}>
        {/* Header */}
        <div className="px-8 py-6 border-b" style={{ borderColor: '#E0E2E7' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-normal" style={{ color: '#000000' }}>Fund Escrow</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 rounded transition-all disabled:opacity-50"
              style={{ 
                color: '#787B86',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#F8F9FD';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Amount Display */}
          <div className="text-center py-8 rounded-xl border" style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0E2E7'
          }}>
            <p className="text-sm mb-2" style={{ color: '#787B86' }}>Amount to transfer</p>
            <p className="text-5xl font-normal" style={{ color: '#000000' }}>
              ${escrowAmount.toFixed(2)}
            </p>
            <p className="text-xs mt-2" style={{ color: '#B2B5BE' }}>Secure escrow payment</p>
          </div>

          {/* Status Message */}
          {status && (
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg" style={{ backgroundColor: '#F8F9FD' }}>
              <div 
                className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" 
                style={{ borderColor: '#2962FF', borderTopColor: 'transparent' }}
              />
              <span className="text-sm font-medium" style={{ color: '#2962FF' }}>{status}</span>
            </div>
          )}

          {/* Info Box */}
          {!loading && (
            <div className="rounded-lg p-6 space-y-4" style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0E2E7'
            }}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#26A69A" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>Secure Protection</p>
                  <p className="text-sm mt-1" style={{ color: '#787B86' }}>Funds held safely until work is approved</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#26A69A" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>You're In Control</p>
                  <p className="text-sm mt-1" style={{ color: '#787B86' }}>Release payment only when satisfied</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#26A69A" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>No Transaction Fees</p>
                  <p className="text-sm mt-1" style={{ color: '#787B86' }}>Transfer exactly what you see</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleFund}
              disabled={loading}
              className="flex-1 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: loading ? '#B2B5BE' : '#2962FF',
                color: '#FFFFFF',
                padding: '12px 32px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1E53E5';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(41, 98, 255, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2962FF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <div 
                    className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" 
                    style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }}
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Transfer ${escrowAmount.toFixed(2)}</span>
                </>
              )}
            </button>
            
            {!loading && (
              <button
                onClick={onClose}
                className="rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#787B86',
                  padding: '12px 32px',
                  border: '1px solid #E0E2E7',
                  fontSize: '16px',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#787B86';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E0E2E7';
                  e.currentTarget.style.color = '#787B86';
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t" style={{ borderColor: '#E0E2E7' }}>
            <p className="text-xs text-center" style={{ color: '#787B86' }}>
              Funds will be held securely in escrow until you approve release to the freelancer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}