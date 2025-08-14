'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { SettlementActions } from '@/components/SettlementActions';
import { statusConfig } from '@/lib/design-system';
import { Icon, Icons } from '@/components/icons';
import { getEnvConfig } from '@/lib/environment';
import { generateTransakOneParams } from '@/lib/transak-one';
import { MagicApprovalFlow } from '@/components/MagicApprovalFlow';
import { useV2Monitoring } from './hooks/useV2Monitoring';

interface SettlementProposal {
  id: string;
  escrow_id: string;
  proposed_by: string;
  proposed_by_email: string;
  freelancer_amount_cents: number;
  client_refund_cents: number;
  reason?: string;
  status: string;
  accepted_by?: string;
  accepted_by_email?: string;
  accepted_at?: string;
  created_at: string;
}

interface Escrow {
  id: string;
  amount_cents: number;
  amount_remaining_cents?: number;
  client_email: string;
  freelancer_email: string;
  status: string;
  created_at: string;
  vault_address?: string;
  client_approved?: boolean;
  freelancer_approved?: boolean;
  settlement_proposed_by?: string;
  settlement_amount_cents?: number;
  settlement_reason?: string;
  settlement_accepted_by?: string;
  description?: string;
  funded_at?: string;
  released_at?: string;
  declined_at?: string;
  declined_reason?: string;
  declined_by?: string;
  initiator_email?: string;
  initiator_role?: string;
  is_test_mode?: boolean;
  recipient_wallet_address?: string;
  contract_version?: string;
  client_released?: boolean;
  freelancer_refunded?: boolean;
  client_wallet_address?: string;
  freelancer_wallet_address?: string;
  active_settlement_id?: string;
  active_settlement?: SettlementProposal;
  total_settled_cents?: number;
  settlement_count?: number;
}

