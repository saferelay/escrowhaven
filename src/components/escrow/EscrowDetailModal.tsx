// src/components/escrow/EscrowDetailModal.tsx - COMPLETE IMPLEMENTATION
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface EscrowDetailModalProps {
  escrow: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function EscrowDetailModal({ escrow, isOpen, onClose, onUpdate }: EscrowDetailModalProps) {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  // Determine user's role based on the emails
  const role = user?.email === escrow?.client_email ? 'payer' : 
               user?.email === escrow?.freelancer_email ? 'recipient' : 
               null;

  const isInitiator = escrow?.initiator_email === user?.email;
  const needsToAccept = escrow?.status === 'INITIATED' && !isInitiator && role;

  // Handle accept action
  const handleAccept = async () => {
    setProcessing(true);
    try {
      // Check if recipient needs wallet
      if (role === 'recipient') {
        const { data: walletData } = await supabase
          .from('user_wallets')
          .select('wallet_address')
          .eq('email', user?.email)
          .single();
        
        if (!walletData?.wallet_address) {
          alert('You need to connect your wallet first to receive payments.');
          onClose();
          router.push(`/connect-wallet?redirectTo=/dashboard`);
          return;
        }
      }

      // Update escrow status
      const updateData: any = {
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrow.id);

      if (error) throw error;
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Accept failed:', error);
      alert('Failed to accept. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle decline action
  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('escrows')
        .update({
          status: 'DECLINED',
          declined_at: new Date().toISOString(),
          declined_reason: declineReason,
          declined_by: user?.email
        })
        .eq('id', escrow.id);

      if (error) throw error;
      
      setShowDeclineForm(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Decline failed:', error);
      alert('Failed to decline. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle fund action
  const handleFund = () => {
    onClose();
    router.push(`/escrow/${escrow.id}`);
  };

  // Handle approve release
  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/escrow/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId: escrow.id })
      });

      if (!response.ok) {
        throw new Error('Failed to approve');
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Approve failed:', error);
      alert('Failed to approve. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !escrow) return null;

  const getStatusBadge = (status: string) => {
    const configs = {
      'INITIATED': { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending' },
      'ACCEPTED': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Accepted' },
      'FUNDED': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Funded' },
      'RELEASED': { bg: 'bg-emerald/10', text: 'text-emerald', label: 'Completed' },
      'DECLINED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Declined' },
      'REFUNDED': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Refunded' }
    };
    return configs[status] || configs['INITIATED'];
  };

  const statusBadge = getStatusBadge(escrow.status);
  const amount = (escrow.amount_cents / 100).toFixed(2);
  const feeAmount = (escrow.amount_cents * 0.0199 / 100).toFixed(2);
  const receiverAmount = (escrow.amount_cents * 0.9801 / 100).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold">Escrow Details</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                {statusBadge.label}
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="p-6 space-y-6">
            {/* Amount Section */}
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">${amount}</div>
              <p className="text-sm text-slate-600 mt-1">
                {role === 'payer' ? 'You are paying' : role === 'recipient' ? 'You are receiving' : 'Escrow amount'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Payer</p>
                <p className="font-medium">{escrow.client_email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Recipient</p>
                <p className="font-medium">{escrow.freelancer_email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Created</p>
                <p className="font-medium">{new Date(escrow.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Escrow ID</p>
                <p className="font-medium font-mono text-xs">{escrow.id.slice(0, 8)}</p>
              </div>
            </div>

            {/* Description if exists */}
            {escrow.description && (
              <div>
                <p className="text-sm text-slate-600">Description</p>
                <p className="font-medium">{escrow.description}</p>
              </div>
            )}

            {/* Fee Breakdown for relevant statuses */}
            {['ACCEPTED', 'FUNDED', 'RELEASED'].includes(escrow.status) && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Amount</span>
                    <span>${amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Platform Fee (1.99%)</span>
                    <span>-${feeAmount}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-sm font-medium">Recipient Receives</span>
                    <span className="font-semibold text-emerald">${receiverAmount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status-specific content */}
            {escrow.status === 'INITIATED' && needsToAccept && (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  {role === 'payer' 
                    ? `${escrow.freelancer_email} is requesting a payment. Review and accept to proceed.`
                    : `${escrow.client_email} wants to send you a payment. Accept to proceed.`
                  }
                </p>
                
                {!showDeclineForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleAccept}
                      disabled={processing}
                      className="flex-1 bg-emerald text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setShowDeclineForm(true)}
                      disabled={processing}
                      className="flex-1 bg-white text-slate-700 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue"
                      rows={3}
                      placeholder="Reason for declining..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleDecline}
                        disabled={processing || !declineReason.trim()}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm Decline
                      </button>
                      <button
                        onClick={() => {
                          setShowDeclineForm(false);
                          setDeclineReason('');
                        }}
                        className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {escrow.status === 'INITIATED' && isInitiator && (
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  Waiting for {role === 'payer' ? escrow.freelancer_email : escrow.client_email} to accept.
                </p>
              </div>
            )}

            {escrow.status === 'ACCEPTED' && role === 'payer' && (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Both parties have agreed. Add funds to secure the payment.
                </p>
                <button
                  onClick={handleFund}
                  className="w-full bg-trust-blue text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Fund Escrow
                </button>
              </div>
            )}

            {escrow.status === 'ACCEPTED' && role === 'recipient' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Waiting for the payer to add funds.
                </p>
              </div>
            )}

            {escrow.status === 'FUNDED' && (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Funds are secured. Both parties need to approve for release.
                </p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Payer</span>
                      {escrow.client_approved && (
                        <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Recipient</span>
                      {escrow.freelancer_approved && (
                        <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                {((role === 'payer' && !escrow.client_approved) || 
                  (role === 'recipient' && !escrow.freelancer_approved)) && (
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="w-full bg-emerald text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve Release
                  </button>
                )}
              </div>
            )}

            {escrow.status === 'RELEASED' && (
              <div className="bg-emerald/10 rounded-lg p-4 text-center">
                <svg className="w-12 h-12 text-emerald mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-emerald">Payment Complete</p>
                <p className="text-xs text-slate-600 mt-1">Funds have been released to the recipient</p>
              </div>
            )}

            {escrow.status === 'DECLINED' && (
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-red-900">Escrow Declined</p>
                {escrow.declined_reason && (
                  <p className="text-xs text-red-700 mt-1">Reason: {escrow.declined_reason}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push(`/escrow/${escrow.id}`)}
              className="text-sm text-trust-blue hover:text-blue-700"
            >
              View Full Details
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}