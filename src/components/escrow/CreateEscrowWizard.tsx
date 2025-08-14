// src/components/escrow/CreateEscrowWizard.tsx - Enhanced with Animations
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CreateEscrowWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onEscrowCreated?: (escrowId: string) => void;
}

// Custom icon components
const WalletIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="7" width="18" height="12" rx="2" />
    <path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M16 14h2" />
  </svg>
);

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

const ArrowIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Animated components
const ContractBuildingAnimation = () => (
  <div className="flex items-center justify-center space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-500 rounded-sm animate-pulse"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const WalletConnection = ({ email, walletAddress, isConnected }: { email?: string; walletAddress?: string; isConnected: boolean }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <>
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300
        ${isConnected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
        }
      `}>
        <div className="relative">
          <WalletIcon className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
          {isConnected && (
            <div className="absolute -top-1 -right-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-600">
            Secure email-signature wallet detected for
          </div>
          <div className="text-xs font-medium truncate">
            {isConnected && email ? email : 'Not connected'}
          </div>
          {isConnected && walletAddress && (
            <div className="text-xs font-mono text-gray-500 mt-0.5">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          What's this?
        </button>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Secure Wallet</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <div className="flex items-start gap-2">
                  <ShieldIcon className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Email-Signature Wallet</p>
                    <p>Created automatically when you signed up. Your wallet is cryptographically linked to your email address. Only you can sign transactions by verifying your email.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-0.5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Non-Custodial</p>
                    <p>SafeRelay never holds or controls your funds. The smart contract enforces the escrow rules automatically.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start gap-2">
                  <BlockchainIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">On-Chain Security</p>
                    <p>Your escrow lives on the Polygon blockchain. Both parties must approve before funds can be released.</p>
                  </div>
                </div>
              </div>
              
              {walletAddress && (
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-gray-600 mb-1">Your wallet address:</p>
                  <p className="font-mono text-xs break-all">{walletAddress}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Terms Disclosure Component
const TermsDisclosure = ({ accepted, onAccept }: { accepted: boolean; onAccept: (accepted: boolean) => void }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={accepted}
          onChange={(e) => onAccept(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <label htmlFor="terms" className="text-sm text-gray-900 cursor-pointer">
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
                    <span>Contract address will be provided after deployment</span>
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
                    <span>All actions require email verification and digital signatures</span>
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
                  By deploying this escrow, you acknowledge that transactions on the blockchain are irreversible and SafeRelay acts only as a technology provider, not as a custodian or arbitrator.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DeploymentStepData {
  step: number;
  status: 'pending' | 'active' | 'complete';
  message: string;
}

const DeploymentStep = ({ step, status, message }: DeploymentStepData) => {
  const getIcon = () => {
    if (status === 'complete') return <CheckIcon className="w-3 h-3 text-green-600" />;
    if (status === 'active') return <ContractBuildingAnimation />;
    return <div className="w-3 h-3 rounded-full bg-gray-300" />;
  };

  return (
    <div className={`
      flex items-center gap-3 p-2 rounded transition-all duration-300
      ${status === 'active' ? 'bg-blue-50' : ''}
      ${status === 'complete' ? 'opacity-100' : 'opacity-60'}
    `}>
      <div className="w-6 h-6 flex items-center justify-center">
        {getIcon()}
      </div>
      <span className={`text-sm ${status === 'active' ? 'font-medium' : ''}`}>
        {message}
      </span>
    </div>
  );
};

const TrustBadge = ({ type, value, link }: { type: 'contract' | 'security'; value: string; link?: string }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-2">
      {type === 'contract' && <BlockchainIcon className="w-4 h-4 text-gray-600" />}
      {type === 'security' && <ShieldIcon className="w-4 h-4 text-gray-600" />}
      <span className="text-xs text-gray-600">{type === 'contract' ? 'Contract' : 'Security'}</span>
    </div>
    {link ? (
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        {value}
        <ArrowIcon className="w-3 h-3" />
      </a>
    ) : (
      <span className="text-xs font-mono text-gray-900">{value}</span>
    )}
  </div>
);

export function CreateEscrowWizard({ isOpen, onClose, onEscrowCreated }: CreateEscrowWizardProps) {
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'complete'>('idle');
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStepData[]>([]);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Form fields - all on one page
  const [role, setRole] = useState<'payer' | 'recipient'>('payer');
  const [amountUsd, setAmountUsd] = useState('');
  const [otherPartyEmail, setOtherPartyEmail] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  
  // Auto-resize textarea
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Deployment result
  const [escrowData, setEscrowData] = useState<{
    escrowId: string;
    premiumLink?: string;
    contractAddress?: string;
    network?: string;
    explorerUrl?: string;
    gasUsed?: string;
    timestamp?: string;
  } | null>(null);

  const feeAmount = amountUsd ? (parseFloat(amountUsd) * 0.0199).toFixed(2) : '0.00';
  const receiverAmount = amountUsd ? (parseFloat(amountUsd) * 0.9801).toFixed(2) : '0.00';

  // Fetch user wallet on mount
  useEffect(() => {
    if (user?.email) {
      supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', user.email)
        .single()
        .then(({ data }) => {
          if (data?.wallet_address) {
            setUserWallet(data.wallet_address);
          }
        });
    }
  }, [user, supabase]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setDeploymentStatus('idle');
      setError('');
      setRole('payer');
      setAmountUsd('');
      setOtherPartyEmail('');
      setDescription('');
      setDescriptionExpanded(false);
      setTermsAccepted(false);
      setEscrowData(null);
      setDeploymentSteps([]);
    }
  }, [isOpen, user]);

  // Auto-resize description when expanded
  useEffect(() => {
    if (descriptionRef.current && descriptionExpanded) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
    }
  }, [description, descriptionExpanded]);

  const isFormValid = () => {
    return amountUsd && 
           parseFloat(amountUsd) >= 1 && 
           parseFloat(amountUsd) <= 50000 &&
           otherPartyEmail && 
           otherPartyEmail.includes('@') &&
           termsAccepted;
  };

  // Generate human-readable link with standard format
  const generatePremiumLink = (escrowId: string): string => {
    // Use last 4-5 characters of escrow ID for uniqueness
    const uniqueId = escrowId.replace(/-/g, '').slice(-5).toUpperCase();
    return `secure-payment-${uniqueId}`;
  };

  const simulateInvitationCreation = async () => {
    const steps: DeploymentStepData[] = [
      { step: 1, status: 'active', message: 'Validating inputs...' },
      { step: 2, status: 'pending', message: 'Creating escrow invitation...' },
      { step: 3, status: 'pending', message: 'Generating secure link...' },
      { step: 4, status: 'pending', message: 'Sending notification...' }
    ];
    
    setDeploymentSteps(steps);
    
    // Simulate each step
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDeploymentSteps(prev => prev.map((s, idx) => {
        if (idx === i) return { ...s, status: 'complete' as const };
        if (idx === i + 1) return { ...s, status: 'active' as const };
        return s;
      }));
    }
    
    // Final complete state
    await new Promise(resolve => setTimeout(resolve, 500));
    setDeploymentSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
  };

  const handleCreate = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setDeploymentStatus('deploying');
    
    try {
      // Start invitation animation (not deployment)
      await simulateInvitationCreation();
      
      // Call actual API - this creates an INITIATED escrow, not a deployed contract
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: parseFloat(amountUsd),
          payerEmail: role === 'payer' ? user?.email : otherPartyEmail,
          recipientEmail: role === 'recipient' ? user?.email : otherPartyEmail,
          initiatorRole: role,
          description: description || undefined
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create escrow invitation');
      }
      
      // Generate premium link
      const premiumLink = generatePremiumLink(data.escrowId);
      
      // Store the premium link in database (you'll need to add this field)
      await supabase
        .from('escrows')
        .update({ premium_link: premiumLink })
        .eq('id', data.escrowId);
      
      setEscrowData({
        escrowId: data.escrowId,
        premiumLink: premiumLink,
        contractAddress: undefined,
        network: 'polygon',
        timestamp: new Date().toISOString()
      });
      
      setDeploymentStatus('complete');
      
    } catch (error: any) {
      console.error('Error creating escrow:', error);
      setError(error.message || 'Failed to create escrow invitation');
      setDeploymentStatus('idle');
      setDeploymentSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDeploymentStatus('idle');
    setEscrowData(null);
    setAmountUsd('');
    setOtherPartyEmail('');
    setDescription('');
    setDescriptionExpanded(false);
    setTermsAccepted(false);
    setDeploymentSteps([]);
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-gray-900">
            {deploymentStatus === 'idle' ? 'Create escrow invitation' : 
             deploymentStatus === 'deploying' ? 'Creating invitation...' : 
             'Invitation sent'}
          </h2>
          {deploymentStatus === 'deploying' && <ContractBuildingAnimation />}
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {deploymentStatus === 'idle' && (
          <div className="p-6 space-y-6">
            {/* Wallet Connection Status */}
            <WalletConnection 
              email={user?.email} 
              walletAddress={userWallet || undefined}
              isConnected={!!user} 
            />
            
            {/* All inputs on one page */}
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">I am the</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('payer')}
                    className={`py-2 px-3 border rounded-lg text-sm transition-all ${
                      role === 'payer' 
                        ? 'border-gray-900 bg-gray-900 text-white' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Sender
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recipient')}
                    className={`py-2 px-3 border rounded-lg text-sm transition-all ${
                      role === 'recipient' 
                        ? 'border-gray-900 bg-gray-900 text-white' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Receiver
                  </button>
                </div>
              </div>

              {/* Amount and Other Party in two columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={amountUsd}
                      onChange={(e) => setAmountUsd(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                      placeholder="0.00"
                      step="0.01"
                      min="1"
                      max="50000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {role === 'payer' ? 'Receiver email' : 'Sender email'}
                  </label>
                  <input
                    type="email"
                    value={otherPartyEmail}
                    onChange={(e) => setOtherPartyEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Description - Expandable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-gray-600">Description (optional)</label>
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {descriptionExpanded ? 'Collapse' : 'Expand'}
                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={descriptionExpanded ? 6 : 2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm resize-none transition-all"
                  placeholder="Project details, deliverables, timeline..."
                  style={{ 
                    minHeight: descriptionExpanded ? '150px' : '48px',
                    overflow: descriptionExpanded ? 'auto' : 'hidden'
                  }}
                />
                {!descriptionExpanded && description.length > 100 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length} characters
                  </p>
                )}
              </div>
            </div>

            {/* Fee breakdown for receiver - clean table style */}
            {role === 'recipient' && amountUsd && (
              <div className={`bg-gray-50 rounded-lg p-4 space-y-2 transition-all duration-300 ${
                amountUsd ? 'opacity-100' : 'opacity-50'
              }`}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-mono">${parseFloat(amountUsd || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee (1.99%)</span>
                  <span className="font-mono text-gray-500">-${feeAmount}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-sm font-medium">You'll receive</span>
                  <span className="font-mono font-medium">${receiverAmount}</span>
                </div>
              </div>
            )}

            {/* Amount confirmation for sender */}
            {role === 'payer' && amountUsd && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  You'll send <span className="font-mono font-medium">${parseFloat(amountUsd || '0').toFixed(2)}</span> to {otherPartyEmail || 'the receiver'}
                </p>
              </div>
            )}

            {/* Trust indicators */}
            <div className="space-y-2">
              <TrustBadge type="security" value="Non-custodial" />
              <TrustBadge type="security" value="EIP-712 signatures" />
            </div>

            {/* Terms acceptance */}
            <TermsDisclosure 
              accepted={termsAccepted} 
              onAccept={setTermsAccepted} 
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={!isFormValid() || loading}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isFormValid() 
                  ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {!termsAccepted ? 'Accept terms to continue' : 'Send escrow invitation'}
            </button>
          </div>
        )}

        {deploymentStatus === 'deploying' && (
          <div className="p-6">
            <div className="space-y-2 mb-6">
              {deploymentSteps.map((step, idx) => (
                <DeploymentStep key={idx} {...step} />
              ))}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Creating secure escrow invitation...
              </p>
              <p className="text-xs text-blue-700 mt-1">
                The other party will need to accept before the contract is deployed
              </p>
            </div>
          </div>
        )}

        {deploymentStatus === 'complete' && escrowData && (
          <div className="p-6 space-y-6">
            {/* Success animation */}
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">Invitation sent</h3>
              <p className="text-sm text-gray-600">
                {otherPartyEmail} has been notified
              </p>
            </div>

            {/* Shareable Link - Premium Style */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-600">Your escrow link</label>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/${escrowData.premiumLink || escrowData.escrowId.slice(-8)}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/${escrowData.premiumLink || escrowData.escrowId.slice(-8)}`;
                      navigator.clipboard.writeText(link);
                      // Simple toast notification
                      const toast = document.createElement('div');
                      toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md text-sm z-[60]';
                      toast.textContent = 'Link copied!';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 2000);
                    }}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldIcon className="w-3 h-3" />
                  <span>Link is viewable by anyone • Only {otherPartyEmail} can accept</span>
                </div>
              </div>
            </div>

            {/* Escrow status info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-900">Awaiting acceptance</span>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <p>Next steps:</p>
                <ol className="ml-4 space-y-1">
                  <li>1. {role === 'payer' ? 'Receiver' : 'Sender'} accepts the invitation</li>
                  <li>2. {role === 'payer' ? 'You fund' : 'Sender funds'} the escrow</li>
                  <li>3. Smart contract is deployed automatically</li>
                  <li>4. Both parties can manage the escrow</li>
                </ol>
              </div>
            </div>

            {/* Important note about contract deployment */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <BlockchainIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-900 font-medium mb-1">Smart contract deployment</p>
                  <p className="text-blue-700 text-xs">
                    The immutable smart contract will be deployed to Polygon when the escrow is funded. 
                    You'll receive the contract address for full transparency.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (onEscrowCreated) onEscrowCreated(escrowData.escrowId);
                  onClose();
                }}
                className="flex-1 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8]"
              >
                View escrow status
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Create another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}