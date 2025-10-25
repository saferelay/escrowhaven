// src/components/dashboard/FundEscrowModal.tsx
// SIMPLE FIX - Uses the correct environment variable you just set

'use client';

import React, { useState } from 'react';
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
    setStatus('Preparing transfer...');

    try {
      console.log('[Fund] Starting transfer of $' + escrowAmount);
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

      // Get backend signer address FROM THE ENVIRONMENT VARIABLE YOU JUST SET
      const backendAddress = process.env.NEXT_PUBLIC_BACKEND_SIGNER_ADDRESS;
      
      if (!backendAddress) {
        throw new Error('Backend address not configured. Please contact support.');
      }
      
      console.log('[Fund] Backend address from env:', backendAddress);

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
          onDeposit(Math.ceil(needed)); // Round up to nearest dollar
          return;
        } else {
          throw new Error(`Insufficient funds. You have $${balanceFormatted} but need $${escrowAmount}.`);
        }
      }

      // STEP 4: Check allowance
      setStatus('Checking authorization...');
      console.log('[Fund] Checking approval allowance...');
      
      const allowance = await usdc.allowance(userAddress, backendAddress);
      const allowanceFormatted = ethers.utils.formatUnits(allowance, 6);
      const amountUsdc = ethers.utils.parseUnits(escrowAmount.toString(), 6);

      console.log('[Fund] Current allowance for', backendAddress, ':', allowanceFormatted);
      console.log('[Fund] Required amount:', escrowAmount);

      // STEP 5: Approve if needed
      if (allowance.lt(amountUsdc)) {
        setNeedsApproval(true);
        setStatus('Authorizing secure transfer...');
        
        console.log('[Fund] Need approval - requesting...');

        // Smart approval amount: 10x current transaction (max $1000)
        const approvalMultiplier = 10;
        const maxApproval = 1000;
        const calculatedApproval = Math.min(escrowAmount * approvalMultiplier, maxApproval);
        const approvalAmount = ethers.utils.parseUnits(calculatedApproval.toString(), 6);
        
        console.log(`[Fund] Requesting approval for $${calculatedApproval}...`);

        try {
          // Approve the CORRECT backend address
          const approveTx = await usdc.approve(backendAddress, approvalAmount);
          setStatus('Confirming authorization...');
          
          console.log('[Fund] Approval transaction sent:', approveTx.hash);
          
          const approveReceipt = await approveTx.wait();
          console.log('[Fund] ✅ Approval successful!');
          console.log('[Fund] Gas used:', approveReceipt.gasUsed.toString());
          
          setNeedsApproval(false);
          
        } catch (approvalError: any) {
          // If user doesn't have gas, backend will fund them
          if (approvalError.code === 'INSUFFICIENT_FUNDS' || 
              approvalError.message?.includes('insufficient funds') ||
              approvalError.message?.includes('gas required exceeds allowance')) {
            
            console.log('[Fund] User needs gas - calling backend to fund...');
            setStatus('Preparing wallet for first-time use...');
            
            // Call backend - it should fund user with gas
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
            
            const result = await response.json();
            console.log('[Fund] Backend response:', result);
            
            if (!response.ok) {
              // Check if it's just an approval issue
              if (result.approvalNeeded) {
                throw new Error('Please approve USDC spending first. You may need a small amount of MATIC for gas.');
              }
              throw new Error(result.error || 'Failed to prepare wallet');
            }
            
            // If backend says it funded the user, wait and retry
            if (result.userFunded || result.gasFunded) {
              console.log('[Fund] ✅ Backend funded wallet with gas!');
              console.log('[Fund] Waiting for gas to arrive...');
              
              // Wait for gas to propagate
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              // Retry approval now that user has gas
              console.log('[Fund] Retrying approval...');
              setStatus('Authorizing secure transfer...');
              
              const retryApproveTx = await usdc.approve(backendAddress, approvalAmount);
              console.log('[Fund] Retry approval sent:', retryApproveTx.hash);
              
              const retryReceipt = await retryApproveTx.wait();
              console.log('[Fund] ✅ Approval successful after gas funding!');
              
              setNeedsApproval(false);
            } else if (result.success) {
              // Transfer was successful without approval (shouldn't happen but handle it)
              console.log('[Fund] ✅ Transfer completed without additional approval!');
              setStatus('Transfer complete!');
              setTimeout(() => {
                onSuccess();
                onClose();
              }, 1500);
              return;
            } else {
              throw new Error(result.error || 'Authorization failed');
            }
          } else if (approvalError.code === 'ACTION_REJECTED' || approvalError.code === 4001) {
            // User rejected
            throw new Error('Authorization cancelled by user');
          } else {
            // Other approval errors
            throw approvalError;
          }
        }
      } else {
        console.log('[Fund] Already approved! No additional approval needed.');
      }

      // STEP 6: Call backend for gasless transfer
      setStatus('Processing secure transfer...');
      console.log('[Fund] Calling backend for gasless transfer...');

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
        
        // Special handling for allowance errors
        if (error.error?.includes('Insufficient allowance')) {
          // Show which address needs approval
          const correctAddress = error.backendAddress || backendAddress;
          throw new Error(
            `Please approve address ${correctAddress} to manage your USDC. ` +
            `Current allowance: ${error.currentAllowance || '0'}`
          );
        }
        
        throw new Error(error.error || 'Transfer failed');
      }

      const result = await response.json();
      console.log('[Fund] ✅ Gasless transfer complete!');
      console.log('[Fund] Transaction hash:', result.txHash);

      setStatus('Transfer complete!');
      
      // Show success for a moment
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('[Fund] Transfer failed:', error);
      setStatus('');
      setNeedsApproval(false);
      
      // User-friendly error messages
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('Transfer cancelled. Please try again when ready.');
      } else if (error.message?.includes('Insufficient funds')) {
        alert('You don\'t have enough USDC. Please add funds to your account first.');
      } else if (error.message?.includes('approve address')) {
        alert(error.message);
      } else if (error.message?.includes('Authorization cancelled')) {
        alert('You cancelled the authorization. Please try again when ready.');
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
          <h2 className="text-2xl font-medium" style={{ color: '#000000' }}>
            Fund Your Vault
          </h2>
          <p className="text-sm mt-1" style={{ color: '#787B86' }}>
            Transfer USDC to secure this escrow
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Amount Display */}
          <div 
            className="mb-6 p-4 rounded-lg text-center"
            style={{ backgroundColor: '#F8F9FD' }}
          >
            <p className="text-sm mb-2" style={{ color: '#787B86' }}>
              Escrow Amount
            </p>
            <p className="text-3xl font-medium" style={{ color: '#000000' }}>
              ${escrowAmount.toFixed(2)}
            </p>
            <p className="text-xs mt-2" style={{ color: '#787B86' }}>
              USDC on Polygon
            </p>
          </div>

          {/* Status Message */}
          {status && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 text-center">{status}</p>
            </div>
          )}

          {/* Info Box */}
          <div 
            className="mb-6 p-4 rounded-lg border"
            style={{ borderColor: '#E0E2E7', backgroundColor: '#FAFBFC' }}
          >
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: '#2962FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>Secure Transfer</p>
                  <p className="text-xs mt-0.5" style={{ color: '#787B86' }}>
                    {needsApproval ? 'One-time authorization required' : 'Your funds are protected by smart contracts'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: '#2962FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>No Gas Fees</p>
                  <p className="text-xs mt-0.5" style={{ color: '#787B86' }}>
                    We cover all transaction costs for you
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: '#2962FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#000000' }}>Protected Until Release</p>
                  <p className="text-xs mt-0.5" style={{ color: '#787B86' }}>
                    Funds stay locked until you approve
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vault Address */}
          <div className="mb-6">
            <p className="text-xs mb-1" style={{ color: '#787B86' }}>
              Vault Address
            </p>
            <div 
              className="p-2 rounded text-xs font-mono break-all"
              style={{ backgroundColor: '#F8F9FD', color: '#000000' }}
            >
              {vaultAddress}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-8 py-4 border-t flex gap-3"
          style={{ borderColor: '#E0E2E7' }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg border transition-colors"
            style={{
              borderColor: '#E0E2E7',
              color: '#000000'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleFund}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{
              backgroundColor: loading ? '#E0E2E7' : '#2962FF',
              color: loading ? '#787B86' : '#FFFFFF'
            }}
          >
            {loading ? 'Processing...' : `Fund $${escrowAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
}