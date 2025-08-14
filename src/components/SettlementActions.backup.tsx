'use client';

import { useState } from 'react';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';
import { Icon } from './icons';
import { useAuth } from '@/contexts/AuthContext';
import { getEnvConfig } from '@/lib/environment';

interface SettlementActionsProps {
  escrow: any;
  userRole: 'payer' | 'recipient';
  onAction: (action: any) => Promise<void>;
}

// EIP-712 Domain helper (only for actual blockchain transactions)
const getEIP712Domain = (contractAddress: string, chainId: number) => ({
  name: 'SafeRelay',
  version: '2.1',
  chainId: chainId,
  verifyingContract: contractAddress
});

export function SettlementActions({ escrow, userRole, onAction }: SettlementActionsProps) {
  const { user, magic } = useAuth();
  const [showForm, setShowForm] = useState<'settle' | 'refund' | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [signingStep, setSigningStep] = useState<'idle' | 'signing' | 'submitting'>('idle');

  // The parent component passes us the remaining amount as amount_cents
  const remainingAmount = escrow.amount_cents / 100;

  // Helper function to ensure Magic login with correct email
  const ensureMagicLogin = async (requiredEmail: string): Promise<Magic> => {
    let magicInstance = magic;
    
    if (!magicInstance) {
      magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!);
    }
    
    const isLoggedIn = await magicInstance.user.isLoggedIn();
    
    if (isLoggedIn) {
      const userInfo = await magicInstance.user.getInfo();
      if (userInfo.email !== requiredEmail) {
        console.log(`Logged in as ${userInfo.email}, but need ${requiredEmail}`);
        await magicInstance.user.logout();
        await magicInstance.auth.loginWithMagicLink({ email: requiredEmail });
      }
    } else {
      console.log(`Not logged in, logging in with ${requiredEmail}`);
      await magicInstance.auth.loginWithMagicLink({ email: requiredEmail });
    }
    
    return magicInstance;
  };

  // Release full payment (Client only - V2.1)
  const handleApproveRelease = async () => {
    setLoading(true);
    
    try {
      console.log('Starting release process...');
      console.log('Contract version:', escrow.contract_version);
      console.log('Vault address:', escrow.vault_address);
      console.log('Remaining amount to release:', remainingAmount);
      
      if (userRole !== 'payer') {
        throw new Error('Only the client can release payment');
      }
      
      const requiredEmail = escrow.client_email;
      const magicInstance = await ensureMagicLogin(requiredEmail);
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(magicInstance.rpcProvider as any);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log('Signer address:', signerAddress);
      console.log('Expected client address:', escrow.client_wallet_address);
      
      // Verify the signer matches
      if (signerAddress.toLowerCase() !== escrow.client_wallet_address?.toLowerCase()) {
        throw new Error(`Wallet mismatch. Magic returned ${signerAddress} but expected ${escrow.client_wallet_address}. Please try logging out and back in.`);
      }
      
      setSigningStep('signing');
      
      // Create nonce and deadline
      const nonce = Date.now();
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      
      if (escrow.contract_version === 'v2.1' && escrow.vault_address) {
        console.log('Using EIP-712 signature for V2.1 contract');
        
        // Get chain ID from environment
        const chainId = getEnvConfig().chainId;
        
        // EIP-712 Domain
        const domain = getEIP712Domain(escrow.vault_address, chainId);
        
        // EIP-712 Types for the contract
        const types = {
          ReleasePayment: [
            { name: 'action', type: 'string' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        };
        
        // Values to sign - use the remaining amount
        const value = {
          action: 'Release Full Payment',
          recipient: escrow.freelancer_wallet_address,
          amount: ethers.utils.parseUnits(remainingAmount.toString(), 6), // USDC has 6 decimals
          nonce: nonce,
          deadline: deadline
        };
        
        console.log('EIP-712 Domain:', domain);
        console.log('EIP-712 Types:', types);
        console.log('EIP-712 Value:', value);
        
        // Sign using EIP-712
        const signature = await signer._signTypedData(domain, types, value);
        
        console.log('Signature obtained:', signature);
        
        setSigningStep('submitting');
        
        const response = await fetch('/api/escrow/release-v2-1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            escrowId: escrow.id,
            action: 'release',
            userEmail: requiredEmail,
            signature,
            nonce: nonce.toString(),
            deadline: deadline.toString(),
            eip712: true,
            domain,
            types,
            value,
            signerAddress,
            amountToRelease: remainingAmount.toString() // Send the actual amount
          })
        });
        
        const result = await response.json();
        console.log('API Response:', response.status, result);
        
        if (!response.ok) {
          console.error('API Error Details:', result);
          throw new Error(result.details || result.error || 'Transaction failed');
        }
        
        await onAction({ type: 'released', ...result });
      }
      
    } catch (error: any) {
      console.error('Release error:', error);
      alert(error.message || 'Failed to release payment');
    } finally {
      setLoading(false);
      setSigningStep('idle');
    }
  };

  // Refund full amount (Freelancer only - V2.1)
  const handleRefund = async () => {
    if (userRole !== 'recipient') return;
    
    setLoading(true);
    setSigningStep('signing');

    try {
      console.log('Starting refund process...');
      console.log('Remaining amount to refund:', remainingAmount);
      
      const requiredEmail = escrow.freelancer_email;
      const magicInstance = await ensureMagicLogin(requiredEmail);
      
      const provider = new ethers.providers.Web3Provider(magicInstance.rpcProvider as any);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log('Signer address:', signerAddress);
      console.log('Expected freelancer address:', escrow.freelancer_wallet_address);
      
      if (signerAddress.toLowerCase() !== escrow.freelancer_wallet_address?.toLowerCase()) {
        throw new Error(`Wallet mismatch. Magic returned ${signerAddress} but expected ${escrow.freelancer_wallet_address}`);
      }
      
      const nonce = Date.now();
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      if (escrow.contract_version === 'v2.1' && escrow.vault_address) {
        console.log('Using EIP-712 signature for refund');
        
        const chainId = getEnvConfig().chainId;
        const domain = getEIP712Domain(escrow.vault_address, chainId);
        
        const types = {
          RefundPayment: [
            { name: 'action', type: 'string' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        };
        
        const value = {
          action: 'Refund Full Payment',
          recipient: escrow.client_wallet_address,
          amount: ethers.utils.parseUnits(remainingAmount.toString(), 6),
          nonce: nonce,
          deadline: deadline
        };
        
        const signature = await signer._signTypedData(domain, types, value);
        
        setSigningStep('submitting');
        
        const response = await fetch('/api/escrow/release-v2-1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            escrowId: escrow.id,
            action: 'refund',
            userEmail: requiredEmail,
            signature,
            nonce: nonce.toString(),
            deadline: deadline.toString(),
            eip712: true,
            domain,
            types,
            value,
            signerAddress,
            amountToRefund: remainingAmount.toString()
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.details || result.error || 'Failed to process refund');
        }
        
        await onAction({ type: 'refunded', ...result });
      }
      
    } catch (error: any) {
      console.error('Refund error:', error);
      alert(error.message || 'Failed to process refund');
    } finally {
      setLoading(false);
      setSigningStep('idle');
    }
  };

  // Propose settlement (simplified - no signatures)
  const handleSettlement = async () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount) {
      alert(`Please enter a valid amount between $0 and $${remainingAmount.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      const requiredEmail = userRole === 'payer' ? escrow.client_email : escrow.freelancer_email;
      const freelancerAmount = parseFloat(amount);
      const clientRefund = remainingAmount - freelancerAmount;
      
      console.log('Proposing settlement:', {
        freelancerGets: freelancerAmount,
        clientGetsBack: clientRefund,
        remainingInEscrow: remainingAmount,
        reason: reason || 'No reason provided'
      });
      
      const response = await fetch('/api/escrow/settle/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          userEmail: requiredEmail,
          settlementProposal: {
            proposedBy: userRole,
            freelancerAmount: freelancerAmount,
            clientRefund: clientRefund,
            reason: reason || ''
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit settlement proposal');
      }

      // Show info about the proposal
      if (result.proposal) {
        console.log('Proposal created:', result.proposal);
      }

      await onAction({ type: 'settlement_proposed' });
      setShowForm(null);
      setAmount('');
      setReason('');
      
    } catch (error: any) {
      console.error('Settlement error:', error);
      alert(error.message || 'Failed to propose settlement');
    } finally {
      setLoading(false);
    }
  };

  // Execute settlement after both parties agree (Client only)
  const handleExecuteSettlement = async () => {
    if (userRole !== 'payer' || escrow.contract_version !== 'v2.1') {
      return;
    }
    
    setLoading(true);
    setSigningStep('signing');
    
    try {
      const requiredEmail = escrow.client_email;
      const magicInstance = await ensureMagicLogin(requiredEmail);
      
      const provider = new ethers.providers.Web3Provider(magicInstance.rpcProvider as any);
      const signer = provider.getSigner();
      
      const nonce = Date.now();
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      const chainId = getEnvConfig().chainId;
      const domain = getEIP712Domain(escrow.vault_address, chainId);
      
      const types = {
        SettlementRelease: [
          { name: 'action', type: 'string' },
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'totalAmount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      };
      
      // Get the agreed settlement amount
      const settlementAmount = ethers.utils.parseUnits(
        (escrow.settlement_amount_cents / 100).toString(), 
        6 // USDC decimals
      );
      
      // Total amount in the escrow (remaining amount)
      const totalAmountWei = ethers.utils.parseUnits(
        remainingAmount.toString(),
        6
      );
      
      const value = {
        action: 'Settlement Release',
        recipient: escrow.freelancer_wallet_address,
        amount: settlementAmount,
        totalAmount: totalAmountWei,
        nonce: nonce,
        deadline: deadline
      };
      
      const signature = await signer._signTypedData(domain, types, value);
      const signerAddress = await signer.getAddress();
      
      setSigningStep('submitting');
      
      const response = await fetch('/api/escrow/release-v2-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          action: 'settlement',
          userEmail: requiredEmail,
          signature,
          nonce: nonce.toString(),
          deadline: deadline.toString(),
          settlementAmount: (escrow.settlement_amount_cents / 100).toString(),
          eip712: true,
          domain,
          types,
          value,
          signerAddress
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to execute settlement');
      }
      
      await onAction({ type: 'settlement_executed', ...result });
      
    } catch (error: any) {
      console.error('Settlement execution error:', error);
      alert(error.message || 'Failed to execute settlement');
    } finally {
      setLoading(false);
      setSigningStep('idle');
    }
  };

  // Check if user has a pending settlement
  const userHasProposedSettlement = escrow.settlement_proposed_by === userRole;
  const otherPartyProposedSettlement = escrow.settlement_proposed_by && 
    escrow.settlement_proposed_by !== userRole;
  const bothPartiesAgreedToSettlement = escrow.settlement_proposed_by && 
    escrow.settlement_accepted_by;

  // If other party proposed, show the response component
  if (otherPartyProposedSettlement && !escrow.settlement_accepted_by) {
    return <SettlementResponse escrow={escrow} userRole={userRole} onAction={onAction} remainingAmount={remainingAmount} />;
  }

  // If both parties agreed to settlement and client needs to execute
  if (bothPartiesAgreedToSettlement && userRole === 'payer' && escrow.status === 'FUNDED') {
    const settlementFreelancerAmount = escrow.settlement_amount_cents / 100;
    const settlementClientRefund = remainingAmount - settlementFreelancerAmount;
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3 mb-4">
          <Icon name="check" className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Settlement Agreed</h3>
            <p className="text-gray-700">
              Both parties have agreed to the settlement. As the client, you need to execute the partial release.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Freelancer receives:</span>
              <span className="font-mono font-medium">${settlementFreelancerAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">You get back:</span>
              <span className="font-mono font-medium">${settlementClientRefund.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span className="text-sm">From total remaining:</span>
              <span className="font-mono">${remainingAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
          <p className="text-sm text-amber-800">
            <Icon name="info" className="inline w-4 h-4 mr-1" />
            <strong>Note:</strong> This will release ${settlementFreelancerAmount.toFixed(2)} to the freelancer 
            and return ${settlementClientRefund.toFixed(2)} to you. This will fully settle the current escrow balance.
          </p>
        </div>
        
        <button
          onClick={handleExecuteSettlement}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
        >
          <Icon name="check" className="w-5 h-5" />
          <span>
            {signingStep === 'signing' ? 'Sign with Magic...' : 
             signingStep === 'submitting' ? 'Executing Settlement...' : 
             'Execute Partial Release'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show waiting message if user proposed settlement */}
      {userHasProposedSettlement && !escrow.settlement_accepted_by && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
          <div className="flex items-start space-x-3">
            <Icon name="clock" className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Settlement Proposed</h3>
              <p className="text-gray-700">
                You've proposed a partial release from the remaining ${remainingAmount.toFixed(2)}:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Freelancer receives: <strong>${(escrow.settlement_amount_cents / 100).toFixed(2)}</strong></li>
                <li>• You get back: <strong>${(remainingAmount - (escrow.settlement_amount_cents / 100)).toFixed(2)}</strong></li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Waiting for the {userRole === 'payer' ? 'freelancer' : 'client'} to respond.
              </p>
              {escrow.settlement_reason && (
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Reason:</span> {escrow.settlement_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Hide if user has proposed settlement */}
      {!userHasProposedSettlement && !bothPartiesAgreedToSettlement && (
        <div className="space-y-3">
          {/* Client Options */}
          {userRole === 'payer' && (
            <div className="grid grid-cols-2 gap-3">
              {escrow.contract_version === 'v2.1' && (
                <button
                  onClick={handleApproveRelease}
                  disabled={loading || escrow.status !== 'FUNDED'}
                  className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="check" className="w-5 h-5" />
                  <span>
                    {signingStep === 'signing' ? 'Sign with Magic...' : 
                     signingStep === 'submitting' ? 'Releasing...' : 
                     `Release $${remainingAmount.toFixed(2)}`}
                  </span>
                </button>
              )}

              <button
                onClick={() => setShowForm('settle')}
                disabled={escrow.status !== 'FUNDED'}
                className="bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="scale" className="w-5 h-5" />
                <span>Propose Partial Release</span>
              </button>
            </div>
          )}

          {/* Freelancer Options */}
          {userRole === 'recipient' && (
            <>
              {escrow.contract_version === 'v2.1' && (
                <button
                  onClick={handleRefund}
                  disabled={loading || escrow.status !== 'FUNDED'}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="refund" className="w-5 h-5" />
                  <span>
                    {signingStep === 'signing' ? 'Sign with Magic...' : 
                     signingStep === 'submitting' ? 'Refunding...' : 
                     `Refund $${remainingAmount.toFixed(2)}`}
                  </span>
                </button>
              )}

              <button
                onClick={() => setShowForm('settle')}
                disabled={escrow.status !== 'FUNDED'}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="scale" className="w-5 h-5" />
                <span>Propose Partial Release</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Settlement Form */}
      {showForm === 'settle' && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Propose Partial Release</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <p className="text-sm text-blue-800">
              <Icon name="info" className="inline w-4 h-4 mr-1" />
              Propose how to split the remaining ${remainingAmount.toFixed(2)}. The other party must agree before funds can be released.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount freelancer receives
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
                max={remainingAmount}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Remaining in escrow: ${remainingAmount.toFixed(2)}
            </p>
            {amount && parseFloat(amount) <= remainingAmount && (
              <p className="text-sm text-gray-600 mt-2">
                Client gets back: ${(remainingAmount - parseFloat(amount)).toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Explain why you're proposing this amount..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSettlement}
              disabled={loading || !amount}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Submitting...' : 'Propose Settlement'}
            </button>
            <button
              onClick={() => {
                setShowForm(null);
                setAmount('');
                setReason('');
              }}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified component to handle settlement responses
interface SettlementResponseProps {
  escrow: any;
  userRole: 'payer' | 'recipient';
  onAction: (action: any) => Promise<void>;
  remainingAmount: number;
}

function SettlementResponse({ escrow, userRole, onAction, remainingAmount }: SettlementResponseProps) {
  const [loading, setLoading] = useState(false);
  
  const proposedAmount = escrow.settlement_amount_cents / 100;
  const proposer = escrow.settlement_proposed_by;
  
  const freelancerReceives = proposedAmount;
  const clientRefund = remainingAmount - proposedAmount;
  
  const handleAcceptSettlement = async () => {
    setLoading(true);
    
    try {
      const requiredEmail = userRole === 'payer' ? escrow.client_email : escrow.freelancer_email;

      const response = await fetch('/api/escrow/settle/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          userEmail: requiredEmail,
          action: 'accept'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept settlement');
      }
      
      await onAction({ type: 'settlement_accepted' });
    } catch (error: any) {
      alert(error.message || 'Failed to accept settlement');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectSettlement = async () => {
    setLoading(true);
    
    try {
      const requiredEmail = userRole === 'payer' ? escrow.client_email : escrow.freelancer_email;
      const rejectReason = prompt('Please provide a reason for rejecting this proposal (optional):');

      const response = await fetch('/api/escrow/settle/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          userEmail: requiredEmail,
          action: 'reject',
          reason: rejectReason || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject settlement');
      }
      
      await onAction({ type: 'settlement_rejected' });
    } catch (error: any) {
      alert(error.message || 'Failed to reject settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start space-x-3 mb-4">
        <Icon name="scale" className="w-6 h-6 text-amber-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Settlement Proposed</h3>
          <p className="text-sm text-gray-600">
            The {proposer === 'payer' ? 'client' : 'freelancer'} has proposed a partial release
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 mb-6 border border-amber-100">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Remaining in Escrow:</span>
            <span className="font-mono font-medium">${remainingAmount.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center text-blue-600">
              <span className="text-sm">Freelancer receives:</span>
              <span className="font-mono font-medium">${freelancerReceives.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-amber-600">
              <span className="text-sm">Client gets back:</span>
              <span className="font-mono font-medium">${clientRefund.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {escrow.settlement_reason && (
          <div className="mt-4 pt-4 border-t border-amber-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Reason:</span> {escrow.settlement_reason}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
        <p className="text-sm text-blue-800">
          {userRole === 'payer' 
            ? `By accepting, you agree to release $${freelancerReceives.toFixed(2)} to the freelancer and receive $${clientRefund.toFixed(2)} back.`
            : `By accepting, you agree to receive $${freelancerReceives.toFixed(2)} and return $${clientRefund.toFixed(2)} to the client.`
          }
        </p>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={handleAcceptSettlement}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Processing...' : 'Accept Proposal'}
        </button>
        <button
          onClick={handleRejectSettlement}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}