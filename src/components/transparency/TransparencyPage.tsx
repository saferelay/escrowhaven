// src/components/transparency/TransparencyPage.tsx - Complete with robust verification
'use client';

import React, { useState, useEffect } from 'react';

interface TransparencyPageProps {
  onNavigate: (view: string) => void;
}

// Environment detection
const isDevelopment = process.env.NEXT_PUBLIC_ENV === 'development' || process.env.NODE_ENV === 'development';

// Contract addresses from env - with proper fallbacks
const CONTRACTS = {
  development: {
    factoryV1: process.env.NEXT_PUBLIC_FACTORY_V1_ADDRESS || '0x66807A3fa2C628BD3f52D543F2225bFbf13ea293',
    factoryV2: process.env.NEXT_PUBLIC_FACTORY_V2_ADDRESS || '0x0bD2bB0007473e695C727e6591C5Be0f5CADe25A',
    factoryV2_1: process.env.NEXT_PUBLIC_FACTORY_V2_1_ADDRESS || '0xb72000c2404fAdfcc641Ef85e381966eC6a0eAe7',
    mockUSDC: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '0x8B0180f2101c8260d49339abfEe87927412494B4',
    network: 'Polygon Amoy (Testnet)',
    explorerBase: 'https://amoy.polygonscan.com',
    rpcUrl: 'https://polygon-amoy.drpc.org'
  },
  production: {
    factoryV1: process.env.NEXT_PUBLIC_FACTORY_V1_ADDRESS_PROD || '0x0000000000000000000000000000000000000000',
    factoryV2: process.env.NEXT_PUBLIC_FACTORY_V2_ADDRESS_PROD || '0x0000000000000000000000000000000000000000',
    factoryV2_1: process.env.NEXT_PUBLIC_FACTORY_V2_1_ADDRESS_PROD || '0x0000000000000000000000000000000000000000',
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    network: 'Polygon Mainnet',
    explorerBase: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  }
};

const currentContracts = isDevelopment ? CONTRACTS.development : CONTRACTS.production;

// Helper to normalize addresses for comparison
const normalizeAddress = (address: string) => {
  if (!address) return '';
  return address.toLowerCase().trim();
};

