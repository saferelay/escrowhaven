// src/components/escrow/EscrowDetailPanel.tsx - Complete with vault address privacy and role-specific messaging
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEnvConfig } from '@/lib/environment';
import { generateTransakOneParams } from '@/lib/transak-one';
import { SettlementActions } from '@/components/SettlementActions';
import clsx from 'clsx';

interface EscrowDetailPanelProps {
  escrowId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

// Animated components
const PulsingDot = ({ color = 'blue' }: { color?: string }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-400'
  };
  
  return (
    <div className="relative">
      <div className={`w-2 h-2 ${colors[color as keyof typeof colors]} rounded-full`} />
      <div className={`absolute inset-0 w-2 h-2 ${colors[color as keyof typeof colors]} rounded-full animate-ping`} />
    </div>
  );
};

// Icon components
const BlockchainIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="M10 6.5h4M10 17.5h4M6.5 10v4M17.5 10v4" />
  </svg>
);

const ShieldIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CopyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const ArrowUpRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4", isSpinning = false }: { className?: string; isSpinning?: boolean }) => (
  <svg 
    className={`${className} ${isSpinning ? 'animate-spin' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Terms Disclosure Component
const TermsDisclosure = ({ accepted, onAccept }: { accepted: boolean; onAccept: (accepted: boolean) => void }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="accept-terms"
          checked={accepted}
          onChange={(e) => onAccept(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <label htmlFor="accept-terms" className="text-sm text-gray-900 cursor-pointer">
            I understand and accept the SafeRelay Escrow Terms
          </label>
          
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
          >
            {expanded ? 'Hide' : 'View'} key terms
            <ChevronDownIcon className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          
          {expanded && (
            <div className="mt-3 space-y-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              <div>
                <p className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                  <BlockchainIcon className="w-3 h-3" />
                  Smart Contract Enforcement
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Funds are locked in an immutable smart contract on Polygon</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Contract address will be provided after funding</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>No admin functions - SafeRelay cannot access locked funds</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" />
                  Release Mechanisms
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><strong>Full Release:</strong> Sender approves full payment to receiver</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><strong>Settlement:</strong> Both parties can propose partial releases</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><strong>Refund:</strong> Receiver can refund full amount to sender</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>All actions require digital signatures via Magic wallet</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                  <ShieldIcon className="w-3 h-3" />
                  Transparency & Security
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>All transactions viewable on Polygon blockchain explorer</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>1.99% platform fee deducted only upon successful release</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>EIP-712 signatures ensure transaction authenticity</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Non-custodial: you control your funds at all times</span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="text-gray-500">
                  By accepting this escrow, you acknowledge that transactions on the blockchain are irreversible and SafeRelay acts only as a technology provider, not as a custodian or arbitrator.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Timeline Step Component
interface TimelineStepProps {
  step: number;
  title: string;
  status: 'complete' | 'active' | 'pending';
  date?: string;
  txHash?: string;
  explorerUrl?: string;
  isLast?: boolean;
}

const TimelineStep = ({ step, title, status, date, txHash, explorerUrl, isLast }: TimelineStepProps) => {
  const getStatusIcon = () => {
    if (status === 'complete') return <CheckIcon className="w-3 h-3 text-green-600" />;
    if (status === 'active') return <PulsingDot color="blue" />;
    return <div className="w-3 h-3 rounded-full bg-gray-300" />;
  };

  return (
    <div className="flex gap-4 relative">
      {!isLast && (
        <div 
          className={clsx(
            "absolute left-5 top-10 w-0.5 h-full -bottom-2",
            status === 'complete' ? 'bg-green-200' : 'bg-gray-200'
          )}
        />
      )}
      
      <div className={clsx(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
        status === 'complete' ? 'bg-green-50 border-2 border-green-200' :
        status === 'active' ? 'bg-blue-50 border-2 border-blue-300' :
        'bg-gray-50 border-2 border-gray-200'
      )}>
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h4 className={clsx(
              "font-medium text-sm",
              status === 'complete' ? 'text-gray-900' :
              status === 'active' ? 'text-gray-900' :
              'text-gray-400'
            )}>
              {title}
            </h4>
            {date && (
              <p className="text-xs text-gray-500 mt-0.5">{date}</p>
            )}
          </div>
          
          {txHash && explorerUrl && (
            <a 
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View
              <ArrowUpRightIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Trust Badge Component
const TrustBadge = ({ type, value, link }: { type: 'contract' | 'security' | 'network'; value: string; link?: string }) => {
  const icons = {
    contract: <BlockchainIcon className="w-3.5 h-3.5" />,
    security: <ShieldIcon className="w-3.5 h-3.5" />,
    network: <div className="w-3.5 h-3.5 rounded-full bg-purple-500" />
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{icons[type]}</span>
      {link ? (
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          {value}
          <ArrowUpRightIcon className="w-2.5 h-2.5" />
        </a>
      ) : (
        <span className="text-xs text-gray-700 font-medium">{value}</span>
      )}
    </div>
  );
};

// Share Link Component
const ShareableLink = ({ escrow }: { escrow: any }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/${escrow.premium_link || `escrow/${escrow.id}`}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">Share this escrow</p>
          <p className="text-xs text-gray-600 mb-3">Send this link to complete the escrow setup</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={link}
              readOnly
              className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded text-xs font-mono text-gray-700"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              className={clsx(
                "px-3 py-1.5 rounded text-xs font-medium transition-all",
                copied 
                  ? "bg-green-600 text-white" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3 h-3 inline mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon className="w-3 h-3 inline mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function EscrowDetailPanel({ escrowId, isOpen, onClose, onUpdate }: EscrowDetailPanelProps) {
  const { user, supabase } = useAuth();
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showTransakWidget, setShowTransakWidget] = useState(false);
  const [transakUrl, setTransakUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copiedVault, setCopiedVault] = useState(false);

  const role = user?.email === escrow?.client_email ? 'payer' : 
               user?.email === escrow?.freelancer_email ? 'recipient' : 
               null;

  const isInitiator = escrow?.status === 'INITIATED' && 
    user?.email === escrow?.initiator_email;

  const needsToAccept = escrow?.status === 'INITIATED' && 
    !isInitiator && (role === 'payer' || role === 'recipient');

  // Check if vault address should be visible
  const isVaultVisible = escrow?.vault_address && 
    (escrow?.status === 'FUNDED' || escrow?.status === 'RELEASED' || escrow?.status === 'REFUNDED');

  // Main effect - real-time subscription
  useEffect(() => {
    if (!isOpen || !escrowId || !user) return;
    
    // Initial fetch
    fetchEscrow();

    // Real-time subscription
    const channel = supabase
      .channel(`escrow-${escrowId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'escrows', filter: `id=eq.${escrowId}` },
        (payload) => {
          console.log('Real-time update received:', payload.eventType);
          setEscrow(payload.new);
          setLastUpdated(new Date());
          
          // Trigger parent update if provided
          if (onUpdate) onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, escrowId, user, supabase]);

  const fetchEscrow = async () => {
    try {
      const { data, error } = await supabase
        .from('escrows')
        .select('*')
        .eq('id', escrowId)
        .single();

      if (error) throw error;
      setEscrow(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching escrow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchEscrow();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAccept = async () => {
    if (!termsAccepted) {
      alert('Please accept the terms to continue');
      return;
    }

    setProcessing(true);
    try {
      const updateData: any = {
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString()
      };
      
      if (role === 'recipient') {
        const { data: walletData, error: walletError } = await supabase
          .from('user_wallets')
          .select('wallet_address')
          .eq('email', user?.email)
          .single();
        
        if (walletError || !walletData?.wallet_address) {
          alert('You need to connect your wallet first to receive payments.');
          onClose();
          window.location.href = `/connect-wallet?redirectTo=/dashboard`;
          return;
        }
        
        updateData.recipient_wallet_address = walletData.wallet_address;
        updateData.freelancer_wallet_address = walletData.wallet_address;
      }
  
      const { error } = await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrowId);
  
      if (error) throw error;
      
      // Trigger immediate refresh
      await fetchEscrow();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Accept failed:', error);
      alert(`Failed to accept: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

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
        .eq('id', escrowId);

      if (error) throw error;
      
      setShowDeclineForm(false);
      
      // Trigger immediate refresh
      await fetchEscrow();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Decline failed:', error);
      alert('Failed to decline. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFund = async () => {
    setProcessing(true);
    try {
      const envConfig = getEnvConfig();
      const isTestMode = envConfig.isTestMode || escrow?.is_test_mode;
      
      // TEST MODE
      if (isTestMode) {
        const prepareResponse = await fetch(
          escrow.contract_version === 'v2.1' 
            ? '/api/escrow/prepare-funding-v2-1' 
            : '/api/escrow/prepare-funding', 
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              escrowId: escrow?.id,
              useTransakOne: false,
              contractVersion: escrow.contract_version || 'v2.1'
            })
          }
        );
      
        if (!prepareResponse.ok) {
          const errorData = await prepareResponse.json();
          throw new Error(errorData.error || errorData.message || 'Failed to prepare funding');
        }
      
        const { vaultAddress } = await prepareResponse.json();
        
        if (!escrow?.vault_address && vaultAddress) {
          setEscrow((prev: any) => ({ ...prev!, vault_address: vaultAddress }));
        }
        
        const mockUsdcAddress = envConfig.mockUsdcAddress || envConfig.usdcAddress;
        const networkName = envConfig.network || 'polygon-amoy';
        
        const vaultInfo = `Test Mode - Vault Ready\n\nNetwork: ${networkName}\nVault: ${vaultAddress}\nToken: ${mockUsdcAddress}\nAmount: ${escrow.amount_cents / 100} USDC`;
        
        if (confirm(vaultInfo + '\n\nCopy vault address to clipboard?')) {
          if (navigator.clipboard && vaultAddress) {
            await navigator.clipboard.writeText(vaultAddress);
            alert('Vault address copied! You can now send test USDC to this address.');
          }
        }
        
        // Trigger refresh
        await fetchEscrow();
        
        // Check for funding after 10 seconds
        setTimeout(async () => {
          await fetchEscrow();
        }, 10000);
        
        return;
      }

      // PRODUCTION MODE - Transak flow
      const prepareResponse = await fetch(
        escrow.contract_version === 'v2.1' 
          ? '/api/escrow/prepare-funding-v2-1' 
          : '/api/escrow/prepare-funding',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            escrowId: escrow?.id,
            useTransakOne: true,
            contractVersion: escrow.contract_version || 'v2.1'
          })
        }
      );

      if (!prepareResponse.ok) {
        const errorData = await prepareResponse.json();
        throw new Error(errorData.error || errorData.message || 'Failed to prepare funding');
      }

      const { vaultAddress, recipientWallet } = await prepareResponse.json();
      
      if (!escrow?.vault_address && vaultAddress) {
        setEscrow((prev: any) => ({ ...prev!, vault_address: vaultAddress }));
      }
      
      const transakParams = generateTransakOneParams({
        apiKey: envConfig.transakApiKey,
        environment: envConfig.name === 'production' ? 'PRODUCTION' : 'STAGING',
        walletAddress: vaultAddress,
        email: user?.email || escrow.client_email,
        fiatAmount: escrow.amount_cents / 100,
        clientEmail: escrow.client_email,
        freelancerEmail: escrow.freelancer_email,
        recipientAddress: recipientWallet || escrow.recipient_wallet_address
      });

      const baseUrl = transakParams.environment === 'STAGING' 
        ? 'https://global-stg.transak.com' 
        : 'https://global.transak.com';
      
      const queryParams = new URLSearchParams({
        apiKey: transakParams.apiKey,
        email: transakParams.email,
        fiatAmount: transakParams.fiatAmount.toString(),
        fiatCurrency: 'USD',
        network: transakParams.network,
        cryptoCurrencyCode: 'USDC',
        walletAddress: transakParams.walletAddress,
        disableWalletAddressForm: 'true',
        themeColor: '2563EB',
        widgetHeight: '650px',
        partnerOrderId: escrow.id,
        redirectURL: window.location.href
      });

      setTransakUrl(`${baseUrl}?${queryParams.toString()}`);
      setShowTransakWidget(true);
      
    } catch (error: any) {
      console.error('Funding error:', error);
      alert(`Failed to prepare funding: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyVault = async () => {
    if (isVaultVisible && escrow.vault_address) {
      await navigator.clipboard.writeText(escrow.vault_address);
      setCopiedVault(true);
      setTimeout(() => setCopiedVault(false), 2000);
    }
  };

  const calculateAmounts = () => {
    if (!escrow) return { original: 0, settled: 0, remaining: 0 };
    
    const original = escrow.amount_cents / 100;
    const settled = (escrow.total_settled_cents || 0) / 100;
    const remaining = original - settled;
    
    return { original, settled, remaining };
  };

  const amounts = calculateAmounts();

  // Build timeline steps
  const getTimelineSteps = () => {
    const steps = [];
    
    // Created
    steps.push({
      step: 1,
      title: 'Escrow created',
      status: 'complete' as const,
      date: escrow?.created_at ? new Date(escrow.created_at).toLocaleString() : undefined
    });

    // Accepted/Declined
    if (escrow?.status === 'DECLINED') {
      steps.push({
        step: 2,
        title: 'Declined',
        status: 'complete' as const,
        date: escrow?.declined_at ? new Date(escrow.declined_at).toLocaleString() : undefined
      });
    } else if (escrow?.accepted_at) {
      steps.push({
        step: 2,
        title: 'Terms accepted',
        status: 'complete' as const,
        date: new Date(escrow.accepted_at).toLocaleString()
      });
    } else if (escrow?.status === 'INITIATED') {
      steps.push({
        step: 2,
        title: 'Awaiting acceptance',
        status: 'active' as const
      });
    }

    // Smart Contract
    if (escrow?.vault_address && isVaultVisible) {
      steps.push({
        step: 3,
        title: 'Smart contract deployed',
        status: 'complete' as const,
        date: escrow?.funded_at ? new Date(escrow.funded_at).toLocaleString() : undefined,
        txHash: escrow?.deployment_tx_hash,
        explorerUrl: escrow?.network === 'polygon-amoy' || escrow?.is_test_mode
          ? `https://amoy.polygonscan.com/address/${escrow.vault_address}`
          : `https://polygonscan.com/address/${escrow.vault_address}`
      });
    } else if (escrow?.status === 'ACCEPTED') {
      steps.push({
        step: 3,
        title: 'Ready to fund',
        status: 'active' as const
      });
    }

    // Funded
    if (escrow?.status === 'FUNDED' || escrow?.status === 'RELEASED' || escrow?.status === 'REFUNDED') {
      steps.push({
        step: 4,
        title: 'Funds secured',
        status: 'complete' as const,
        date: escrow?.funded_at ? new Date(escrow.funded_at).toLocaleString() : undefined,
        txHash: escrow?.funding_tx_hash,
        explorerUrl: escrow?.funding_tx_hash && (escrow?.network === 'polygon-amoy' || escrow?.is_test_mode
          ? `https://amoy.polygonscan.com/tx/${escrow.funding_tx_hash}`
          : `https://polygonscan.com/tx/${escrow.funding_tx_hash}`)
      });
    } else if (escrow?.vault_address && !isVaultVisible) {
      steps.push({
        step: 4,
        title: 'Awaiting KYC funding',
        status: 'pending' as const
      });
    }

    // Approval/Release - ROLE-SPECIFIC MESSAGING
    if (escrow?.status === 'RELEASED') {
      steps.push({
        step: 5,
        title: 'Payment released',
        status: 'complete' as const,
        date: escrow?.released_at ? new Date(escrow.released_at).toLocaleString() : undefined,
        txHash: escrow?.release_tx_hash,
        explorerUrl: escrow?.release_tx_hash && (escrow?.network === 'polygon-amoy' || escrow?.is_test_mode
          ? `https://amoy.polygonscan.com/tx/${escrow.release_tx_hash}`
          : `https://polygonscan.com/tx/${escrow.release_tx_hash}`)
      });
    } else if (escrow?.status === 'REFUNDED') {
      steps.push({
        step: 5,
        title: 'Payment refunded',
        status: 'complete' as const,
        date: escrow?.released_at ? new Date(escrow.released_at).toLocaleString() : undefined
      });
    } else if (escrow?.status === 'FUNDED') {
      // ROLE-SPECIFIC MESSAGING
      steps.push({
        step: 5,
        title: role === 'payer' 
          ? 'Funds awaiting your release' 
          : 'Awaiting release from sender',
        status: 'active' as const
      });
    }

    return steps;
  };

  if (!isOpen) return null;

  const getStatusBadge = () => {
    const statusStyles = {
      'INITIATED': { text: 'New', bg: 'bg-gray-100', color: 'text-gray-700', dot: 'gray' },
      'ACCEPTED': { text: 'Accepted', bg: 'bg-yellow-50', color: 'text-yellow-700', dot: 'yellow' },
      'FUNDED': { text: 'Active', bg: 'bg-blue-50', color: 'text-blue-700', dot: 'blue' },
      'RELEASED': { text: 'Complete', bg: 'bg-green-50', color: 'text-green-700', dot: 'green' },
      'DECLINED': { text: 'Declined', bg: 'bg-red-50', color: 'text-red-700', dot: 'gray' },
      'REFUNDED': { text: 'Refunded', bg: 'bg-purple-50', color: 'text-purple-700', dot: 'gray' },
    }[escrow?.status] || { text: escrow?.status, bg: 'bg-gray-100', color: 'text-gray-700', dot: 'gray' };

    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium ${statusStyles.bg} ${statusStyles.color}`}>
        {['INITIATED', 'ACCEPTED', 'FUNDED'].includes(escrow?.status) && (
          <PulsingDot color={statusStyles.dot as any} />
        )}
        {statusStyles.text}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-gray-900">Escrow Details</h2>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2">
          {/* Manual refresh button */}
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors group relative"
            title="Refresh"
          >
            <RefreshIcon className="w-4 h-4 text-gray-500" isSpinning={isRefreshing} />
            {lastUpdated && !isRefreshing && (
              <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Updated {new Date().getTime() - lastUpdated.getTime() < 60000 
                  ? 'just now' 
                  : `${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000)} min ago`}
              </div>
            )}
          </button>
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-700"></div>
          </div>
        ) : !escrow || !role ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Escrow not found</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Amount Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Escrow Amount</p>
                  <div className="text-3xl font-bold text-gray-900">
                    ${amounts.original.toFixed(2)}
                  </div>
                </div>
                {/* Only show vault address if funded */}
                {isVaultVisible && (
                  <button
                    onClick={handleCopyVault}
                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-mono text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    {escrow.vault_address.slice(0, 6)}...{escrow.vault_address.slice(-4)}
                    {copiedVault ? (
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    ) : (
                      <CopyIcon className="w-3 h-3" />
                    )}
                  </button>
                )}
                {!isVaultVisible && escrow.status === 'ACCEPTED' && (
                  <div className="px-3 py-1.5 bg-amber-50 rounded-lg text-xs text-amber-700">
                    Vault pending funding
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{escrow.client_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{escrow.freelancer_email}</span>
                </div>
                {escrow.description && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="text-gray-600 text-xs">{escrow.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Share Link - Show for initiator waiting */}
            {isInitiator && escrow.status === 'INITIATED' && (
              <ShareableLink escrow={escrow} />
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <TrustBadge type="security" value="Non-custodial" />
              <TrustBadge type="security" value="EIP-712" />
              {isVaultVisible && (
                <TrustBadge 
                  type="contract" 
                  value="View contract" 
                  link={
                    escrow.network === 'polygon-amoy' || escrow.is_test_mode
                      ? `https://amoy.polygonscan.com/address/${escrow.vault_address}#code`
                      : `https://polygonscan.com/address/${escrow.vault_address}#code`
                  }
                />
              )}
              <TrustBadge 
                type="network" 
                value={escrow.network === 'polygon-amoy' || escrow.is_test_mode ? 'Testnet' : 'Polygon'} 
              />
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
              <div className="relative">
                {getTimelineSteps().map((step, index, array) => (
                  <TimelineStep 
                    key={step.step}
                    {...step}
                    isLast={index === array.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Settlement info if applicable */}
            {escrow.settlement_count > 0 && (
              <div className="mb-6 p-3 bg-amber-50 rounded-lg text-sm">
                <div className="text-gray-700">
                  <div className="font-medium mb-1">Partial settlements: {escrow.settlement_count}</div>
                  <div>Previously settled: ${amounts.settled.toFixed(2)}</div>
                  <div className="font-semibold text-gray-900 mt-1">Remaining: ${amounts.remaining.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {escrow.status === 'INITIATED' && needsToAccept && (
                <>
                  <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-900">
                      {role === 'payer' 
                        ? `${escrow.freelancer_email} is requesting this payment.`
                        : `${escrow.client_email} wants to send you this payment.`
                      }
                    </p>
                  </div>

                  {/* Terms Disclosure */}
                  <TermsDisclosure 
                    accepted={termsAccepted} 
                    onAccept={setTermsAccepted} 
                  />
                  
                  {!showDeclineForm ? (
                    <>
                      <button
                        onClick={handleAccept}
                        disabled={processing || !termsAccepted}
                        className={clsx(
                          "w-full py-2.5 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2",
                          termsAccepted 
                            ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        {processing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            {termsAccepted ? 'Accept Terms' : 'Accept terms to continue'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeclineForm(true)}
                        disabled={processing}
                        className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <>
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                        rows={3}
                        placeholder="Reason for declining..."
                        autoFocus
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleDecline}
                          disabled={processing || !declineReason.trim()}
                          className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
                        >
                          Confirm Decline
                        </button>
                        <button
                          onClick={() => {
                            setShowDeclineForm(false);
                            setDeclineReason('');
                          }}
                          disabled={processing}
                          className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {escrow.status === 'INITIATED' && isInitiator && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Waiting for {role === 'payer' ? escrow.freelancer_email : escrow.client_email} to respond
                  </p>
                </div>
              )}

              {escrow.status === 'ACCEPTED' && role === 'payer' && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900">
                      Ready to add funds. Complete KYC through our payment provider to fund this escrow.
                    </p>
                  </div>
                  <button
                    onClick={handleFund}
                    disabled={processing}
                    className="w-full py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Fund Escrow
                      </>
                    )}
                  </button>
                  
                  {/* Payment method icons */}
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">Accepted:</span>
                      <div className="flex items-center gap-1.5">
                        {/* Visa */}
                        <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
                          <rect width="48" height="32" rx="4" fill="#F6F9FC"/>
                          <path fill="#1434CB" d="M21.852 21.866l-2.273-10.732H16.9l2.273 10.732h2.679zm11.539-10.474a6.653 6.653 0 00-2.407-.44c-2.656 0-4.527 1.372-4.54 3.336-.026 1.45 1.336 2.26 2.355 2.743 1.046.495 1.397.81.392.81-.734 0-1.11-.105-1.702-.365l-.237-.11-.256 1.539c.423.19 1.206.355 2.019.364 2.902 0 4.788-1.393 4.815-3.548.013-.587-.364-1.034-1.163-1.402-.485-.237-1.24-.396-1.24-.653 0-.22.4-.454 1.262-.454a3.994 3.994 0 011.643.315l.197.094.298-1.789zm7.104 6.616c.228-.599 1.099-2.905 1.099-2.905-.013.027.227-.602.365-.992l.186.896s.528 2.437.64 2.949l-2.29.052zm3.396-6.616h-2.136c-.66 0-1.155.185-1.445.86L35.66 21.866h2.901s.537-1.448.659-1.766l3.539.005c.094.411.383 1.761.383 1.761h2.565l-2.236-10.474zM13.7 11.392l-2.703 7.326-.289-1.445c-.502-1.656-2.065-3.45-3.815-4.346l2.468 9.078 2.922-.003 4.35-10.61H13.7z"/>
                          <path fill="#1434CB" d="M7.858 11.134H3.142l-.037.229c3.67.912 6.1 3.115 7.11 5.765l-1.026-5.12c-.176-.66-.648-.848-1.244-.874z"/>
                        </svg>
                        
                        {/* Mastercard */}
                        <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
                          <rect width="48" height="32" rx="4" fill="#F6F9FC"/>
                          <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                          <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M24 21.657a7.97 7.97 0 003-6.157 7.97 7.97 0 00-3-6.157 7.97 7.97 0 00-3 6.157 7.97 7.97 0 003 6.157z" fill="#FF5F00"/>
                        </svg>
                        
                        {/* Amex */}
                        <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none">
                          <rect width="48" height="32" rx="4" fill="#006FCF"/>
                          <path fill="white" d="M14.563 19.333h-2.296l-.009-5.61-2.545 5.61h-1.98l-2.554-5.61v5.61H3.15l-.384-1.778H.738l-.383 1.778H-1l1.787-8.267h2.084l1.701 7.863 2.34-7.863h2.295l2.331 7.88.009-7.88h1.996v8.267zm4.084 0h-4.061v-8.267h4.061v1.648h-2.277v1.574h2.223v1.629h-2.223v1.768h2.277v1.648zm7.227-6.076l-.808 2.425h1.616l-.808-2.425zm1.786 6.076h-1.832l-.448-1.778h-2.028l-.448 1.778h-3.587l.421-1.397-1.97-6.87h2.704l.615 1.554h.168l2.277-1.554h5.542l-.495 1.73 1.346 1.435-1.42 1.471.542 1.888-1.387 1.743z"/>
                        </svg>
                        
                        {/* Bank icon */}
                        <svg className="h-5 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="#6B7280" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        
                        {/* Apple Pay */}
                        <svg className="h-5 w-auto" viewBox="0 0 40 24" fill="none">
                          <rect width="40" height="24" rx="4" fill="#000000"/>
                          <path fill="white" d="M9.305 7.215a1.551 1.551 0 01.412-1.14 1.584 1.584 0 011.178-.522 1.54 1.54 0 01.407 1.133 1.584 1.584 0 01-1.173.529 1.305 1.305 0 01-1.224-.529m1.218.654c-.657-.038-1.217.373-1.528.373-.311 0-.793-.353-1.303-.344a1.923 1.923 0 00-1.62.988c-.691 1.197-.177 2.97.497 3.943.33.476.723 1.01 1.238 1 .497-.02.684-.324 1.284-.324.6 0 .768.324 1.293.314.534-.01.873-.487 1.199-.968a3.976 3.976 0 00.544-1.118 1.664 1.664 0 01-1.016-1.527 1.699 1.699 0 01.824-1.42 1.738 1.738 0 01-1.412-.917z"/>
                        </svg>
                        
                        {/* Google Pay */}
                        <svg className="h-5 w-auto" viewBox="0 0 40 24" fill="none">
                          <rect width="40" height="24" rx="4" fill="white" stroke="#E5E7EB"/>
                          <path d="M18.842 11.517v3.646h-1.043V8.182h2.758c.66-.013 1.297.237 1.766.693.47.456.726 1.082.713 1.735a2.378 2.378 0 01-.713 1.735 2.441 2.441 0 01-1.766.693l-1.715-.004v.001zm0-2.64v1.752h1.726c.405.012.797-.142 1.083-.427a1.469 1.469 0 00.003-2.027 1.507 1.507 0 00-1.086-.43l-1.726.003v1.13z" fill="#5F6368"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Powered by Transak • ~3.5% processing fee • KYC required
                  </p>
                </>
              )}

              {escrow.status === 'ACCEPTED' && role === 'recipient' && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Waiting for {escrow.client_email} to add funds
                  </p>
                </div>
              )}

              {escrow.status === 'FUNDED' && role && (
                <>
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShieldIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900 mb-1">
                          ${amounts.remaining.toFixed(2)} secured in escrow
                        </p>
                        <p className="text-xs text-green-700">
                          {role === 'payer' 
                            ? 'You can release funds to the recipient or propose a settlement'
                            : 'Waiting for the sender to release funds or you can propose a settlement'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <SettlementActions
                    escrow={{
                      ...escrow,
                      amount_cents: amounts.remaining * 100,
                      amount_remaining_cents: amounts.remaining * 100
                    }}
                    userRole={role as 'payer' | 'recipient'}
                    onAction={async (action) => {
                      console.log('Settlement action:', action);
                      // Trigger refresh after settlement action
                      await fetchEscrow();
                      if (onUpdate) onUpdate();
                    }}
                  />
                </>
              )}

              {escrow.status === 'RELEASED' && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Payment Complete</p>
                  <p className="text-sm text-gray-600">
                    Funds have been released to {escrow.freelancer_email}
                  </p>
                </div>
              )}

              {escrow.status === 'REFUNDED' && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Payment Refunded</p>
                  <p className="text-sm text-gray-600">
                    Funds have been returned to {escrow.client_email}
                  </p>
                </div>
              )}

              {escrow.status === 'DECLINED' && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Escrow Declined</p>
                  {escrow.declined_reason && (
                    <p className="text-sm text-gray-600 mt-2">
                      Reason: {escrow.declined_reason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transak Widget Modal */}
      {showTransakWidget && transakUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Complete Payment</h3>
              <button
                onClick={() => {
                  setShowTransakWidget(false);
                  setTransakUrl('');
                  // Trigger refresh after payment window closes
                  // Check after 5 seconds for payment completion
                  setTimeout(async () => {
                    await fetchEscrow();
                  }, 5000);
                  // Check again after 15 seconds
                  setTimeout(async () => {
                    await fetchEscrow();
                  }, 15000);
                }}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative" style={{ height: '650px' }}>
              <iframe
                src={transakUrl}
                className="w-full h-full"
                allow="camera;microphone;payment"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}