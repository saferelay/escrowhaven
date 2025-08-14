'use client';

import { useState } from 'react';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';
import { Icon } from './icons';

interface MagicApprovalFlowProps {
  escrow: any;
  userRole: 'client' | 'freelancer';
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function MagicApprovalFlow({ escrow, userRole, onSuccess, onError }: MagicApprovalFlowProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [step, setStep] = useState<'ready' | 'signing' | 'submitting' | 'complete'>('ready');

  const handleApprove = async () => {
    setIsApproving(true);
    setStep('signing');

    try {
      // Get Magic instance
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!);
      
      // Check if user is logged in to Magic
      const isLoggedIn = await magic.user.isLoggedIn();
      if (!isLoggedIn) {
        throw new Error('Please log in to your wallet first');
      }

      // Create the approval message
      const approvalMessage = {
        escrowId: escrow.id,
        vaultAddress: escrow.vault_address,
        action: 'approve_full',
        amount: escrow.amount_cents,
        timestamp: Date.now(),
        userRole: userRole
      };

      // Create a user-friendly message for signing
      const readableMessage = `
SafeRelay Escrow Approval

I approve the release of funds for:
Escrow ID: ${escrow.id.slice(0, 8)}...
Amount: $${(escrow.amount_cents / 100).toFixed(2)}
Role: ${userRole === 'client' ? 'Payer' : 'Recipient'}

By signing, I confirm that:
${userRole === 'client' 
  ? '- The work has been completed satisfactorily\n- I authorize the release of funds to the freelancer'
  : '- I have delivered the agreed work\n- I accept the payment terms'
}

Timestamp: ${new Date(approvalMessage.timestamp).toLocaleString()}
      `.trim();

      // Get the provider from Magic
      const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
      const signer = provider.getSigner();
      
      // Sign the message
      console.log('Requesting signature...');
      const signature = await signer.signMessage(readableMessage);
      console.log('Signature obtained:', signature);

      setStep('submitting');

      // Submit the approval with signature
      const response = await fetch('/api/escrow/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          userEmail: userRole === 'client' ? escrow.client_email : escrow.freelancer_email,
          action: 'approve_full',
          signature,
          message: readableMessage,
          messageData: approvalMessage
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Approval failed');
      }

      setStep('complete');
      
      // Show success message
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error: any) {
      console.error('Approval error:', error);
      onError(error.message || 'Failed to approve. Please try again.');
      setStep('ready');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'ready' && (
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
        >
          <Icon name="check" className="w-5 h-5" />
          <span>Approve & Release Funds</span>
        </button>
      )}

      {step === 'signing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="animate-pulse mb-4">
            <Icon name="wallet" className="w-12 h-12 text-blue-600 mx-auto" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Sign with your Signing Wallet</h3>
          <p className="text-sm text-gray-600">
            Check your email for the Magic.link signing request
          </p>
        </div>
      )}

      {step === 'submitting' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="animate-spin mb-4">
            <Icon name="loading" className="w-12 h-12 text-gray-600 mx-auto" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Submitting Approval</h3>
          <p className="text-sm text-gray-600">
            Processing your signature...
          </p>
        </div>
      )}

      {step === 'complete' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <Icon name="check-circle" className="w-12 h-12 text-green-600 mx-auto" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Approval Complete!</h3>
          <p className="text-sm text-gray-600">
            {escrow.client_approved && escrow.freelancer_approved
              ? 'Both parties have approved. Funds will be released shortly.'
              : 'Your approval has been recorded. Waiting for the other party.'}
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">What happens next?</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Your approval is cryptographically signed and recorded</li>
          <li>• Funds will be immediately released to the recipient</li>
          <li>• The recipient can cash out instantly via TransakOne</li>
          <li>• You'll receive an email confirmation</li>
        </ul>
      </div>
    </div>
  );
}