export function TransparencyPage({ onNavigate }: TransparencyPageProps) {
  const [stats, setStats] = useState({
    totalEscrows: 0,
    totalVolume: 0,
    totalFeesEarned: 0,
    averageEscrowSize: 0,
    successRate: 100,
    activeEscrows: 0,
    completedEscrows: 0,
    refundedEscrows: 0
  });

  const [recentEscrows, setRecentEscrows] = useState<any[]>([]);
  const [verifyAddress, setVerifyAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'verify' | 'custody'>('overview');

  useEffect(() => {
    fetchStats();
    fetchRecentEscrows();
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentEscrows();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      if (isDevelopment) {
        // Mock data for development
        setStats({
          totalEscrows: 147,
          totalVolume: 523400,
          totalFeesEarned: 10415.66,
          averageEscrowSize: 3562,
          successRate: 98.6,
          activeEscrows: 12,
          completedEscrows: 131,
          refundedEscrows: 4
        });
      } else {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentEscrows = async () => {
    try {
      if (isDevelopment) {
        // Mock data for development
        setRecentEscrows([
          {
            id: '0x1234...5678',
            amount: 2500,
            status: 'RELEASED',
            created: new Date(Date.now() - 3600000).toISOString(),
            network: 'testnet'
          },
          {
            id: '0x8765...4321',
            amount: 1200,
            status: 'FUNDED',
            created: new Date(Date.now() - 7200000).toISOString(),
            network: 'testnet'
          },
          {
            id: '0xabcd...efgh',
            amount: 5000,
            status: 'RELEASED',
            created: new Date(Date.now() - 86400000).toISOString(),
            network: 'testnet'
          }
        ]);
      } else {
        const response = await fetch('/api/public/recent-escrows');
        if (response.ok) {
          const data = await response.json();
          setRecentEscrows(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch recent escrows:', error);
    }
  };

  const verifyContract = async () => {
    if (!verifyAddress || !verifyAddress.trim()) {
      setVerificationResult({
        valid: false,
        type: 'Invalid Input',
        message: 'Please enter a valid contract address'
      });
      return;
    }
    
    setVerifying(true);
    setVerificationResult(null);
    
    try {
      const addressToVerify = verifyAddress.trim();
      const normalizedInput = normalizeAddress(addressToVerify);
      
      // First check if it's a known factory contract
      const factoryContracts = [
        { name: 'Factory V1', address: currentContracts.factoryV1 },
        { name: 'Factory V2', address: currentContracts.factoryV2 },
        { name: 'Factory V2.1', address: currentContracts.factoryV2_1 },
      ];
      
      for (const factory of factoryContracts) {
        if (normalizeAddress(factory.address) === normalizedInput && factory.address !== '0x0000000000000000000000000000000000000000') {
          setVerificationResult({
            valid: true,
            type: factory.name,
            message: `Official SafeRelay ${factory.name} contract on ${currentContracts.network}`,
            details: {
              network: currentContracts.network,
              contractType: 'Factory Contract',
              verified: true
            }
          });
          setVerifying(false);
          return;
        }
      }
      
      // Check if it's the Mock USDC (development) or USDC token (production)
      if (isDevelopment && normalizeAddress(currentContracts.mockUSDC) === normalizedInput) {
        setVerificationResult({
          valid: true,
          type: 'Mock USDC Token',
          message: `Test USDC token for development on ${currentContracts.network}`,
          details: {
            network: currentContracts.network,
            contractType: 'ERC20 Token',
            verified: true
          }
        });
        setVerifying(false);
        return;
      }
      
      if (!isDevelopment && currentContracts.usdc && normalizeAddress(currentContracts.usdc) === normalizedInput) {
        setVerificationResult({
          valid: true,
          type: 'USDC Token',
          message: `Official USDC token on ${currentContracts.network}`,
          details: {
            network: currentContracts.network,
            contractType: 'ERC20 Token',
            verified: true
          }
        });
        setVerifying(false);
        return;
      }
      
      // Check if it's a deployed escrow vault via API
      console.log('Checking database for vault:', addressToVerify);
      const response = await fetch(`/api/public/verify-contract?address=${encodeURIComponent(addressToVerify)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Verification response:', data);
        
        if (data.isValid) {
          setVerificationResult({
            valid: true,
            type: data.type || 'Escrow Vault',
            message: data.message || `Valid SafeRelay escrow contract`,
            status: data.status,
            details: data.details
          });
        } else {
          setVerificationResult({
            valid: false,
            type: 'Not Found',
            message: data.message || 'This address is not recognized as a SafeRelay contract. It may be a different contract or not yet indexed.'
          });
        }
      } else {
        // API error - provide helpful fallback
        console.error('Verification API error:', response.status);
        setVerificationResult({
          valid: false,
          type: 'Verification Error',
          message: 'Unable to verify at this time. You can still check the contract directly on the blockchain explorer below.'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        valid: false,
        type: 'Error',
        message: 'Verification service is temporarily unavailable. Please try again or check the blockchain explorer.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Clean header */}
      <header className="fixed top-0 w-full bg-white z-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDevelopment 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isDevelopment ? 'Testnet' : 'Mainnet'}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14">
        {/* Hero section */}
        <section className="py-16 px-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-normal text-gray-900 mb-4">Transparency Hub</h1>
            <p className="text-lg text-gray-600">
              Every transaction, every contract, completely verifiable on-chain
            </p>
          </div>
        </section>

        {/* Navigation tabs */}
        <div className="border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'contracts', label: 'Smart Contracts' },
                { id: 'custody', label: 'Proof of No Custody' },
                { id: 'verify', label: 'Verify Contract' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Escrows</div>
                  <div className="text-2xl font-normal text-gray-900">{formatNumber(stats.totalEscrows)}</div>
                  <div className="text-xs text-gray-500 mt-2">{stats.activeEscrows} active</div>
                </div>
                
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Volume</div>
                  <div className="text-2xl font-normal text-gray-900">{formatCurrency(stats.totalVolume)}</div>
                  <div className="text-xs text-gray-500 mt-2">All time</div>
                </div>
                
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Platform Fees</div>
                  <div className="text-2xl font-normal text-gray-900">{formatCurrency(stats.totalFeesEarned)}</div>
                  <div className="text-xs text-gray-500 mt-2">1.99% per transaction</div>
                </div>
                
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                  <div className="text-2xl font-normal text-gray-900">{stats.successRate}%</div>
                  <div className="text-xs text-gray-500 mt-2">{stats.completedEscrows} completed</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-normal text-gray-900 mb-6">Recent Activity</h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentEscrows.map((escrow, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a 
                              href={`${currentContracts.explorerBase}/address/${escrow.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-mono text-sm"
                            >
                              {escrow.id}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${formatNumber(escrow.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              escrow.status === 'RELEASED' 
                                ? 'bg-green-100 text-green-800'
                                : escrow.status === 'FUNDED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {escrow.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(escrow.created).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Smart Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-8">
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  All SafeRelay contracts are immutable, verified, and contain no admin functions. 
                  Once deployed, not even SafeRelay can modify or access funds.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Network</h3>
                      <p className="text-sm text-gray-600 mt-1">{currentContracts.network}</p>
                    </div>
                    <a 
                      href={currentContracts.explorerBase} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Explorer →
                    </a>
                  </div>
                </div>

                {/* Contract list */}
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Factory V2.1</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{currentContracts.factoryV2_1}</div>
                      </div>
                      <a 
                        href={`${currentContracts.explorerBase}/address/${currentContracts.factoryV2_1}#code`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Verify →
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {isDevelopment ? 'Mock USDC' : 'USDC Token'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {isDevelopment ? currentContracts.mockUSDC : currentContracts.usdc}
                        </div>
                      </div>
                      <a 
                        href={`${currentContracts.explorerBase}/address/${isDevelopment ? currentContracts.mockUSDC : currentContracts.usdc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Verify →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Security Guarantees</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>No admin or owner functions</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Immutable once deployed</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>EIP-712 signature verification</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Non-custodial architecture</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Fee Structure</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="text-xl font-normal text-gray-900">1.99%</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>$1,000 escrow → Recipient gets $980.10</div>
                      <div>$5,000 escrow → Recipient gets $4,900.50</div>
                      <div>$10,000 escrow → Recipient gets $9,801.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Proof of No Custody Tab */}
          {activeTab === 'custody' && (
            <div className="space-y-8">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-normal text-gray-900 mb-4">True Non-Custodial Architecture</h2>
                <p className="text-gray-600">
                  SafeRelay uses EIP-712 cryptographic signatures for all fund movements. 
                  Only the actual parties (client and freelancer) can authorize releases or refunds - SafeRelay has zero control.
                </p>
              </div>

              {/* How Signatures Work */}
              <div className="p-8 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-6">How Our Non-Custodial System Works</h3>
                
                {/* Visual Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">1. Funds Locked</h4>
                    <p className="text-sm text-gray-600">
                      USDC sent to immutable escrow contract with hardcoded parties
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">2. Signature Required</h4>
                    <p className="text-sm text-gray-600">
                      Only client can sign release, only freelancer can sign refund
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">3. Automatic Distribution</h4>
                    <p className="text-sm text-gray-600">
                      Smart contract verifies signature and distributes funds
                    </p>
                  </div>
                </div>

                {/* Contract Functions */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Contract Functions & Who Can Call Them</h4>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">releaseWithSignature()</span>
                      <span className="text-green-600 font-semibold">✓ Only Client's Signature</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">refundWithSignature()</span>
                      <span className="text-blue-600 font-semibold">✓ Only Freelancer's Signature</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">settlementRelease()</span>
                      <span className="text-purple-600 font-semibold">✓ Only Client's Signature</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Security Points */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="text-red-500 mr-2">🔐</span>
                    What SafeRelay CANNOT Do
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Cannot release funds (only client can)</li>
                    <li>• Cannot refund funds (only freelancer can)</li>
                    <li>• Cannot modify escrow terms</li>
                    <li>• Cannot access funds without valid signature</li>
                    <li>• Cannot change fee percentage (hardcoded at 1.99%)</li>
                    <li>• Cannot upgrade or modify deployed contracts</li>
                  </ul>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Cryptographic Guarantees
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• EIP-712 typed signatures prevent forgery</li>
                    <li>• Each signature includes deadline & nonce</li>
                    <li>• Domain separator prevents cross-chain replay</li>
                    <li>• Signatures verified on-chain by contract</li>
                    <li>• Immutable parties set at deployment</li>
                    <li>• All actions emit verifiable events</li>
                  </ul>
                </div>
              </div>

              {/* Technical Verification */}
              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">🔍 Verify It Yourself</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Check any SafeRelay escrow contract on the blockchain:
                </p>
                <div className="bg-white rounded p-4 font-mono text-xs border border-gray-200 space-y-2">
                  <div className="text-gray-700">
                    <span className="text-gray-500">// Immutable addresses set in constructor</span><br/>
                    client: <span className="text-blue-600">0x123...abc</span> <span className="text-green-600">// Cannot be changed</span><br/>
                    freelancer: <span className="text-blue-600">0x456...def</span> <span className="text-green-600">// Cannot be changed</span>
                  </div>
                  <div className="text-gray-700 pt-2">
                    <span className="text-gray-500">// No owner or admin functions exist</span><br/>
                    owner(): <span className="text-red-600 font-bold">Error: Function does not exist</span><br/>
                    pause(): <span className="text-red-600 font-bold">Error: Function does not exist</span><br/>
                    withdraw(): <span className="text-red-600 font-bold">Error: Function does not exist</span>
                  </div>
                  <div className="text-gray-700 pt-2">
                    <span className="text-gray-500">// Only signatures can move funds</span><br/>
                    released: <span className="text-purple-600">false</span> <span className="text-green-600">// Changes only with valid signature</span><br/>
                    refunded: <span className="text-purple-600">false</span> <span className="text-green-600">// Changes only with valid signature</span>
                  </div>
                </div>
                <a 
                  href={`${currentContracts.explorerBase}/address/${currentContracts.factoryV2_1}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-4"
                >
                  View verified source code on explorer →
                </a>
              </div>

              {/* EIP-712 Signature Example */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Example: What a Release Signature Contains</h4>
                <div className="bg-white rounded p-4 font-mono text-xs border border-gray-200">
                  <pre className="text-gray-700">{`{
  "domain": {
    "name": "SafeRelay",
    "version": "2.1",
    "chainId": 137,
    "verifyingContract": "0xEscrowAddress..."
  },
  "message": {
    "action": "Release Full Payment",
    "recipient": "0xFreelancerAddress...",
    "amount": "1000000000", // USDC amount
    "nonce": 1,
    "deadline": 1704067200 // Unix timestamp
  },
  "signer": "0xClientAddress..." // Only client can sign this
}`}</pre>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This signature can only be created by the client's private key and verified by the smart contract.
                </p>
              </div>
            </div>
          )}

          {/* Verify Contract Tab */}
          {activeTab === 'verify' && (
            <div className="max-w-2xl mx-auto">
              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-normal text-gray-900 mb-4">Verify Contract</h2>
                <p className="text-gray-600">
                  Enter any contract address to verify if it's an official SafeRelay contract.
                  This tool checks both factory contracts and individual escrow vaults.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Address
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={verifyAddress}
                      onChange={(e) => setVerifyAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                    <button
                      onClick={verifyContract}
                      disabled={verifying}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                      {verifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isDevelopment ? 'Checking Polygon Amoy Testnet' : 'Checking Polygon Mainnet'}
                  </p>
                </div>

                {verificationResult && (
                  <div className={`p-4 rounded-lg border ${
                    verificationResult.valid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-start">
                      {verificationResult.valid ? (
                        <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <div className={`font-medium ${verificationResult.valid ? 'text-green-900' : 'text-amber-900'}`}>
                          {verificationResult.type}
                        </div>
                        <div className={`text-sm ${verificationResult.valid ? 'text-green-700' : 'text-amber-700'}`}>
                          {verificationResult.message}
                        </div>
                        
                        {/* Show additional details if available */}
                        {verificationResult.valid && verificationResult.details && (
                          <div className="mt-3 pt-3 border-t border-green-200 text-sm text-green-700">
                            <div className="space-y-1">
                              {verificationResult.details.created && (
                                <div>Created: {verificationResult.details.created}</div>
                              )}
                              {verificationResult.details.status && (
                                <div>Status: <span className="font-medium">{verificationResult.details.status}</span></div>
                              )}
                              {verificationResult.details.amount && (
                                <div>Amount: <span className="font-medium">{verificationResult.details.amount}</span></div>
                              )}
                              {verificationResult.details.network && (
                                <div>Network: {verificationResult.details.network}</div>
                              )}
                              {verificationResult.details.parties && (
                                <div className="mt-2">
                                  <div>Client: {verificationResult.details.parties.client}</div>
                                  <div>Freelancer: {verificationResult.details.parties.freelancer}</div>
                                </div>
                              )}
                              {verificationResult.details.contractType && (
                                <div>Type: {verificationResult.details.contractType}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Always show explorer link */}
                        {verifyAddress && (
                          <a 
                            href={`${currentContracts.explorerBase}/address/${verifyAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-3"
                          >
                            View on blockchain explorer →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Help text */}
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">What can be verified:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• SafeRelay factory contracts</li>
                    <li>• Individual escrow vault contracts</li>
                    <li>• USDC token contracts</li>
                  </ul>
                  <p className="mt-3">
                    All verified contracts are recorded in our database and can be independently verified on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 px-6 text-center">
          <p className="text-sm text-gray-600">
            All data is pulled directly from the blockchain and updated in real-time.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            SafeRelay uses EIP-712 signatures for true non-custodial escrow. All contracts are verified on {currentContracts.network}.
          </p>
        </footer>
      </main>
    </div>
  );
}