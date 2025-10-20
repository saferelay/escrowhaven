// src/components/escrow/CreateEscrowWizard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

interface CreateEscrowWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onEscrowCreated?: (escrowId: string) => void;
}

// Progress indicator - 5 steps
const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Create' },
    { id: 2, label: 'Accept' },
    { id: 3, label: 'Fund' },
    { id: 4, label: 'Work' },
    { id: 5, label: 'Complete' }
  ];
  
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div className={clsx(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium relative border-2",
                currentStep > step.id ? 'bg-[#2962FF] border-[#2962FF] text-white' : 
                currentStep === step.id ? 'bg-white border-[#2962FF] text-[#2962FF]' : 
                'bg-white border-gray-300 text-gray-500'
              )}>
                {currentStep > step.id ? '✓' : step.id}
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
    </div>
  );
};

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

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Terms Disclosure - Vault protection model
const TermsDisclosure = ({ accepted, onAccept }: { accepted: boolean; onAccept: (accepted: boolean) => void }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="accept-terms"
          checked={accepted}
          onChange={(e) => onAccept(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-1">
          <label htmlFor="accept-terms" className="text-sm text-gray-900 cursor-pointer select-none">
            I understand this vault will be protected by blockchain escrow
          </label>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
          >
            {expanded ? 'Hide' : 'View'} vault protection details
            <ChevronDownIcon className={clsx("w-3 h-3 transition-transform", expanded && "rotate-180")} />
          </button>
          
          {expanded && (
            <div className="mt-3 space-y-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Vault Security</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Each vault is secured by a dedicated smart contract on Polygon</li>
                  <li>Funds are locked and protected by immutable blockchain code</li>
                  <li>Zero admin access - escrowhaven cannot touch vault funds</li>
                  <li>Unique vault address provided upon creation</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-1">Payment Control</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Full Release: Sender approves complete vault release to receiver</li>
                  <li>Settlement: Both parties can propose custom vault distributions</li>
                  <li>Refund: Receiver can return entire vault balance to sender</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold text-gray-900 mb-1">Complete Transparency</p>
                <ul className="space-y-1 list-disc pl-5">
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
    if (status === 'active') return (
      <div className="relative">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <div className="absolute inset-0 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
      </div>
    );
    return <div className="w-3 h-3 rounded-full bg-gray-300" />;
  };

  return (
    <div className={clsx(
      "flex items-center gap-3 p-2 rounded transition-all duration-300",
      status === 'active' ? 'bg-blue-50' : '',
      status === 'complete' ? 'opacity-100' : 'opacity-60'
    )}>
      <div className="w-6 h-6 flex items-center justify-center">
        {getIcon()}
      </div>
      <span className={clsx("text-sm", status === 'active' ? 'font-medium' : '')}>
        {message}
      </span>
    </div>
  );
};

export function CreateEscrowWizard({ isOpen, onClose, onEscrowCreated }: CreateEscrowWizardProps) {
  const { user, supabase, ensureWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'complete'>('idle');
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStepData[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Form fields
  const [role, setRole] = useState<'payer' | 'recipient'>('payer');
  const [amountUsd, setAmountUsd] = useState('');
  const [otherPartyEmail, setOtherPartyEmail] = useState('');
  const [description, setDescription] = useState('');
  
  // Auto-resize textarea
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const prevIsOpenRef = useRef(isOpen);

  // Deployment result
  const [escrowData, setEscrowData] = useState<{
    escrowId: string;
    premiumLink?: string;
  } | null>(null);

  const feeAmount = amountUsd ? (parseFloat(amountUsd) * 0.0199).toFixed(2) : '0.00';
  const receiverAmount = amountUsd ? (parseFloat(amountUsd) * 0.9801).toFixed(2) : '0.00';

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && user) {
      setDeploymentStatus('idle');
      setError('');
      setRole('payer');
      setAmountUsd('');
      setOtherPartyEmail('');
      setDescription('');
      setTermsAccepted(false);
      setEscrowData(null);
      setDeploymentSteps([]);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, user]);

  // Auto-resize description textarea
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
    }
  }, [description]);

  const isFormValid = () => {
    return amountUsd && 
           parseFloat(amountUsd) >= 1 && 
           parseFloat(amountUsd) <= 50000 &&
           otherPartyEmail && 
           otherPartyEmail.includes('@') &&
           otherPartyEmail !== user?.email &&
           termsAccepted;
  };

  const simulateTransactionCreation = async () => {
    const steps: DeploymentStepData[] = [
      { step: 1, status: 'active', message: 'Validating transaction details...' },
      { step: 2, status: 'pending', message: 'Creating secure transaction...' },
      { step: 3, status: 'pending', message: 'Preparing transaction vault...' },
      { step: 4, status: 'pending', message: 'Sending notification...' }
    ];
    
    setDeploymentSteps(steps);
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDeploymentSteps(prev => prev.map((s, idx) => {
        if (idx === i) return { ...s, status: 'complete' as const };
        if (idx === i + 1) return { ...s, status: 'active' as const };
        return s;
      }));
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setDeploymentSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
  };

  const handleCreate = async () => {
    if (!isFormValid() || !user?.email) {
      setError('Please fill in all required fields');
      return;
    }
  
    // Ensure wallet exists before creating escrow
    try {
      const wallet = await ensureWallet();
      if (!wallet) {
        setError('Failed to connect wallet. Please try again.');
        return;
      }
    } catch (err: any) {
      setError('Wallet connection required to create escrow');
      return;
    }
  
    
    const clientEmail = role === 'payer' ? user?.email : otherPartyEmail;
    const freelancerEmail = role === 'recipient' ? user?.email : otherPartyEmail;
    
    if (clientEmail === freelancerEmail) {
      setError('You cannot create a transaction with yourself.');
      return;
    }
  
    setLoading(true);
    setError('');
    setDeploymentStatus('deploying');
    
    try {
      await simulateTransactionCreation();
      
      const response = await fetch('/api/escrow/create-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail,
          freelancerEmail,
          amountUsd: parseFloat(amountUsd),
          initiatorEmail: user?.email,
          initiatorRole: role,
          description: description || undefined
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }
      
      const data = await response.json();
      
      // Premium link is now generated server-side
      console.log('✅ Vault created with premium link:', data.premiumLink);
      
      setEscrowData({
        escrowId: data.escrowId,
        premiumLink: data.premiumLink
      });
      
      setDeploymentStatus('complete');
      
    } catch (error: any) {
      console.error('Error creating vault:', error);
      setError(error.message || 'Failed to start vault');
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
    setTermsAccepted(false);
    setDeploymentSteps([]);
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* FIXED HEADER */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2 bg-[#F8FAFC]">
        <span className="text-[11px] font-medium text-[#64748B]">
          {deploymentStatus === 'idle' ? 'NEW TRANSACTION' : 
           deploymentStatus === 'deploying' ? 'CREATING TRANSACTION...' : 
           'TRANSACTION CREATED'}
        </span>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress indicator */}
      {deploymentStatus === 'idle' && (
        <ProgressIndicator currentStep={1} />
      )}

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {deploymentStatus === 'idle' && (
          <div className="p-6 space-y-6">
            {/* Flow explanation */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-blue-600">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">You're creating the vault</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Next, they'll accept terms, then {role === 'payer' ? 'you' : 'they'} will fund the transaction's vault.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form inputs */}
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">I am the</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('payer')}
                    className={clsx(
                      "py-2 px-3 border rounded-lg text-sm transition-all",
                      role === 'payer' 
                        ? 'border-[#2962FF] bg-[#2962FF] text-white' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    )}
                  >
                    Sender (paying)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recipient')}
                    className={clsx(
                      "py-2 px-3 border rounded-lg text-sm transition-all",
                      role === 'recipient' 
                        ? 'border-[#2962FF] bg-[#2962FF] text-white' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    )}
                  >
                    Receiver (service provider)
                  </button>
                </div>
              </div>

              {/* Amount and Other Party */}
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
                    onChange={(e) => {
                      setOtherPartyEmail(e.target.value);
                      if (error && e.target.value !== user?.email) {
                        setError('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description (optional)</label>
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm resize-none"
                  placeholder="Brief description for reference"
                  style={{ minHeight: '48px', maxHeight: '300px' }}
                />
              </div>
            </div>

            {/* Fee breakdown for receiver */}
            {role === 'recipient' && amountUsd && parseFloat(amountUsd) >= 1 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction Vault amount</span>
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

            {/* Trust benefits */}
            <div className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg text-xs bg-white">
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                <span className="text-gray-700">Secure vault</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                <span className="text-gray-700">Non-custodial</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5">
                <ScaleIcon className="w-3.5 h-3.5 text-[#2962FF]" />
                <span className="text-gray-700">Fair resolution</span>
              </span>
            </div>

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={!isFormValid() || loading}
              className={clsx(
                "w-full py-2.5 rounded-lg transition-all text-sm font-medium",
                isFormValid() 
                  ? "bg-[#2962FF] text-white hover:bg-[#1d4ed8]" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {!termsAccepted ? 'Accept vault protection to continue' : 
               otherPartyEmail === user?.email ? 'Cannot transact with yourself' :
               'Create a Vault'}
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
                Creating your secure vault...
              </p>
              <p className="text-xs text-blue-700 mt-1">
                The transaction vault will be deployed when funded
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
              <h3 className="text-base font-medium text-gray-900 mb-1">Vault Created</h3>
              <p className="text-sm text-gray-600">
                {otherPartyEmail} has been notified
              </p>
            </div>

            {/* What happens next */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">What happens next:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-medium">2</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {otherPartyEmail} accepts the transaction terms
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-medium">3</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {role === 'payer' ? 'You' : 'They'} fund the transaction vault
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-medium">4</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Work is delivered with funds secured in vault
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-medium">5</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Funds released instantly from vault upon approval
                  </p>
                </div>
              </div>
            </div>

            {/* Shareable Link */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-600">Your transaction link</label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/${escrowData.premiumLink}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${escrowData.premiumLink}`);
                    }}
                    className="px-4 py-2 bg-[#2962FF] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (onEscrowCreated) onEscrowCreated(escrowData.escrowId);
                  onClose();
                }}
                className="flex-1 py-2 bg-[#2962FF] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8]"
              >
                View Vault Status
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Create Another
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}