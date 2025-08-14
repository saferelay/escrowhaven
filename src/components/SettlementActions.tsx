// src/components/SettlementActions.tsx - Complete code with Magic wallet signing
'use client';

import { useState } from 'react';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';
import { useAuth } from '@/contexts/AuthContext';
import { getEnvConfig } from '@/lib/environment';

interface SettlementActionsProps {
  escrow: any;
  userRole: 'payer' | 'recipient';
  onAction: (action: any) => Promise<void>;
}

// EIP-712 Domain helper
const getEIP712Domain = (contractAddress: string, chainId: number) => ({
  name: 'SafeRelay',
  version: '2.1',
  chainId: chainId,
  verifyingContract: contractAddress
});

// Signing Preview Modal Component
function SigningPreviewModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  signingData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  signingData: any;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-lg w-full p-6">
          <h3 className="text-lg font-semibold mb-4">Review What You're Signing</h3>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              You're about to sign a message that will execute the following action on the blockchain:
            </p>
            
            <div className="bg-gray-100 rounded p-4 mb-4">
              <h4 className="font-medium text-sm mb-2">{signingData.action}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-mono">${signingData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-mono text-xs">{signingData.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-mono text-xs">{signingData.contract}</span>
                </div>
              </div>
            </div>
            
            <details className="text-xs">
              <summary className="cursor-pointer text-blue-600 hover:underline mb-2">
                View Technical Details
              </summary>
              <pre className="bg-black text-green-400 p-3 rounded overflow-x-auto">
                {JSON.stringify(signingData.fullData, null, 2)}
              </pre>
            </details>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              I Understand, Proceed
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettlementActions({ escrow, userRole, onAction }: SettlementActionsProps) {
  const { user, magic } = useAuth();
  const [showForm, setShowForm] = useState<'settle' | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [signingStep, setSigningStep] = useState<'idle' | 'preview' | 'signing' | 'submitting'>('idle');
  
  const [pendingAction, setPendingAction] = useState<'release' | 'refund' | 'settlement' | null>(null);
  const [showSigningPreview, setShowSigningPreview] = useState(false);
  const [signingPreviewData, setSigningPreviewData] = useState<any>(null);

  const remainingAmount = escrow.amount_cents / 100;

  // Helper function to ensure Magic login
  const ensureMagicLogin = async (requiredEmail: string): Promise<Magic> => {
    let magicInstance = magic;
    
    if (!magicInstance) {
      magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!);
    }
    
    const isLoggedIn = await magicInstance.user.isLoggedIn();
    
    if (isLoggedIn) {
      const userInfo = await magicInstance.user.getInfo();
      if (userInfo.email !== requiredEmail) {
        await magicInstance.user.logout();
        await magicInstance.auth.loginWithMagicLink({ email: requiredEmail });
      }
    } else {
      await magicInstance.auth.loginWithMagicLink({ email: requiredEmail });
    }
    
    return magicInstance;
  };

  // Continue after preview - directly to Magic signing
  const proceedAfterPreview = async () => {
    setShowSigningPreview(false);
    
    try {
      // Based on pending action, proceed with the appropriate flow
      if (pendingAction === 'release') {
        await executeRelease();
      } else if (pendingAction === 'refund') {
        await executeRefund();
      } else if (pendingAction === 'settlement') {
        await executeSettlement();
      }
      
      setPendingAction(null);
    } catch (error: any) {
      console.error('Action error:', error);
      alert(error.message || 'Failed to complete action');
    } finally {
      setLoading(false);
      setSigningStep('idle');
    }
  };

  // Release full payment (Client only)
  const handleApproveRelease = async () => {
    if (userRole !== 'payer') {
      alert('Only the client can release payment');
      return;
    }

    setLoading(true);
    setSigningStep('preview');
    
    // Prepare signing preview data
    const previewData = {
      action: 'Release Full Payment',
      amount: remainingAmount.toFixed(2),
      recipient: escrow.freelancer_wallet_address || escrow.freelancer_email,
      contract: escrow.vault_address,
      fullData: {
        domain: getEIP712Domain(escrow.vault_address, getEnvConfig().chainId),
        types: {
          ReleasePayment: [
            { name: 'action', type: 'string' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        },
        value: {
          action: 'Release Full Payment',
          recipient: escrow.freelancer_wallet_address,
          amount: ethers.utils.parseUnits(remainingAmount.toString(), 6).toString(),
          nonce: 'Generated at signing',
          deadline: 'Generated at signing'
        }
      }
    };
    
    setSigningPreviewData(previewData);
    setShowSigningPreview(true);
    setPendingAction('release');
  };

  // Execute release with Magic wallet
  const executeRelease = async () => {
    try {
      setSigningStep('signing');
      
      const requiredEmail = escrow.client_email;
      const magicInstance = await ensureMagicLogin(requiredEmail);
      
      const provider = new ethers.providers.Web3Provider(magicInstance.rpcProvider as any);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      if (signerAddress.toLowerCase() !== escrow.client_wallet_address?.toLowerCase()) {
        throw new Error(`Wallet mismatch. Expected ${escrow.client_wallet_address}, got ${signerAddress}. Please try logging out and back in.`);
      }
      
      const nonce = Date.now();
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      if (escrow.contract_version === 'v2.1' && escrow.vault_address) {
        const chainId = getEnvConfig().chainId;
        const domain = getEIP712Domain(escrow.vault_address, chainId);
        
        const types = {
          ReleasePayment: [
            { name: 'action', type: 'string' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        };
        
        const value = {
          action: 'Release Full Payment',
          recipient: escrow.freelancer_wallet_address,
          amount: ethers.utils.parseUnits(remainingAmount.toString(), 6),
          nonce: nonce,
          deadline: deadline
        };
        
        // Magic wallet signs the message (no gas cost for user)
        const signature = await signer._signTypedData(domain, types, value);
        
        setSigningStep('submitting');
        
        // Send signature to backend which will execute on-chain
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
            amountToRelease: remainingAmount.toString()
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
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

  // Refund (Freelancer only)
  const handleRefund = async () => {
    if (userRole !== 'recipient') return;
    
    setLoading(true);
    setSigningStep('preview');

    // Prepare signing preview data
    const previewData = {
      action: 'Refund Full Payment',
      amount: remainingAmount.toFixed(2),
      recipient: escrow.client_wallet_address || escrow.client_email,
      contract: escrow.vault_address,
      fullData: {
        domain: getEIP712Domain(escrow.vault_address, getEnvConfig().chainId),
        types: {
          RefundPayment: [
            { name: 'action', type: 'string' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        },
        value: {
          action: 'Refund Full Payment',
          recipient: escrow.client_wallet_address,
          amount: ethers.utils.parseUnits(remainingAmount.toString(), 6).toString(),
          nonce: 'Generated at signing',
          deadline: 'Generated at signing'
        }
      }
    };
    
    setSigningPreviewData(previewData);
    setShowSigningPreview(true);
    setPendingAction('refund');
  };

  // Execute refund with Magic wallet
  const executeRefund = async () => {
    try {
      setSigningStep('signing');
      
      const requiredEmail = escrow.freelancer_email;
      const magicInstance = await ensureMagicLogin(requiredEmail);
      
      const provider = new ethers.providers.Web3Provider(magicInstance.rpcProvider as any);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      if (signerAddress.toLowerCase() !== escrow.freelancer_wallet_address?.toLowerCase()) {
        throw new Error(`Wallet mismatch. Expected ${escrow.freelancer_wallet_address}, got ${signerAddress}. Please try logging out and back in.`);
      }
      
      const nonce = Date.now();
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      if (escrow.contract_version === 'v2.1' && escrow.vault_address) {
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
        
        // Magic wallet signs the message (no gas cost for user)
        const signature = await signer._signTypedData(domain, types, value);
        
        setSigningStep('submitting');
        
        // Send signature to backend which will execute on-chain
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

  // Execute settlement
  const handleExecuteSettlement = async () => {
    if (userRole !== 'payer' || escrow.contract_version !== 'v2.1') {
      return;
    }
    
    setLoading(true);
    setSigningStep('preview');
    
    const settlementAmount = escrow.settlement_amount_cents / 100;
    
    // Prepare signing preview data
    const previewData = {
      action: 'Settlement Release',
      amount: settlementAmount.toFixed(2),
      recipient: escrow.freelancer_wallet_address || escrow.freelancer_email,
      contract: escrow.vault_address,
      fullData: {
        domain: getEIP712Domain(escrow.vault_address, getEnvConfig().chainId),
        types: {
          SettlementRelease: [
            { name: 'action', type: 'string' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'totalAmount', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        },
        value: {
          action: 'Settlement Release',
          recipient: escrow.freelancer_wallet_address,
          amount: ethers.utils.parseUnits(settlementAmount.toString(), 6).toString(),
          totalAmount: ethers.utils.parseUnits(remainingAmount.toString(), 6).toString(),
          nonce: 'Generated at signing',
          deadline: 'Generated at signing'
        }
      }
    };
    
    setSigningPreviewData(previewData);
    setShowSigningPreview(true);
    setPendingAction('settlement');
  };

  // Execute settlement with Magic wallet
  const executeSettlement = async () => {
    try {
      setSigningStep('signing');
      
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
      
      const settlementAmount = ethers.utils.parseUnits(
        (escrow.settlement_amount_cents / 100).toString(), 
        6
      );
      
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
      
      // Magic wallet signs the message (no gas cost for user)
      const signature = await signer._signTypedData(domain, types, value);
      const signerAddress = await signer.getAddress();
      
      setSigningStep('submitting');
      
      // Send signature to backend which will execute on-chain
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

  // Propose settlement
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

  // Check settlement states
  const userHasProposedSettlement = escrow.settlement_proposed_by === userRole;
  const otherPartyProposedSettlement = escrow.settlement_proposed_by && 
    escrow.settlement_proposed_by !== userRole;
  const bothPartiesAgreedToSettlement = escrow.settlement_proposed_by && 
    escrow.settlement_accepted_by;

  // Show settlement response if other party proposed
  if (otherPartyProposedSettlement && !escrow.settlement_accepted_by) {
    return <SettlementResponse escrow={escrow} userRole={userRole} onAction={onAction} remainingAmount={remainingAmount} />;
  }

  // Show execution button if both agreed and user is client
  if (bothPartiesAgreedToSettlement && userRole === 'payer' && escrow.status === 'FUNDED') {
    const settlementFreelancerAmount = escrow.settlement_amount_cents / 100;
    const settlementClientRefund = remainingAmount - settlementFreelancerAmount;
    
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-1">Settlement agreed</p>
          <p>Both parties agreed. Execute the partial release.</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Freelancer receives:</span>
            <span className="font-medium">${settlementFreelancerAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">You get back:</span>
            <span className="font-medium">${settlementClientRefund.toFixed(2)}</span>
          </div>
        </div>
        
        <button
          onClick={handleExecuteSettlement}
          disabled={loading}
          className="w-full py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {signingStep === 'preview' ? 'Review details...' :
           signingStep === 'signing' ? 'Sign with Magic...' : 
           signingStep === 'submitting' ? 'Executing...' : 
           'Execute Release'}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Signing Preview Modal */}
      <SigningPreviewModal
        isOpen={showSigningPreview}
        onClose={() => {
          setShowSigningPreview(false);
          setSigningPreviewData(null);
          setLoading(false);
          setSigningStep('idle');
        }}
        onConfirm={proceedAfterPreview}
        signingData={signingPreviewData}
      />

      <div className="space-y-3">
        {/* Show waiting message if settlement proposed */}
        {userHasProposedSettlement && !escrow.settlement_accepted_by && (
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Settlement proposed</p>
            <p>Waiting for response. You proposed:</p>
            <div className="mt-2 text-gray-500">
              • Freelancer: ${(escrow.settlement_amount_cents / 100).toFixed(2)}<br/>
              • Client refund: ${(remainingAmount - (escrow.settlement_amount_cents / 100)).toFixed(2)}
            </div>
            {escrow.settlement_reason && (
              <p className="mt-2 text-xs">Reason: {escrow.settlement_reason}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!userHasProposedSettlement && !bothPartiesAgreedToSettlement && (
          <>
            {/* Client Options */}
            {userRole === 'payer' && (
              <>
                {escrow.contract_version === 'v2.1' && (
                  <button
                    onClick={handleApproveRelease}
                    disabled={loading || escrow.status !== 'FUNDED'}
                    className="w-full py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {signingStep === 'preview' ? 'Review details...' :
                     signingStep === 'signing' ? 'Sign with Magic...' : 
                     signingStep === 'submitting' ? 'Releasing...' : 
                     `Release $${remainingAmount.toFixed(2)}`}
                  </button>
                )}

                <button
                  onClick={() => setShowForm('settle')}
                  disabled={escrow.status !== 'FUNDED'}
                  className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Propose partial release
                </button>
              </>
            )}

            {/* Freelancer Options */}
            {userRole === 'recipient' && (
              <>
                <button
                  onClick={() => setShowForm('settle')}
                  disabled={escrow.status !== 'FUNDED'}
                  className="w-full py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Propose partial release
                </button>
                
                {escrow.contract_version === 'v2.1' && (
                  <button
                    onClick={handleRefund}
                    disabled={loading || escrow.status !== 'FUNDED'}
                    className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    {signingStep === 'preview' ? 'Review...' :
                     signingStep === 'signing' ? 'Signing...' : 
                     signingStep === 'submitting' ? 'Processing...' : 
                     'Refund payment'}
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* Settlement Form */}
        {showForm === 'settle' && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Split the remaining ${remainingAmount.toFixed(2)}
            </p>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Freelancer receives
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={remainingAmount}
                />
              </div>
              {amount && parseFloat(amount) <= remainingAmount && (
                <p className="text-xs text-gray-500 mt-1">
                  Client gets back: ${(remainingAmount - parseFloat(amount)).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                rows={2}
                placeholder="Why this amount..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSettlement}
                disabled={loading || !amount}
                className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
              >
                {loading ? 'Submitting...' : 'Propose'}
              </button>
              <button
                onClick={() => {
                  setShowForm(null);
                  setAmount('');
                  setReason('');
                }}
                disabled={loading}
                className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Settlement Response Component
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
      const rejectReason = prompt('Reason for rejecting (optional):');

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
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-1">Settlement proposal</p>
        <p>The {proposer === 'payer' ? 'client' : 'freelancer'} proposed a partial release.</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Freelancer receives:</span>
          <span className="font-medium">${freelancerReceives.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Client gets back:</span>
          <span className="font-medium">${clientRefund.toFixed(2)}</span>
        </div>
        {escrow.settlement_reason && (
          <div className="pt-2 mt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Reason: {escrow.settlement_reason}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleAcceptSettlement}
          disabled={loading}
          className="flex-1 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {loading ? 'Processing...' : 'Accept'}
        </button>
        <button
          onClick={handleRejectSettlement}
          disabled={loading}
          className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
}