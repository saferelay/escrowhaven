// src/components/SettlementActions.tsx - Complete with Transaction/Vault terminology
'use client';

import { useState, useEffect } from 'react';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';
import { useAuth } from '@/contexts/AuthContext';
import { DisputePaymentModal } from '@/components/escrow/DisputePaymentModal'; 

interface SettlementActionsProps {
  escrow: any;
  userRole: 'payer' | 'recipient';
  onAction: (action: any) => Promise<void>;
}

const PulsingDot = ({ color = 'blue' }: { color?: string }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-400'
  };
  
  return (
    <div className="relative inline-flex">
      <div className={`w-2 h-2 ${colors[color as keyof typeof colors]} rounded-full`} />
      <div className={`absolute inset-0 w-2 h-2 ${colors[color as keyof typeof colors]} rounded-full animate-ping`} />
    </div>
  );
};

export function SettlementActions({ escrow, userRole, onAction }: SettlementActionsProps) {
  const { user, supabase } = useAuth();
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [clientAmount, setClientAmount] = useState('');
  const [freelancerAmount, setFreelancerAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [activeProposal, setActiveProposal] = useState<any>(null);
  const [escrowBalance, setEscrowBalance] = useState<string>('0');
  const [contractExists, setContractExists] = useState<boolean | null>(null);

  // Check if contract exists and get balance
  useEffect(() => {
    const checkDeployment = async () => {
      if (!escrow?.id) return;
      
      // If status is FUNDED, contract MUST exist (that's what FUNDED means)
      if (escrow.status === 'FUNDED') {
        setContractExists(true);
        
        // Set balance
        if (escrow.funded_amount) {
          setEscrowBalance(parseFloat(escrow.funded_amount).toFixed(2));
        } else if (escrow.amount_cents) {
          setEscrowBalance((escrow.amount_cents / 100).toFixed(2));
        }
        return;
      }
      
      // For any other status, check the contract_deployed flag
      setContractExists(escrow.contract_deployed === true);
    };
    
    checkDeployment();
  }, [escrow?.id, escrow?.status, escrow?.contract_deployed, escrow?.funded_amount, escrow?.amount_cents]);

  const getMagicInstance = () => {
    if (!process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) {
      console.error('Magic publishable key not found');
      return null;
    }
  
    // Always use testnet for now since you're on Polygon Amoy
    return new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
      network: {
        rpcUrl: 'https://rpc-amoy.polygon.technology',
        chainId: 80002
      }
    });
  };

  const connectMagicWallet = async (userEmail: string) => {
    const magic = getMagicInstance();
    if (!magic) throw new Error('Magic not configured');

    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        await magic.user.logout();
      }
    } catch (e) {
      console.log('User not logged in');
    }

    setStatus('Check your email for the secure login link...');
    
    await magic.auth.loginWithMagicLink({ 
      email: userEmail,
      showUI: true
    });

    const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('Magic wallet connected:', address);
    
    return { provider, signer, address };
  };

  // GASLESS RELEASE - User signs, backend pays gas
  const handleRelease = async () => {
    console.log('Release clicked. Contract exists?', contractExists);
    console.log('Transaction data:', {
      contract_deployed: escrow.contract_deployed,
      status: escrow.status,
      vault_address: escrow.vault_address
    });
    
    if (!contractExists) {
      alert("This transaction's vault has not been deployed yet. Please contact support.");
      return;
    }

    if (userRole !== 'payer') {
      alert('Only the sender can release payment');
      return;
    }

    setLoading(true);
    setStatus('Connecting to your secure wallet...');

    try {
      const userEmail = escrow.client_email;
      if (!userEmail) throw new Error('User email not found');

      const { signer, address } = await connectMagicWallet(userEmail);
      
      // Create message to sign
      const nonce = Date.now();
      const message = ethers.utils.solidityKeccak256(
        ['string', 'address', 'uint256'],
        ['Release transaction', escrow.vault_address, nonce]
      );
      
      setStatus('Please sign the release authorization in your email...');
      
      // User signs with Magic wallet - NO GAS NEEDED
      const signature = await signer.signMessage(ethers.utils.arrayify(message));
      
      setStatus('Processing release from vault...');
      
      // Send signature to backend which will pay gas
      const response = await fetch('/api/escrow/gasless-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          action: 'release',
          signature,
          nonce,
          signerAddress: address
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to release');
      }
      
      const data = await response.json();
      
      setStatus('Payment released from vault successfully!');
      await onAction({ 
        type: 'released', 
        txHash: data.txHash 
      });
      
    } catch (error: any) {
      console.error('Release error:', error);
      setStatus('');
      
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction cancelled');
      } else {
        alert(error.reason || error.message || 'Failed to release. Check console for details.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  // GASLESS REFUND - User signs, backend pays gas
  const handleRefund = async () => {
    if (!contractExists) {
      alert("This transaction's vault has not been deployed yet. Please contact support.");
      return;
    }

    if (userRole !== 'recipient') {
      alert('Only the recipient can refund');
      return;
    }

    setLoading(true);
    setStatus('Connecting to your secure wallet...');

    try {
      const userEmail = escrow.freelancer_email;
      if (!userEmail) throw new Error('User email not found');

      const { signer, address } = await connectMagicWallet(userEmail);
      
      // Create message to sign
      const nonce = Date.now();
      const message = ethers.utils.solidityKeccak256(
        ['string', 'address', 'uint256'],
        ['Refund transaction', escrow.vault_address, nonce]
      );
      
      setStatus('Please sign the refund authorization in your email...');
      
      // User signs - NO GAS NEEDED
      const signature = await signer.signMessage(ethers.utils.arrayify(message));
      
      setStatus('Processing refund from vault...');
      
      // Backend pays gas
      const response = await fetch('/api/escrow/gasless-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          action: 'refund',
          signature,
          nonce,
          signerAddress: address
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to refund');
      }
      
      const data = await response.json();
      
      setStatus('Refund from vault complete!');
      await onAction({ 
        type: 'refunded', 
        txHash: data.txHash 
      });
    
    } catch (error: any) {
      console.error('Refund error:', error);
      setStatus('');
      
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction cancelled');
      } else {
        alert(error.reason || error.message || 'Failed to refund');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  // GASLESS SETTLEMENT PROPOSAL - User signs, backend pays gas
  const handleProposeSettlement = async () => {
    if (!contractExists) {
      alert("This transaction's vault has not been deployed yet. Please contact support.");
      return;
    }

    const clientAmt = parseFloat(clientAmount || '0');
    const freelancerAmt = parseFloat(freelancerAmount || '0');

    const total = clientAmt + freelancerAmt;
    if (Math.abs(total - parseFloat(escrowBalance)) > 0.01) {
      alert(`Settlement amounts must equal vault balance (${escrowBalance} USDC). Currently: ${total.toFixed(2)} USDC`);
      return;
    }

    setLoading(true);
    setStatus('Connecting to your secure wallet...');

    try {
      const userEmail = userRole === 'payer' ? escrow.client_email : escrow.freelancer_email;
      const { signer, address } = await connectMagicWallet(userEmail);
      
      // Create message to sign for settlement proposal
      const nonce = Date.now();
      const clientAmountUsdc = ethers.utils.parseUnits(clientAmt.toString(), 6);
      const freelancerAmountUsdc = ethers.utils.parseUnits(freelancerAmt.toString(), 6);
      
      const message = ethers.utils.solidityKeccak256(
        ['string', 'address', 'uint256', 'uint256', 'uint256'],
        [
          'Propose settlement',
          escrow.vault_address,
          clientAmountUsdc,
          freelancerAmountUsdc,
          nonce
        ]
      );
      
      setStatus('Please sign the settlement proposal in your email...');
      
      // User signs - NO GAS NEEDED
      const signature = await signer.signMessage(ethers.utils.arrayify(message));
      
      setStatus('Submitting settlement proposal...');
      
      // Backend pays gas
      const response = await fetch('/api/escrow/gasless-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: escrow.id,
          action: 'propose_settlement',
          signature,
          nonce,
          signerAddress: address,
          clientAmount: clientAmt,
          freelancerAmount: freelancerAmt
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to propose settlement');
      }
      
      const data = await response.json();
      
      setStatus('Settlement proposed!');
      await onAction({ type: 'settlement_proposed' });
      setShowSettlementModal(false);
      setClientAmount('');
      setFreelancerAmount('');
      
    } catch (error: any) {
      console.error('Settlement error:', error);
      setStatus('');
      alert(error.reason || error.message || 'Failed to propose settlement');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  // Contract not deployed warning - Updated language
  if (contractExists === false) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-amber-600 text-xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-900">Transaction Vault Not Deployed</p>
            <p className="text-xs text-amber-700 mt-1">
              This transaction's vault hasn't been deployed yet. The funds are secured but actions are not available until the vault is deployed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Status message with pulsing dot */}
        {status && (
          <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <PulsingDot color="blue" />
            <span>{status}</span>
          </div>
        )}

        {/* Action buttons */}
        {userRole === 'payer' && (
          <button
            onClick={handleRelease}
            disabled={loading || escrow.status !== 'FUNDED'}
            className="w-full py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Release ${escrowBalance} from Vault
              </>
            )}
          </button>
        )}

        {userRole === 'recipient' && (
          <button
            onClick={handleRefund}
            disabled={loading || escrow.status !== 'FUNDED'}
            className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Refund to Sender
              </>
            )}
          </button>
        )}

        <button
          onClick={() => setShowSettlementModal(true)}
          disabled={escrow.status !== 'FUNDED'}
          className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-sm font-medium"
        >
          Propose Partial Settlement
        </button>

        {/* DISPUTE BUTTON */}
        {escrow.status === 'FUNDED' && !escrow.kleros_dispute_pending && (
          <button
            onClick={() => setShowDisputeModal(true)}
            disabled={loading}
            className="w-full py-2.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-all text-sm font-medium"
          >
            Request Arbitration
          </button>
        )}
      </div>

      {/* Settlement Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Propose Vault Settlement</h3>
                <button
                  onClick={() => setShowSettlementModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center pb-3 border-b border-gray-100">
                <p className="text-2xl font-mono font-semibold">${escrowBalance}</p>
                <p className="text-xs text-gray-500 mt-1">Vault balance to distribute</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sender gets back
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={clientAmount}
                    onChange={(e) => {
                      const senderAmount = e.target.value;
                      setClientAmount(senderAmount);
                      if (senderAmount !== '') {
                        const remaining = parseFloat(escrowBalance) - parseFloat(senderAmount);
                        setFreelancerAmount(Math.max(0, remaining).toFixed(2));
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={escrowBalance}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Recipient receives
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={freelancerAmount}
                    onChange={(e) => {
                      const recipientAmount = e.target.value;
                      setFreelancerAmount(recipientAmount);
                      if (recipientAmount !== '') {
                        const remaining = parseFloat(escrowBalance) - parseFloat(recipientAmount);
                        setClientAmount(Math.max(0, remaining).toFixed(2));
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={escrowBalance}
                  />
                </div>
              </div>
              
              {/* Validation */}
              {(clientAmount || freelancerAmount) && (
                <div className="text-center text-sm">
                  Total: ${(parseFloat(clientAmount || '0') + parseFloat(freelancerAmount || '0')).toFixed(2)}
                  {Math.abs((parseFloat(clientAmount || '0') + parseFloat(freelancerAmount || '0')) - parseFloat(escrowBalance)) < 0.01 
                    ? <span className="text-green-600 ml-1">✓</span>
                    : <span className="text-red-600 ml-1">(must equal ${escrowBalance})</span>
                  }
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleProposeSettlement}
                  disabled={
                    loading || 
                    Math.abs((parseFloat(clientAmount || '0') + parseFloat(freelancerAmount || '0')) - parseFloat(escrowBalance)) > 0.01
                  }
                  className="flex-1 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-all text-sm font-medium"
                >
                  {loading ? 'Processing...' : 'Propose Settlement'}
                </button>
                <button
                  onClick={() => {
                    setShowSettlementModal(false);
                    setClientAmount('');
                    setFreelancerAmount('');
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <DisputePaymentModal
          escrow={escrow}
          userEmail={user?.email}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={() => {
            setShowDisputeModal(false);
            onAction({ type: 'dispute_initiated' });
          }}
        />
      )}
    </>
  );
}