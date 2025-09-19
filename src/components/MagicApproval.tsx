// src/components/MagicApproval.tsx
'use client';

import { useState } from 'react';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';

interface MagicApprovalProps {
  escrow: any;
  userRole: 'payer' | 'recipient';
  onSuccess: () => void;
}

export function MagicApproval({ escrow, userRole, onSuccess }: MagicApprovalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  const handleApprove = async () => {
    setLoading(true);
    setStatus('Initializing Magic...');
    
    try {
      const userEmail = userRole === 'payer' ? escrow.client_email : escrow.freelancer_email;
      
      // Initialize Magic
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!, {
        network: {
          rpcUrl: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
          chainId: 80002,
        }
      });
      
      // Check if logged in
      const isLoggedIn = await magic.user.isLoggedIn();
      if (!isLoggedIn) {
        setStatus('Check your email for login link...');
        await magic.auth.loginWithMagicLink({ email: userEmail });
      }
      
      // Get provider
      const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
      const signer = provider.getSigner();
      
      // Contract ABI
      const ESCROW_ABI = [
        "function approve() external",
        "function released() view returns (bool)"
      ];
      
      const escrowContract = new ethers.Contract(
        escrow.vault_address,
        ESCROW_ABI,
        signer
      );
      
      setStatus('Sending approval transaction...');
      
      // Send the transaction directly
      const tx = await escrowContract.approve();
      setStatus('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);
      
      // Check if released
      const isReleased = await escrowContract.released();
      
      // Update database
      const response = await fetch('/api/escrow/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          txHash: receipt.transactionHash,
          released: isReleased
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      setStatus(isReleased ? 'Funds released!' : 'Approval recorded!');
      setTimeout(onSuccess, 2000);
      
    } catch (error: any) {
      console.error('Approval error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? status : `Approve Release (${userRole})`}
      </button>
      
      {status && !loading && (
        <p className="text-sm text-center text-gray-600">{status}</p>
      )}
    </div>
  );
}