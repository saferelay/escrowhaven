// src/app/verify/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

// Icons matching the design system - with optional style prop
const CheckCircleIcon = ({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExternalLinkIcon = ({ className = "w-4 h-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function VerifyTransactionPage({ params }: { params: { id: string } }) {
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        const { data, error } = await supabase
          .from('escrows')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        
        // Only show completed transactions
        if (!data || !['RELEASED', 'SETTLED', 'REFUNDED'].includes(data.status)) {
          setError('Transaction not found or not yet completed');
          return;
        }

        setEscrow(data);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Unable to verify this transaction');
      } finally {
        setLoading(false);
      }
    };

    fetchEscrow();
  }, [params.id, supabase]);

  // Mask email for privacy
  const maskEmail = (email: string) => {
    if (!email) return 'Unknown';
    const [name, domain] = email.split('@');
    if (name.length <= 3) return `${name[0]}***@${domain}`;
    return `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
  };

  // Get blockchain explorer URL
  const getExplorerUrl = (type: 'tx' | 'address', hash: string) => {
    if (!hash) return '#';
    const base = escrow?.is_test_mode 
      ? 'https://amoy.polygonscan.com'
      : 'https://polygonscan.com';
    return `${base}/${type}/${hash}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
          style={{ borderColor: '#E0E2E7', borderTopColor: '#2962FF' }}
        />
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(239, 83, 80, 0.1)' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="#EF5350" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-normal text-black mb-2">Verification Failed</h1>
          <p className="text-sm" style={{ color: '#787B86' }}>{error || 'Transaction not found'}</p>
          <Link 
            href="/" 
            className="mt-4 inline-block text-sm transition-colors"
            style={{ color: '#2962FF' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1E53E5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2962FF'}
          >
            Go to EscrowHaven →
          </Link>
        </div>
      </div>
    );
  }

  const amount = escrow.amount_cents / 100;
  const completedAt = escrow.released_at || escrow.settled_at || escrow.created_at;
  const statusLabel = escrow.status === 'RELEASED' ? 'Payment Released' : 
                      escrow.status === 'SETTLED' ? 'Settlement Completed' : 
                      'Payment Refunded';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div style={{ borderBottom: '1px solid #E0E2E7' }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 transition-colors"
            style={{ color: '#787B86' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#787B86'}
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm font-medium">EscrowHaven</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Verification Badge */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: 'rgba(38, 166, 154, 0.1)' }}
          >
            <CheckCircleIcon className="w-5 h-5" style={{ stroke: '#26A69A' }} />
            <span className="text-sm font-medium" style={{ color: '#26A69A' }}>
              Verified Transaction
            </span>
          </div>
          
          <h1 className="text-3xl font-normal text-black mb-2">
            ${amount.toFixed(2)} Transaction Completed
          </h1>
          
          <p style={{ color: '#787B86' }}>
            {new Date(completedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Transaction Details Card */}
        <div 
          className="rounded-lg p-6 mb-6"
          style={{ 
            border: '1px solid #E0E2E7',
            borderRadius: '12px'
          }}
        >
          <h2 className="text-lg font-normal text-black mb-4">Transaction Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #E0E2E7' }}>
              <span className="text-sm" style={{ color: '#787B86' }}>Status</span>
              <span className="text-sm font-medium text-black">{statusLabel}</span>
            </div>
            
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #E0E2E7' }}>
              <span className="text-sm" style={{ color: '#787B86' }}>Amount</span>
              <span className="text-sm font-medium text-black">${amount.toFixed(2)} USDC</span>
            </div>
            
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #E0E2E7' }}>
              <span className="text-sm" style={{ color: '#787B86' }}>From</span>
              <span className="text-sm font-medium text-black">{maskEmail(escrow.client_email)}</span>
            </div>
            
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #E0E2E7' }}>
              <span className="text-sm" style={{ color: '#787B86' }}>To</span>
              <span className="text-sm font-medium text-black">{maskEmail(escrow.freelancer_email)}</span>
            </div>
            
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #E0E2E7' }}>
              <span className="text-sm" style={{ color: '#787B86' }}>Transaction ID</span>
              <span className="text-sm font-mono" style={{ color: '#787B86' }}>
                {escrow.id.substring(0, 8)}...{escrow.id.substring(escrow.id.length - 6)}
              </span>
            </div>
          </div>
        </div>

        {/* Blockchain Proof Card */}
        <div 
          className="rounded-lg p-6 mb-6"
          style={{ 
            border: '1px solid #E0E2E7',
            borderRadius: '12px'
          }}
        >
          <h2 className="text-lg font-normal text-black mb-4">Blockchain Verification</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#F8F9FD' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="#2962FF" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-black">Smart Contract Verified</p>
                <p className="text-xs" style={{ color: '#787B86' }}>
                  Transaction executed on Polygon {escrow.is_test_mode ? 'Testnet' : 'Mainnet'}
                </p>
              </div>
            </div>

            {escrow.vault_address && (
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#F8F9FD' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="#2962FF" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Escrow Vault</p>
                  <a 
                    href={getExplorerUrl('address', escrow.vault_address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center gap-1 transition-colors"
                    style={{ color: '#2962FF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1E53E5'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2962FF'}
                  >
                    View on Polygon
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {(escrow.release_tx_hash || escrow.refund_tx_hash) && (
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#F8F9FD' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="#2962FF" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Settlement Transaction</p>
                  <a 
                    href={getExplorerUrl('tx', escrow.release_tx_hash || escrow.refund_tx_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center gap-1 transition-colors"
                    style={{ color: '#2962FF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1E53E5'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2962FF'}
                  >
                    View transaction hash
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center py-8">
          <p className="text-sm mb-4" style={{ color: '#787B86' }}>
            This transaction was secured by EscrowHaven's smart contract escrow system
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-white text-sm font-medium transition-all duration-200"
            style={{ 
              backgroundColor: '#2962FF',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1E53E5';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2962FF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Start Your Own Secure Transaction
          </Link>
        </div>
      </div>
    </div>
  );
}