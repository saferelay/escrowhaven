// src/components/escrow/EscrowDetailPanel.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TransactionSuccessModal from '@/components/escrow/TransactionSuccessModal';
import { SettlementActions } from '@/components/SettlementActions';
import clsx from 'clsx';
import { PaymentMethodModal } from '@/components/PaymentMethodModal';
import { FundEscrowModal } from '@/components/dashboard/FundEscrowModal';

// Icon components
const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);


const ScaleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
    <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const ArrowUpRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);

const ProgressIndicator = ({ currentStep, escrow, role, userEmail }: { 
  currentStep: number; 
  escrow: any; 
  role: 'payer' | 'recipient' | null;
  userEmail?: string;
}) => {
  const steps = [
    { id: 1, label: 'Invite', shortLabel: '1' },
    { id: 2, label: 'Accept', shortLabel: '2' },
    { id: 3, label: 'Fund', shortLabel: '3' },
    { id: 4, label: 'Active', shortLabel: '4' },
    { id: 5, label: 'Complete', shortLabel: '5' }
  ];
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current && window.innerWidth < 768) {
      const currentStepElement = scrollRef.current.querySelector(`[data-step="${currentStep}"]`);
      if (currentStepElement) {
        currentStepElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentStep]);
  
  return (
    <div className="border-b border-gray-200">
      {/* Desktop version */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center" data-step={step.id}>
            <div className="flex items-center">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium relative border-2",
                step.id < currentStep ? 'bg-[#2962FF] border-[#2962FF] text-white' : 
                step.id === currentStep && currentStep === 5 ? 'bg-[#2962FF] border-[#2962FF] text-white' :
                step.id === currentStep ? 'bg-white border-[#2962FF] text-[#2962FF]' : 
                'bg-white border-gray-300 text-gray-500'
              )}>
                {step.id < currentStep || (currentStep === 5 && step.id === 5) ? '✓' : step.id}
              </div>
              <span className={clsx(
                "ml-2 text-xs",
                currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={clsx(
                "ml-4 w-12 h-0.5",
                currentStep > step.id ? 'bg-[#2962FF]' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile version */}
      <div 
        ref={scrollRef}
        className="md:hidden flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-shrink-0" data-step={step.id}>
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2",
              step.id < currentStep ? 'bg-[#2962FF] border-[#2962FF] text-white' : 
              step.id === currentStep && currentStep === 5 ? 'bg-[#2962FF] border-[#2962FF] text-white' :
              step.id === currentStep ? 'bg-white border-[#2962FF] text-[#2962FF]' : 
              'bg-white border-gray-300 text-gray-500'
            )}>
              {step.id < currentStep || (currentStep === 5 && step.id === 5) ? '✓' : step.shortLabel}
            </div>
            <span className={clsx(
              "ml-1.5 text-xs whitespace-nowrap",
              currentStep >= step.id ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={clsx(
                "ml-2 w-8 h-0.5",
                currentStep > step.id ? 'bg-[#2962FF]' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BlockchainTimeline = ({ 
  escrow, 
  role, 
  userEmail,
  setShowTermsModal,
  setShowSuccessModal 
}: { 
  escrow: any; 
  role: 'payer' | 'recipient' | null;
  userEmail?: string;
  setShowTermsModal: (show: boolean) => void;
  setShowSuccessModal: (show: boolean) => void; 
}) => {
  const getExplorerUrl = (type: 'tx' | 'address', hash: string) => {
    const base = escrow.network === 'polygon-amoy' || escrow.is_test_mode 
      ? 'https://amoy.polygonscan.com'
      : 'https://polygonscan.com';
    return `${base}/${type}/${hash}`;
  };

  const getSteps = () => {
    const steps = [];
    const isInitiator = escrow?.initiator_email === userEmail;
    const needsToAccept = escrow?.status === 'INITIATED' && !isInitiator && (role === 'payer' || role === 'recipient');
    
    steps.push({
      title: 'Invite sent',
      date: escrow.created_at ? new Date(escrow.created_at).toLocaleString() : undefined,
      status: 'complete' as const,
      subtitle: `To ${escrow.initiator_email === escrow.client_email ? escrow.freelancer_email : escrow.client_email}`,
      isPulsing: false
    });

    if (escrow.accepted_at) {
      steps.push({
        title: 'Terms agreed',
        date: new Date(escrow.accepted_at).toLocaleString(),
        status: 'complete' as const,
        subtitle: 'Both parties accepted the terms',
        isPulsing: false,
        rightContent: (
          <button 
          onClick={() => setShowTermsModal(true)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View Terms
            <ArrowUpRightIcon className="w-3 h-3" />
          </button>
        )
      });
    } else if (escrow.status === 'INITIATED') {
      const waitingFor = escrow.initiator_email === userEmail 
        ? (role === 'payer' ? escrow.freelancer_email : escrow.client_email)
        : null;
      
      steps.push({
        title: 'Awaiting acceptance',
        status: 'pending' as const,
        subtitle: needsToAccept 
          ? 'Review and accept the terms below to proceed with this escrow' 
          : `Waiting for ${waitingFor} to accept the terms`,
        isPulsing: true
      });
      return steps;
    }

    if (escrow.status === 'FUNDED' || escrow.status === 'RELEASED' || escrow.status === 'REFUNDED' || escrow.status === 'SETTLED') {
      steps.push({
        title: 'Secure vault funded & deployed',
        date: escrow.funded_at ? new Date(escrow.funded_at).toLocaleString() : undefined,
        status: 'complete' as const,
        subtitle: `$${(escrow.amount_cents / 100).toFixed(2)} USDC secured in smart contract`,
        isPulsing: false,
        rightContent: escrow.vault_address && (
          <a 
            href={getExplorerUrl('address', escrow.vault_address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View vault
            <ArrowUpRightIcon className="w-3 h-3" />
          </a>
        )
      });
    } else if (escrow.status === 'ACCEPTED') {
      steps.push({
        title: role === 'payer' ? 'Ready to fund' : 'Awaiting funding',
        status: 'pending' as const,
        subtitle: role === 'payer' 
          ? `Add $${(escrow.amount_cents / 100).toFixed(2)} to activate the escrow`
          : `Waiting for ${escrow.client_email} to add funds`,
        isPulsing: true
      });
      return steps;
    }

    if (escrow.status === 'RELEASED') {
      steps.push({
        title: 'Payment released',
        date: escrow.released_at ? new Date(escrow.released_at).toLocaleString() : undefined,
        status: 'complete' as const,
        subtitle: role === 'recipient' 
          ? `You received $${((escrow.amount_cents * 0.9801) / 100).toFixed(2)}`
          : `Funds sent to ${escrow.freelancer_email}`,
        isPulsing: false,
        rightContent: escrow.release_tx_hash && (
          <a 
            href={getExplorerUrl('tx', escrow.release_tx_hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View vault
            <ArrowUpRightIcon className="w-3 h-3" />
          </a>
        )
      });
    } else if (escrow.status === 'SETTLED') {
      steps.push({
        title: 'Settlement completed',
        date: escrow.released_at ? new Date(escrow.released_at).toLocaleString() : undefined,
        status: 'complete' as const,
        subtitle: 'Funds distributed according to settlement agreement',
        isPulsing: false,
        rightContent: (
          <div className="flex flex-col items-end gap-2">
            {escrow.release_tx_hash && (
              <a 
                href={getExplorerUrl('tx', escrow.release_tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View vault
                <ArrowUpRightIcon className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => setShowSuccessModal(true)}
              className="text-xs text-[#2962FF] hover:text-[#1E53E5] flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.024A9.663 9.663 0 0112 21c-2.29 0-4.388-.794-6.032-2.116m12.064 0A9.664 9.664 0 0021 12c0-2.29-.794-4.388-2.116-6.032m0 12.064A9.664 9.664 0 0112 3c-2.29 0-4.388.794-6.032 2.116" />
              </svg>
              Share success
            </button>
          </div>
        )
      });
    } else if (escrow.status === 'REFUNDED') {
      steps.push({
        title: 'Payment refunded',
        date: escrow.released_at ? new Date(escrow.released_at).toLocaleString() : undefined,
        status: 'complete' as const,
        subtitle: `Funds returned to ${escrow.client_email}`,
        isPulsing: false,
        rightContent: escrow.refund_tx_hash && (
          <a 
            href={getExplorerUrl('tx', escrow.refund_tx_hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View vault
            <ArrowUpRightIcon className="w-3 h-3" />
          </a>
        )
      });
    } else if (escrow.status === 'FUNDED') {
      const hasActiveSettlement = escrow.settlement_proposed_by && 
        (escrow.settlement_client_approved !== false && escrow.settlement_freelancer_approved !== false);
      
      if (hasActiveSettlement) {
        const needsYourSettlementApproval = 
          (role === 'payer' && escrow.settlement_client_approved === null) ||
          (role === 'recipient' && escrow.settlement_freelancer_approved === null);
        
        steps.push({
          title: 'Settlement proposed',
          status: 'pending' as const,
          subtitle: needsYourSettlementApproval 
            ? 'Review the proposed settlement terms below and take action'
            : 'Waiting for other party to respond to settlement proposal',
          isPulsing: true
        });
      } else {
        const needsYourApproval = (role === 'payer' && !escrow.client_approved) || 
                                  (role === 'recipient' && !escrow.freelancer_approved);
        const otherParty = role === 'payer' ? escrow.freelancer_email : escrow.client_email;
        
        if (needsYourApproval) {
          steps.push({
            title: 'Escrow is active',
            status: 'pending' as const,
            subtitle: 'Work in progress. Actions available below when ready.',
            isPulsing: true
          });
        } else {
          steps.push({
            title: 'Awaiting other party',
            status: 'pending' as const,
            subtitle: `You approved release. Waiting for ${otherParty} to approve`,
            isPulsing: true
          });
        }
      }
    }
    
    return steps;
  };

  const steps = getSteps();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
      <div className="relative">
        {steps.length > 1 && (
          <div 
            className="absolute left-[6px] w-px bg-gray-200" 
            style={{ 
              top: '6px',
              height: `calc(${(steps.length - 1) * 100}% / ${steps.length})`
            }}
          />
        )}
        
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className={clsx(
                  "w-3 h-3 rounded-full border-2 bg-white",
                  step.status === 'complete' ? 'border-[#2962FF] bg-[#2962FF]' :
                  step.status === 'pending' ? 'border-[#2962FF] bg-white' :
                  'border-gray-300 bg-white'
                )}>
                  {step.isPulsing && (
                    <div className="absolute -inset-1 w-5 h-5 rounded-full border-2 border-[#2962FF] animate-ping" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={clsx(
                        "text-sm font-medium",
                        step.status === 'complete' ? 'text-gray-900' :
                        step.status === 'pending' ? 'text-gray-900' :
                        'text-gray-500'
                      )}>
                        {step.title}
                      </p>
                    </div>
                    {step.date && (
                      <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>
                    )}
                    {step.subtitle && (
                      <p className={clsx(
                        "text-xs mt-0.5",
                        step.status === 'pending' ? 'text-gray-700 font-medium' : 'text-gray-500'
                      )}>
                        {step.subtitle}
                      </p>
                    )}
                  </div>
                  {step.rightContent && (
                    <div className="flex-shrink-0">
                      {step.rightContent}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PaymentIcons = () => (
  <div className="flex items-center justify-center gap-2 py-2">
    <img src="/payment-icons/visa.svg" alt="Visa" className="h-5 opacity-60" />
    <img src="/payment-icons/mastercard.svg" alt="Mastercard" className="h-5 opacity-60" />
    <img src="/payment-icons/amex.svg" alt="Amex" className="h-5 opacity-60" />
    <img src="/payment-icons/apple-pay.svg" alt="Apple Pay" className="h-5 opacity-60" />
    <img src="/payment-icons/google-pay.svg" alt="Google Pay" className="h-5 opacity-60" />
    <img src="/payment-icons/bank.svg" alt="Bank" className="h-5 opacity-60" />
  </div>
);

interface EscrowDetailPanelProps {
  escrowId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  autoCloseOnFund?: boolean;
  onShowMoonPay?: (data: { vaultAddress: string; amount: number; escrowId: string }) => void;
  onShowDeposit?: (suggestedAmount?: number) => void; 
}

export function EscrowDetailPanel({ 
  escrowId, 
  isOpen, 
  onClose, 
  onUpdate,
  autoCloseOnFund = true,
  onShowMoonPay,
  onShowDeposit
}: EscrowDetailPanelProps) {
  const { user, supabase, ensureWallet } = useAuth();
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(''); 
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'bank' | null>(null);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const role = useMemo(() => {
    if (!escrow || !user?.email) return null;
    if (user.email === escrow.client_email) return 'payer';
    if (user.email === escrow.freelancer_email) return 'recipient';
    return null;
  }, [escrow, user?.email]);

  const isInitiator = escrow?.status === 'INITIATED' && 
    user?.email === escrow?.initiator_email;

  const needsToAccept = escrow?.status === 'INITIATED' && 
    !isInitiator && (role === 'payer' || role === 'recipient');

  const getCurrentStep = () => {
    if (!escrow) return 1;
    switch (escrow.status) {
      case 'INITIATED': return 2;
      case 'ACCEPTED': return 3;
      case 'FUNDED': return 4;
      case 'RELEASED':
      case 'REFUNDED':
      case 'SETTLED': return 5;
      case 'DECLINED': return 2;
      default: return 1;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !escrowId || !user?.email || fetchingRef.current) return;
    
    const fetchEscrow = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!session || sessionError) {
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (!newSession || refreshError) {
            setLoading(false);
            return;
          }
        }
        
        let retries = 3;
        let data = null;
        let error = null;
        
        while (retries > 0 && !data) {
          const result = await supabase
            .from('escrows')
            .select('*')
            .eq('id', escrowId)
            .single();
          
          data = result.data;
          error = result.error;
          
          if (error?.message?.includes('JWT')) {
            await supabase.auth.refreshSession();
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            break;
          }
        }
        
        if (data && mountedRef.current) {
          setEscrow(data);
        }
      } catch (error: any) {
        console.error('Error:', error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    };
    
    fetchEscrow();
    
    const channel = supabase
      .channel(`escrow-${escrowId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'escrows', filter: `id=eq.${escrowId}` },
        (payload) => {
          if (mountedRef.current) {
            setEscrow(payload.new);
            if (onUpdate) onUpdate();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, escrowId, user?.email, supabase, onUpdate]);

  useEffect(() => {
    if (!escrow || !user?.email) return;
    
    const shouldShow = 
      (escrow.status === 'RELEASED' || escrow.status === 'SETTLED') &&
      (escrow.released_at || escrow.settled_at) &&
      new Date(escrow.released_at || escrow.settled_at).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    if (shouldShow) {
      const isClient = user.email === escrow.client_email;
      const hasSeenModal = isClient 
        ? escrow.success_modal_shown_to_client 
        : escrow.success_modal_shown_to_freelancer;
      
      if (!hasSeenModal) {
        setShowSuccessModal(true);
        
        const updateField = isClient 
          ? 'success_modal_shown_to_client' 
          : 'success_modal_shown_to_freelancer';
        
        supabase
          .from('escrows')
          .update({ [updateField]: true })
          .eq('id', escrow.id)
          .then(({ error }) => {
            if (error) console.error('Failed to mark modal as shown:', error);
          });
      }
    }
  }, [escrow?.status, escrow?.id, escrow?.released_at, escrow?.settled_at, user?.email, supabase]);

  const handleAccept = async () => {
    if (!termsAccepted) {
      alert('Please accept the terms to continue');
      return;
    }
  
    setProcessing(true);
    setError('');
  
    try {
      const { data: existingWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', user?.email)
        .maybeSingle();
  
      let walletAddress = existingWallet?.wallet_address;
  
      if (!walletAddress) {
        try {
          walletAddress = await ensureWallet();
          
          if (!walletAddress) {
            throw new Error('Wallet creation returned null');
          }
        } catch (err: any) {
          alert(`Wallet creation failed: ${err.message || 'Please try again'}`);
          setProcessing(false);
          return;
        }
      }
  
      const otherPartyEmail = role === 'payer' ? escrow.freelancer_email : escrow.client_email;
      const { data: otherWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', otherPartyEmail)
        .maybeSingle();
  
      const otherWalletAddress = otherWallet?.wallet_address;
  
      let vaultAddress = null;
      let splitterAddress = null;

      if (otherWalletAddress) {
        const clientWallet = role === 'payer' ? walletAddress : otherWalletAddress;
        const freelancerWallet = role === 'recipient' ? walletAddress : otherWalletAddress;
        
        try {
          const { ethers } = await import('ethers');
          
          const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
          const provider = new ethers.providers.StaticJsonRpcProvider(
            isProduction 
              ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
              : 'https://rpc-amoy.polygon.technology'
          );

          const factoryAddress = isProduction
            ? process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS_MAINNET
            : process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS;

          const factory = new ethers.Contract(
            factoryAddress,
            ["function getVaultAddress(bytes32,address,address) view returns (address,address)"],
            provider
          );

          [vaultAddress, splitterAddress] = await factory.getVaultAddress(
            escrow.salt,
            clientWallet,
            freelancerWallet
          );
        } catch (err) {
          console.warn('Vault pre-computation failed:', err);
        }
      }
  
      const updateData: any = {
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString()
      };
      
      if (role === 'recipient') {
        updateData.recipient_wallet_address = walletAddress;
        updateData.freelancer_wallet_address = walletAddress;
        if (otherWalletAddress) {
          updateData.client_wallet_address = otherWalletAddress;
        }
      } else if (role === 'payer') {
        updateData.client_wallet_address = walletAddress;
        if (otherWalletAddress) {
          updateData.recipient_wallet_address = otherWalletAddress;
          updateData.freelancer_wallet_address = otherWalletAddress;
        }
      }
  
      if (vaultAddress) {
        updateData.vault_address = vaultAddress;
      }
      if (splitterAddress) {
        updateData.splitter_address = splitterAddress;
      }
  
      const { error: updateError } = await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrowId);
  
      if (updateError) {
        throw new Error(`Failed to accept escrow: ${updateError.message}`);
      }
  
      if (onUpdate) onUpdate();
      
    } catch (error: any) {
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
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to decline. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const [showFundModal, setShowFundModal] = useState(false);

  const handleFund = async () => {
    try {
      // Prepare vault address
      const response = await fetch('/api/escrow/prepare-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId: escrow.id })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to prepare funding');
      }
      
      const { vaultAddress } = await response.json();
      
      // Show fund modal (checks balance, etc.)
      setShowFundModal(true);
      
    } catch (error: any) {
      alert(`Failed to prepare vault: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#64748B]">
              VAULT DETAILS
            </span>
            {escrow && (
              <div className={clsx(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border",
                escrow.status === 'FUNDED' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                escrow.status === 'RELEASED' ? 'border-green-200 text-green-700 bg-green-50' :
                escrow.status === 'INITIATED' ? 'border-gray-200 text-gray-700' :
                escrow.status === 'DECLINED' ? 'border-red-200 text-red-700 bg-red-50' :
                'border-yellow-200 text-yellow-700 bg-yellow-50'
              )}>
                {escrow.status}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ProgressIndicator 
          currentStep={getCurrentStep()} 
          escrow={escrow} 
          role={role}
          userEmail={user?.email}
        />

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-700" />
            </div>
          ) : !escrow || !role ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Escrow not found</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Escrow amount box */}
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Escrow Amount</p>
                    <div className="text-3xl font-bold text-gray-900">
                      ${(escrow.amount_cents / 100).toFixed(2)}
                    </div>
                    {role === 'recipient' && (
                      <p className="text-sm text-gray-600 mt-1">
                        You'll receive: <span className="font-medium">${((escrow.amount_cents * 0.9801) / 100).toFixed(2)}</span>
                        <span className="text-xs text-gray-500 ml-1">(1.99% fee)</span>
                      </p>
                    )}
                  </div>
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
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">Description</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{escrow.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Share link for initiator */}
              {isInitiator && escrow.status === 'INITIATED' && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium text-gray-900 mb-3">Share this vault link</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/${escrow.premium_link || `escrow/${escrow.id}`}`}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm font-mono text-gray-700"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                          onClick={async () => {
                            const link = `${window.location.origin}/${escrow.premium_link || `escrow/${escrow.id}`}`;
                            await navigator.clipboard.writeText(link);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className={clsx(
                            "px-4 py-2 rounded text-sm font-medium transition-all",
                            copied 
                              ? "bg-green-600 text-white" 
                              : "bg-[#2962FF] text-white hover:bg-[#1E53E5]"
                          )}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Share this link for them to review and accept.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mb-6">
                    <button
                      onClick={() => setShowCancelDialog(true)}
                      className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      Cancel this vault
                    </button>
                  </div>
                </>
              )}

              {/* Timeline */}
              <div className="my-6">
                <BlockchainTimeline 
                  escrow={escrow} 
                  role={role} 
                  userEmail={user?.email}
                  setShowTermsModal={setShowTermsModal}
                  setShowSuccessModal={setShowSuccessModal} 
                />
              </div>

              {/* Actions section */}
              <div className="space-y-3">
                {/* Cancel dialog */}
                {showCancelDialog && (escrow.status === 'INITIATED' || escrow.status === 'ACCEPTED') && (
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">Cancel this vault?</p>
                    <p className="text-xs text-gray-600 mb-4">
                      {escrow.status === 'INITIATED' 
                        ? "This will cancel the invitation. No funds have been added yet."
                        : "Both parties have agreed to terms, but no funds have been added. Are you sure you want to cancel?"}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          setProcessing(true);
                          try {
                            await supabase
                              .from('escrows')
                              .update({
                                status: 'CANCELLED',
                                cancelled_at: new Date().toISOString()
                              })
                              .eq('id', escrowId)
                              .in('status', ['INITIATED', 'ACCEPTED']);
                            
                            if (onUpdate) onUpdate();
                            onClose();
                          } catch (error) {
                            console.error('Cancel failed:', error);
                          } finally {
                            setProcessing(false);
                          }
                        }}
                        disabled={processing}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                      >
                        {processing ? 'Cancelling...' : 'Yes, cancel'}
                      </button>
                      <button
                        onClick={() => setShowCancelDialog(false)}
                        disabled={processing}
                        className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Keep waiting
                      </button>
                    </div>
                  </div>
                )}

                {/* Accept/Decline for non-initiator */}
                {escrow.status === 'INITIATED' && needsToAccept && (
                  <>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="accept-terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={!user}
                        />
                        <label htmlFor="accept-terms" className="text-sm text-gray-900 cursor-pointer">
                          I understand and accept the{' '}
                          <button
                            onClick={() => setShowTermsModal(true)}
                            className="text-[#2962FF] hover:underline"
                            type="button"
                          >
                            vault protection terms
                          </button>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg text-xs bg-white">
                      {role === 'payer' ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Protected until you approve</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">You control release</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <ScaleIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Kleros for disputes</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Keep 98% of payment</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Instant when approved</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <ScaleIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Kleros for disputes</span>
                          </span>
                        </>
                      )}
                    </div>
                    
                    {!showDeclineForm ? (
                      <>
                        <button
                          onClick={handleAccept}
                          disabled={processing || !termsAccepted || !user}
                          className={clsx(
                            "w-full py-2.5 rounded-lg transition-all text-sm font-medium",
                            (termsAccepted && user)
                              ? "bg-[#2962FF] text-white hover:bg-[#1d4ed8]" 
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          {!user ? 'Loading...' : processing ? 'Processing...' : 'Accept Vault'}
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

                {/* Fund button */}
                {escrow.status === 'ACCEPTED' && role === 'payer' && (
                  <>
                    <div className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg text-xs bg-white">
                      <span className="flex items-center gap-1.5">
                        <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                        <span className="text-gray-700">Protected until you approve</span>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                        <span className="text-gray-700">You control release</span>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <ScaleIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                        <span className="text-gray-700">Settlement for disputes</span>
                      </span>
                    </div>
                    
                    <button
                      onClick={handleFund}
                      disabled={processing}
                      className="w-full py-2.5 rounded-lg transition-all text-sm font-medium bg-[#2962FF] text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                    >
                      {processing ? 'Starting payment…' : 'Fund Vault'}
                    </button>

                    <PaymentIcons />
                    
                    <button
                      onClick={() => setShowCancelDialog(true)}
                      className="w-full mt-2 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel Vault
                    </button>
                  </>
                )}  

                {/* Recipient waiting */}
                {escrow.status === 'ACCEPTED' && role === 'recipient' && (
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        Waiting for {escrow.client_email} to fund the vault.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowCancelDialog(true)}
                      className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel Vault
                    </button>
                  </div>
                )}

                {/* Settlement actions */}
                {escrow.status === 'FUNDED' && role && (
                  <>
                    <div className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg text-xs bg-white">
                      {role === 'payer' ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Protected until you approve</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">You control release</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <ScaleIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Settlement for disputes</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Keep 98% of payment</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Instant when approved</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <ScaleIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                            <span className="text-gray-700">Settlement for disputes</span>
                          </span>
                        </>
                      )}
                    </div>
                    
                    <SettlementActions
                      escrow={escrow}
                      userRole={role as 'payer' | 'recipient'}
                      onAction={async () => {
                        if (onUpdate) onUpdate();
                      }}
                    />
                  </>
                )}

                {/* Declined status */}
                {escrow.status === 'DECLINED' && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-2 border-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
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

                {/* Share Success */}
                {(escrow.status === 'RELEASED' || escrow.status === 'SETTLED') && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowSuccessModal(true)}
                      className="w-full py-3 bg-gradient-to-r from-[#2962FF] to-[#1E53E5] text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Take Your Victory Lap</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Share verified proof of this completed escrow transaction
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

{/* Terms Modal */}
{showTermsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Vault Protection</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Security</p>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>Each vault is secured by a dedicated smart contract on Polygon</li>
                  <li>Funds are locked and protected by immutable blockchain code</li>
                  <li>Zero admin access - escrowhaven cannot touch vault funds</li>
                  <li>Unique vault address provided upon creation</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-2">Payment Control</p>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>Full Release: Sender approves complete vault release to receiver</li>
                  <li>Settlement: Both parties can propose custom vault distributions</li>
                  <li>Refund: Receiver can return entire vault balance to sender</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-2">Complete Transparency</p>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>All vault activity is publicly verifiable on Polygon blockchain</li>
                  <li>1.99% platform fee only charged on successful vault release</li>
                  <li>Digital signatures ensure all vault actions are authentic</li>
                  <li>Non-custodial: you maintain full control of your vault</li>
                </ul>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  By creating a vault, you acknowledge that blockchain transactions are irreversible
                  and escrowhaven acts only as a technology provider, not as a custodian or arbitrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (escrow.status === 'RELEASED' || escrow.status === 'SETTLED') && (
        <TransactionSuccessModal
          escrow={escrow}
          role={role}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Fund Escrow Modal */}
      {showFundModal && escrow.vault_address && (
        <FundEscrowModal
          isOpen={showFundModal}
          onClose={() => setShowFundModal(false)}
          escrowAmount={escrow.amount_cents / 100}
          escrowId={escrow.id}
          vaultAddress={escrow.vault_address}
          onSuccess={() => {
            if (onUpdate) onUpdate();
          }}
          onDeposit={onShowDeposit}
        />
      )}

    </>
  );
}