export default function EscrowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const { isMonitoring } = useV2Monitoring(escrow);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showTransakWidget, setShowTransakWidget] = useState(false);
  const [transakUrl, setTransakUrl] = useState('');

  const role = user?.email === escrow?.client_email ? 'payer' : 
               user?.email === escrow?.freelancer_email ? 'recipient' : 
               null;

  // For INITIATED status, determine who initiated and who needs to accept
  const isInitiator = escrow?.status === 'INITIATED' && 
    user?.email === escrow?.initiator_email;

  const needsToAccept = escrow?.status === 'INITIATED' && 
    !isInitiator && (role === 'payer' || role === 'recipient');

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirectTo=/escrow/${id}`);
      return;
    }
    fetchEscrow();

    const channel = supabase
      .channel(`escrow-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'escrows', filter: `id=eq.${id}` },
        () => fetchEscrow()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'settlement_proposals', filter: `escrow_id=eq.${id}` },
        () => fetchEscrow()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, router, id]);

  const fetchEscrow = async () => {
    try {
      const { data, error } = await supabase
        .from('escrows')
        .select(`
          *,
          active_settlement:settlement_proposals!active_settlement_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Process the data to maintain backward compatibility
      let processedData = { ...data };
      
      // If there's an active settlement proposal, merge its data
      if (data.active_settlement) {
        processedData = {
          ...processedData,
          settlement_proposed_by: data.active_settlement.proposed_by,
          settlement_amount_cents: data.active_settlement.freelancer_amount_cents,
          settlement_reason: data.active_settlement.reason,
          settlement_accepted_by: data.active_settlement.accepted_by
        };
      }
      
      setEscrow(processedData);
    } catch (error) {
      console.error('Error fetching escrow:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (escrow) {
      console.log('=== Escrow Page State ===');
      console.log('ID:', escrow.id);
      console.log('Status:', escrow.status);
      console.log('Contract Version:', escrow.contract_version);
      console.log('Vault Address:', escrow.vault_address);
      console.log('User Email:', user?.email);
      console.log('Role:', role);
      console.log('Active Settlement:', escrow.active_settlement);
      console.log('Total Settled:', escrow.total_settled_cents);
      console.log('========================');
    }
  }, [escrow, user, role]);
  
  const handleAccept = async () => {
    setProcessing(true);
    try {
      console.log('Accept clicked by:', user?.email, 'with role:', role);
      
      // For INITIATED status, we just need to update status to ACCEPTED
      const updateData: any = {
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString()
      };
      
      // If recipient is accepting, we need their wallet address
      if (role === 'recipient') {
        console.log('Fetching wallet for recipient:', user?.email);
        
        const { data: walletData, error: walletError } = await supabase
          .from('user_wallets')
          .select('wallet_address')
          .eq('email', user?.email)
          .single();
        
        console.log('Wallet query result:', { walletData, walletError });
        
        if (walletError) {
          console.error('Wallet fetch error:', walletError);
          alert('Error fetching wallet. Please ensure you have a connected wallet.');
          const returnUrl = `/escrow/${id}`;
          router.push(`/connect-wallet?redirectTo=${encodeURIComponent(returnUrl)}`);
          return;
        }
        
        if (!walletData?.wallet_address) {
          alert('You need to connect your wallet first to receive payments.');
          const returnUrl = `/escrow/${id}`;
          router.push(`/connect-wallet?redirectTo=${encodeURIComponent(returnUrl)}`);
          return;
        }
        
        // Set the recipient wallet address
        updateData.recipient_wallet_address = walletData.wallet_address;
        updateData.freelancer_wallet_address = walletData.wallet_address;
        console.log('Setting recipient wallet:', walletData.wallet_address);
      }
  
      console.log('Updating escrow with:', updateData);
  
      const { data, error } = await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
  
      if (error) {
        console.error('Update error details:', error);
        throw error;
      }
  
      console.log('Update successful:', data);
      
      await fetchEscrow();
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
        .eq('id', id);

      if (error) throw error;
      
      setShowDeclineForm(false);
      await fetchEscrow();
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
      
      // Check if we're in test mode (from environment or escrow)
      const isTestMode = envConfig.isTestMode || escrow?.is_test_mode;
      
      if (isTestMode) {
        // Always prepare funding first to deploy the vault
        const prepareResponse = await fetch(escrow.contract_version === 'v2.1' ? '/api/escrow/prepare-funding-v2-1' : '/api/escrow/prepare-funding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              escrowId: escrow?.id,
              useTransakOne: false, // In test mode, we deploy manually
              contractVersion: 'v2.1'
            })
          });
      
        if (!prepareResponse.ok) {
            const errorData = await prepareResponse.json();
            console.error('Prepare funding failed:', {
              status: prepareResponse.status,
              error: errorData,
              escrowId: escrow?.id,
              isTestMode: isTestMode
            });
            throw new Error(errorData.error || errorData.message || 'Failed to prepare funding');
          }
      
        const { vaultAddress, recipientWallet } = await prepareResponse.json();
        
        // Update escrow with vault address if not already set
        if (!escrow?.vault_address && vaultAddress) {
          setEscrow(prev => ({ ...prev!, vault_address: vaultAddress }));
        }
        
        const mockUsdcAddress = envConfig.mockUsdcAddress || envConfig.usdcAddress;
        
        const vaultInfo = `TEST MODE - Vault Deployed Successfully!
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      Network: ${envConfig.network}
      Chain ID: ${envConfig.chainId}
      
      Vault Address:
      ${vaultAddress}
      
      MockUSDC Token:
      ${mockUsdcAddress}
      
      Amount to Send: ${escrow.amount_cents / 100} USDC
      
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      To fund this escrow:
      1. Open MetaMask and switch to ${envConfig.network}
      2. Add MockUSDC token if needed (address above)
      3. Send exactly ${escrow.amount_cents / 100} MockUSDC to the vault
      4. The system will detect funding automatically`;
        
        if (confirm(vaultInfo + '\n\nClick OK to copy vault address to clipboard')) {
          if (navigator.clipboard && vaultAddress) {
            try {
              await navigator.clipboard.writeText(vaultAddress);
              alert('Vault address copied to clipboard!');
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          }
        }
        
        // DO NOT update status - let the real funding be detected
        await fetchEscrow();
        return;
      }

      // For production, prepare funding and open Transak
      const prepareResponse = await fetch(escrow.contract_version === 'v2.1' ? '/api/escrow/prepare-funding-v2-1' : '/api/escrow/prepare-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escrowId: escrow?.id,
          useTransakOne: true,
          contractVersion: 'v2.1'
        })
      });

      if (!prepareResponse.ok) {
        const errorData = await prepareResponse.json();
        console.error('Prepare funding failed:', {
          status: prepareResponse.status,
          error: errorData,
          escrowId: escrow?.id,
          isTestMode: isTestMode
        });
        throw new Error(errorData.error || errorData.message || 'Failed to prepare funding');
      }

      const { vaultAddress, recipientWallet } = await prepareResponse.json();
      
      // Update escrow with vault address if not already set
      if (!escrow?.vault_address && vaultAddress) {
        setEscrow(prev => ({ ...prev!, vault_address: vaultAddress }));
      }
      
      // Generate Transak params
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

      // Build Transak URL
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

  const handleSettlementAction = async (action: any) => {
    setProcessing(true);
    try {
      await fetchEscrow();
    } catch (error) {
      console.error('Settlement action failed:', error);
      alert('Action failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate amounts including previous settlements
  const calculateAmounts = () => {
    if (!escrow) return { original: 0, settled: 0, remaining: 0 };
    
    const original = escrow.amount_cents / 100;
    const settled = (escrow.total_settled_cents || 0) / 100;
    const remaining = original - settled;
    
    return { original, settled, remaining };
  };

  const amounts = calculateAmounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!escrow || !role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Not Found</h1>
          <p className="text-gray-600 mb-4">This payment doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[escrow.status as keyof typeof statusConfig] || statusConfig.INITIATED;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Icon name="back" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="text-sm text-gray-500">
              Payment #{escrow.id.slice(0, 8)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                ${status.color === 'success' ? 'bg-green-100' : ''}
                ${status.color === 'warning' ? 'bg-amber-100' : ''}
                ${status.color === 'primary' ? 'bg-blue-100' : ''}
                ${status.color === 'error' ? 'bg-red-100' : ''}
                ${status.color === 'gray' ? 'bg-gray-100' : ''}
              `}>
                <span className={`
                  ${status.color === 'success' ? 'text-green-600' : ''}
                  ${status.color === 'warning' ? 'text-amber-600' : ''}
                  ${status.color === 'primary' ? 'text-blue-600' : ''}
                  ${status.color === 'error' ? 'text-red-600' : ''}
                  ${status.color === 'gray' ? 'text-gray-600' : ''}
                `}>
                  <Icon name={status.icon as keyof typeof Icons} className="w-8 h-8" />
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ${amounts.original.toFixed(2)} Payment
                </h1>
                <p className={`text-lg font-medium
                  ${status.color === 'success' ? 'text-green-700' : ''}
                  ${status.color === 'warning' ? 'text-amber-700' : ''}
                  ${status.color === 'primary' ? 'text-blue-700' : ''}
                  ${status.color === 'error' ? 'text-red-700' : ''}
                  ${status.color === 'gray' ? 'text-gray-700' : ''}
                `}>
                  {status.label}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium
              ${role === 'payer' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}
            `}>
              You're {role === 'payer' ? 'paying' : 'receiving'}
            </div>
          </div>

          {/* Settlement Summary - Show if there have been settlements */}
          {escrow.settlement_count && escrow.settlement_count > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Icon name="info" className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    Partial Settlements: {escrow.settlement_count}
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-amber-800">
                    <div className="flex justify-between">
                      <span>Original Amount:</span>
                      <span className="font-mono">${amounts.original.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Previously Settled:</span>
                      <span className="font-mono">-${amounts.settled.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Remaining in Escrow:</span>
                      <span className="font-mono">${amounts.remaining.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {/* Created */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center relative z-10">
                  <Icon name="check" className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Payment Created</p>
                  <p className="text-sm text-gray-600">{new Date(escrow.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Accepted/Declined */}
              {escrow.status !== 'INITIATED' && (
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10
                    ${escrow.status === 'DECLINED' ? 'bg-red-100' : 'bg-green-100'}
                  `}>
                    {escrow.status === 'DECLINED' ? (
                      <Icon name="x" className="w-6 h-6 text-red-600" />
                    ) : (
                      <Icon name="check" className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {escrow.status === 'DECLINED' ? 'Payment Declined' : 'Payment Accepted'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {escrow.status === 'DECLINED' && escrow.declined_reason 
                        ? `Reason: ${escrow.declined_reason}`
                        : 'Both parties agreed to proceed'}
                    </p>
                  </div>
                </div>
              )}

              {/* Funded */}
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10
                  ${['FUNDED', 'RELEASED', 'REFUNDED'].includes(escrow.status) ? 'bg-green-100' : 'bg-gray-100'}
                `}>
                  {['FUNDED', 'RELEASED', 'REFUNDED'].includes(escrow.status) ? (
                    <Icon name="check" className="w-6 h-6 text-green-600" />
                  ) : (
                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Payment Secured</p>
                  <p className="text-sm text-gray-600">
                    {['FUNDED', 'RELEASED', 'REFUNDED'].includes(escrow.status) 
                      ? `Funds locked in escrow${escrow.funded_at ? ' on ' + new Date(escrow.funded_at).toLocaleDateString() : ''}`
                      : 'Waiting for funds'}
                  </p>
                </div>
              </div>

              {/* Released */}
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10
                  ${escrow.status === 'RELEASED' ? 'bg-green-100' : 
                   escrow.status === 'REFUNDED' ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  {escrow.status === 'RELEASED' || escrow.status === 'REFUNDED' ? (
                    <Icon name="check" className={`w-6 h-6 ${
                      escrow.status === 'RELEASED' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  ) : (
                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {escrow.status === 'REFUNDED' ? 'Payment Refunded' : 'Payment Complete'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {escrow.status === 'RELEASED' 
                      ? `Funds delivered${escrow.released_at ? ' on ' + new Date(escrow.released_at).toLocaleDateString() : ''}`
                      : escrow.status === 'REFUNDED'
                      ? `Funds returned to payer`
                      : 'Pending completion'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payer</p>
              <p className="font-medium text-gray-900">{escrow.client_email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Recipient</p>
              <p className="font-medium text-gray-900">{escrow.freelancer_email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Original Amount</p>
              <p className="font-medium text-gray-900">${amounts.original.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Remaining Amount</p>
              <p className="font-medium text-gray-900">${amounts.remaining.toFixed(2)}</p>
            </div>
            {escrow.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="font-medium text-gray-900">{escrow.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Section - Different based on status */}
        {escrow.status === 'INITIATED' && needsToAccept && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              You've Been Invited to a Protected Payment
            </h2>
            <p className="text-gray-600 mb-6">
              {role === 'payer' 
                ? `${escrow.freelancer_email} is requesting a payment of $${amounts.original.toFixed(2)}. Review the details and decide whether to proceed.`
                : `${escrow.client_email} wants to send you a payment of $${amounts.original.toFixed(2)}. Accept to proceed with the protected transaction.`
              }
            </p>
            
            {!showDeclineForm ? (
              <div className="flex gap-4">
                <button
                  onClick={handleAccept}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Icon name="check" />
                  <span>Accept & Continue</span>
                </button>
                <button
                  onClick={() => setShowDeclineForm(true)}
                  disabled={processing}
                  className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 font-medium disabled:opacity-50 transition-colors"
                >
                  Decline
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for declining (required)
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Please explain why you're declining this payment..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDecline}
                    disabled={processing || !declineReason.trim()}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 transition-colors"
                  >
                    Confirm Decline
                  </button>
                  <button
                    onClick={() => {
                      setShowDeclineForm(false);
                      setDeclineReason('');
                    }}
                    disabled={processing}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {escrow.status === 'INITIATED' && isInitiator && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Icon name="clock" className="w-6 h-6 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Waiting for Response</h3>
                <p className="text-gray-700">
                  You've sent a payment invitation to {role === 'payer' ? escrow.freelancer_email : escrow.client_email}.
                  They'll receive an email to review and accept the payment terms.
                </p>
              </div>
            </div>
          </div>
        )}

        {escrow.status === 'ACCEPTED' && role === 'payer' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ready to Fund</h2>
            <p className="text-gray-600 mb-6">
              Both parties have agreed to the payment terms. Add funds to secure the payment in escrow.
            </p>
            <button
              onClick={handleFund}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Icon name="pay" />
              <span>Fund Payment</span>
            </button>
          </div>
        )}

        {escrow.status === 'ACCEPTED' && role === 'recipient' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Icon name="clock" className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Waiting for Payment</h3>
                <p className="text-gray-700">
                  The payer needs to add funds to the escrow. You'll be notified once the payment is secured.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FUNDED Status - Show approval/settlement options */}
        {escrow.status === 'FUNDED' && role && amounts.remaining > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
            <p className="text-gray-600 mb-6">
              {escrow.contract_version === 'v2.1' 
                ? role === 'payer' 
                  ? `$${amounts.remaining.toFixed(2)} is secured in escrow. You can release the full remaining amount or propose a partial release.`
                  : `$${amounts.remaining.toFixed(2)} is secured in escrow. You can refund if needed or propose a partial release.`
                : "The payment is secured. Choose how to proceed:"
              }
            </p>

            <SettlementActions
              escrow={{
                ...escrow,
                // Override amounts to use remaining amounts for settlement calculations
                amount_cents: amounts.remaining * 100,
                amount_remaining_cents: amounts.remaining * 100
              }}
              userRole={role}
              onAction={async (action) => {
                console.log('Settlement action:', action);
                await fetchEscrow();
              }}
            />
          </div>
        )}

        {escrow.status === 'RELEASED' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check" className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Complete!</h3>
            <p className="text-gray-600">
              The payment of ${amounts.original.toFixed(2)} has been successfully released.
            </p>
          </div>
        )}

        {escrow.status === 'REFUNDED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="refund" className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Refunded</h3>
            <p className="text-gray-600">
              The payment of ${amounts.original.toFixed(2)} has been refunded to the payer.
            </p>
          </div>
        )}

        {escrow.status === 'DECLINED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="x" className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Declined</h3>
            <p className="text-gray-600">
              This payment invitation was declined.
              {escrow.declined_reason && (
                <span className="block mt-2 text-sm">
                  Reason: {escrow.declined_reason}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Trust & Security */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
          <Icon name="shield" className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Your payment is protected</p>
            <p className="text-blue-700">
              Funds are secured by smart contracts and can only be released according to the agreement.
              SafeRelay never has access to your money.
            </p>
          </div>
        </div>
      </main>

      {/* Transak Widget Modal */}
      {showTransakWidget && transakUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Complete Your Payment</h3>
              <button
                onClick={() => {
                  setShowTransakWidget(false);
                  setTransakUrl('');
                  setTimeout(() => fetchEscrow(), 2000);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <div className="relative" style={{ height: '650px' }}>
              <iframe
                src={transakUrl}
                className="w-full h-full"
                allow="camera;microphone;payment"
              />
            </div>
            <div className="p-4 bg-gray-50 text-sm text-gray-600">
              <p>Complete your payment with Transak. This page will refresh automatically when done.</p>
            </div>
          </div>
        </div>
      )}

      {/* Test Mode Badge - Only show if environment config says to */}
      {getEnvConfig().showTestBadges && (
        <div className="fixed bottom-4 left-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-40">
          <Icon name="lightning" className="w-5 h-5" />
          <span className="font-medium">{getEnvConfig().displayName} - Test Mode</span>
        </div>
      )}
    </div>
  );
}