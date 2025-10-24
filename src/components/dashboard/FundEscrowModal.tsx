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
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);

  if (!isOpen) return null;

  const handleFund = async () => {
    setLoading(true);
    setStatus('Preparing gasless transfer...');

    try {
      console.log('[Fund] Starting GASLESS transfer of $' + escrowAmount);
      console.log('[Fund] Vault address:', vaultAddress);

      // STEP 1: Get wallet
      const wallet = wallets.find(w => w.walletClientType === 'privy');
      if (!wallet) {
        throw new Error('No wallet found. Please refresh and try again.');
      }

      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      console.log('[Fund] User address:', userAddress);

      // Get backend signer address from environment
      const backendAddress = process.env.NEXT_PUBLIC_BACKEND_SIGNER_ADDRESS;
      
      if (!backendAddress) {
        throw new Error('Backend configuration error. Please contact support.');
      }

      console.log('[Fund] Backend address:', backendAddress);

      // STEP 2: USDC setup
      const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
      const USDC_ADDRESS = isProduction
        ? '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' // Polygon Mainnet
        : '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582'; // Polygon Amoy

      const USDC_ABI = [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function balanceOf(address owner) view returns (uint256)'
      ];

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

      // STEP 3: Check balance
      setStatus('Checking balance...');
      console.log('[Fund] Checking USDC balance...');
      
      const balance = await usdc.balanceOf(userAddress);
      const balanceFormatted = ethers.utils.formatUnits(balance, 6);
      console.log('[Fund] USDC balance:', balanceFormatted);

      if (parseFloat(balanceFormatted) < escrowAmount) {
        console.log('[Fund] Insufficient USDC balance');
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

      // STEP 4: Check allowance
      setStatus('Checking approval...');
      console.log('[Fund] Checking approval allowance...');
      
      const allowance = await usdc.allowance(userAddress, backendAddress);
      const allowanceFormatted = ethers.utils.formatUnits(allowance, 6);
      const amountUsdc = ethers.utils.parseUnits(escrowAmount.toString(), 6);

      console.log('[Fund] Current allowance:', allowanceFormatted);
      console.log('[Fund] Required amount:', escrowAmount);

      // STEP 5: Approve if needed (ONE-TIME SETUP)
      if (allowance.lt(amountUsdc)) {
        setNeedsApproval(true);
        setStatus('One-time approval needed...');
        
        console.log('[Fund] Insufficient allowance detected');
        console.log('[Fund] Requesting approval for backend to transfer USDC');
        console.log('[Fund] NOTE: This approval costs a small gas fee (~$0.01)');
        console.log('[Fund] NOTE: After approval, all future transfers are gasless!');

        // Approve a large amount so user doesn't need to approve again
        const approvalAmount = ethers.utils.parseUnits('10000', 6); // $10,000 approval
        
        console.log('[Fund] Requesting approval for $10,000 (covers many escrows)');
        
        const approveTx = await usdc.approve(backendAddress, approvalAmount);
        setStatus('Approving... (costs ~$0.01 gas, one-time only)');
        
        console.log('[Fund] Approval transaction sent:', approveTx.hash);
        
        const approveReceipt = await approveTx.wait();
        console.log('[Fund] ✅ Approval successful!');
        console.log('[Fund] Transaction:', approveReceipt.transactionHash);
        console.log('[Fund] All future transfers will be gasless!');
        
        setNeedsApproval(false);
      } else {
        console.log('[Fund] Already approved! No approval needed.');
      }

      // STEP 6: Call backend for gasless transfer
      setStatus('Processing gasless transfer...');
      console.log('[Fund] Calling backend for gasless transfer...');
      console.log('[Fund] Backend will pay the gas fee!');

      const response = await fetch('/api/escrow/gasless-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId,
          action: 'fund',
          amount: escrowAmount,
          vaultAddress,
          signerAddress: userAddress
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Fund] Backend error:', error);
        throw new Error(error.error || 'Transfer failed');
      }

      const result = await response.json();
      console.log('[Fund] ✅ Gasless transfer complete!');
      console.log('[Fund] Transaction:', result.txHash);
      console.log('[Fund] ✅ Gas paid by backend! User paid $0');
      console.log('[Fund] Gas used:', result.gasUsed);
      console.log('[Fund] Explorer:', result.explorer);

      setStatus('Transfer complete!');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('[Fund] Transfer failed:', error);
      setStatus('');
      setNeedsApproval(false);
      
      // Handle specific error cases
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('Transfer cancelled. Please try again when ready.');
      } else if (error.message?.includes('Insufficient funds') || error.message?.includes('insufficient')) {
        alert('You don\'t have enough USDC. Please add funds to your account first.');
      } else if (error.message?.includes('Backend configuration')) {
        alert('Configuration error. Please contact support.');
      } else if (error.message?.includes('approval')) {
        alert('Approval needed. This is a one-time setup that costs ~$0.01 in gas. After this, all transfers are gasless!');
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
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg" style={{ 
              backgroundColor: needsApproval ? '#FFF9E6' : '#F8F9FD' 
            }}>
              <div 
                className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" 
                style={{ 
                  borderColor: needsApproval ? '#F7931A' : '#2962FF',
                  borderTopColor: 'transparent' 
                }}
              />
              <span className="text-sm font-medium" style={{ 
                color: needsApproval ? '#F7931A' : '#2962FF' 
              }}>{status}</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>Gasless Transfer</p>
                  <p className="text-sm mt-1" style={{ color: '#787B86' }}>We pay the gas fee - you pay exactly what you see</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#26A69A" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>You're In Control</p>
                  <p className="text-sm mt-1" style={{ color: '#787B86' }}>Release payment only when satisfied</p>
                </div>
              </div>
            </div>
          )}

          {/* First-time Setup Note */}
          {!loading && (
            <div className="text-xs text-center p-3 rounded-lg" style={{ 
              backgroundColor: '#F8F9FD',
              color: '#787B86'
            }}>
              <strong>First-time setup:</strong> You may need to approve USDC transfers once (~$0.01 gas).
              After that, all future escrow fundings are gasless!
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Transfer ${escrowAmount.toFixed(2)} (Gasless!)</span>
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