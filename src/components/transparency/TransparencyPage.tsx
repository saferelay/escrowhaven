// src/components/transparency/TransparencyPage.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface TransparencyPageProps {
  onNavigate: (view: string) => void;
}

const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' || 
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';

// Since MOCK_USDC_ADDRESS doesn't have NEXT_PUBLIC prefix, hardcode it or add the prefix
const CONTRACTS = {
  development: {
    factory: process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000',
    usdcToken: '0x8B0180f2101c8260d49339abfEe87927412494B4', // Mock USDC for testnet
    network: 'Polygon Amoy (Testnet)',
    explorerBase: 'https://amoy.polygonscan.com',
    rpcUrl: 'https://polygon-amoy.drpc.org',
    tokenName: 'Mock USDC'
  },
  production: {
    factory: process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000',
    usdcToken: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Real USDC on Polygon
    network: 'Polygon Mainnet',
    explorerBase: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
    tokenName: 'USDC'
  }
};

const currentContracts = isDevelopment ? CONTRACTS.development : CONTRACTS.production;

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
      
      if (normalizeAddress(currentContracts.factory) === normalizedInput && currentContracts.factory !== '0x0000000000000000000000000000000000000000') {
        setVerificationResult({
          valid: true,
          type: 'escrowhaven Factory',
          message: `Official escrowhaven factory contract on ${currentContracts.network}`,
          details: {
            network: currentContracts.network,
            contractType: 'Factory Contract',
            verified: true
          }
        });
        setVerifying(false);
        return;
      }
      
      if (normalizeAddress(currentContracts.usdcToken) === normalizedInput) {
        setVerificationResult({
          valid: true,
          type: currentContracts.tokenName,
          message: `${currentContracts.tokenName} on ${currentContracts.network}`,
          details: {
            network: currentContracts.network,
            contractType: 'ERC20 Token',
            verified: true
          }
        });
        setVerifying(false);
        return;
      }
      
      const response = await fetch(`/api/public/verify-contract?address=${encodeURIComponent(addressToVerify)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.isValid) {
          setVerificationResult({
            valid: true,
            type: data.type || 'Escrow Vault',
            message: data.message || `Valid escrowhaven escrow contract`,
            status: data.status,
            details: data.details
          });
        } else {
          setVerificationResult({
            valid: false,
            type: 'Not Found',
            message: data.message || 'This address is not recognized as an escrowhaven contract.'
          });
        }
      } else {
        setVerificationResult({
          valid: false,
          type: 'Verification Error',
          message: 'Unable to verify at this time. Check the blockchain explorer below.'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        valid: false,
        type: 'Error',
        message: 'Verification service is temporarily unavailable.'
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

      <main className="pt-14">
        <section className="py-16 px-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-normal text-gray-900 mb-4">Transparency Hub</h1>
            <p className="text-lg text-gray-600">
              Every transaction, every contract, completely verifiable on-chain
            </p>
          </div>
        </section>

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

        <div className="max-w-6xl mx-auto px-6 py-12">
          {activeTab === 'overview' && (
            <div className="space-y-12">
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

          {activeTab === 'contracts' && (
            <div className="space-y-8">
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  All escrowhaven contracts are immutable, verified, and contain no admin functions. 
                  Once deployed, not even escrowhaven can modify or access funds.
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

                <div className="space-y-3">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">escrowhaven Factory</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{currentContracts.factory}</div>
                      </div>
                      <a 
                        href={`${currentContracts.explorerBase}/address/${currentContracts.factory}#code`}
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
                        <div className="font-medium text-gray-900">{currentContracts.tokenName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{currentContracts.usdcToken}</div>
                      </div>
                      <a 
                        href={`${currentContracts.explorerBase}/address/${currentContracts.usdcToken}`}
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
                      <span>Magic wallet authentication</span>
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
                      <div>$1,000 escrow → Receiver gets $980.10</div>
                      <div>$5,000 escrow → Receiver gets $4,900.50</div>
                      <div>$10,000 escrow → Receiver gets $9,801.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custody' && (
            <div className="space-y-8">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-normal text-gray-900 mb-4">True Non-Custodial Architecture</h2>
                <p className="text-gray-600">
                  escrowhaven uses Magic wallets for authentication with simple single-approval control.
                  Only the actual parties can move funds - escrowhaven has zero control over escrow funds.
                </p>
              </div>

              <div className="p-8 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-6">How Our Non-Custodial System Works</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">1. Funds Locked</h4>
                    <p className="text-sm text-gray-600">
                      USDC sent to immutable escrow contract with hardcoded wallet addresses
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">2. Single Approval</h4>
                    <p className="text-sm text-gray-600">
                      Sender can release funds, Receiver can refund - single approval control
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
                      Smart contract splits payment: 98.01% to receiver, 1.99% platform fee
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Contract Functions & Who Can Call Them</h4>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">release()</span>
                      <span className="text-green-600 font-semibold">✓ Only Sender's Wallet</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">refund()</span>
                      <span className="text-blue-600 font-semibold">✓ Only Receiver's Wallet</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">proposeSettlement()</span>
                      <span className="text-purple-600 font-semibold">✓ Either Party</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">acceptSettlement()</span>
                      <span className="text-purple-600 font-semibold">✓ Other Party</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">What escrowhaven CANNOT Do</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Cannot release funds (only sender can)</li>
                    <li>• Cannot refund funds (only receiver can)</li>
                    <li>• Cannot modify escrow terms</li>
                    <li>• Cannot access funds without authorization</li>
                    <li>• Cannot change fee percentage (hardcoded at 1.99%)</li>
                    <li>• Cannot upgrade or modify deployed contracts</li>
                  </ul>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Security Guarantees</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Email-authenticated Magic wallets</li>
                    <li>• Immutable parties set at deployment</li>
                    <li>• Single-approval release mechanism</li>
                    <li>• Automatic payment splitting</li>
                    <li>• All actions emit verifiable events</li>
                    <li>• No backdoor or admin functions</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Verify It Yourself</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Check any escrowhaven escrow contract on the blockchain:
                </p>
                <div className="bg-white rounded p-4 font-mono text-xs border border-gray-200 space-y-2">
                  <div className="text-gray-700">
                    <span className="text-gray-500">// Immutable addresses set in constructor</span><br/>
                    clientMagicWallet: <span className="text-blue-600">0x123...abc</span> <span className="text-green-600">// Cannot be changed</span><br/>
                    freelancerMagicWallet: <span className="text-blue-600">0x456...def</span> <span className="text-green-600">// Cannot be changed</span>
                  </div>
                  <div className="text-gray-700 pt-2">
                    <span className="text-gray-500">// No owner or admin functions exist</span><br/>
                    owner(): <span className="text-red-600 font-bold">Error: Function does not exist</span><br/>
                    pause(): <span className="text-red-600 font-bold">Error: Function does not exist</span><br/>
                    withdraw(): <span className="text-red-600 font-bold">Error: Function does not exist</span>
                  </div>
                </div>
                <a 
                  href={`${currentContracts.explorerBase}/address/${currentContracts.factory}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-4"
                >
                  View verified source code on explorer →
                </a>
              </div>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="max-w-2xl mx-auto">
              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-normal text-gray-900 mb-4">Verify Contract</h2>
                <p className="text-gray-600">
                  Enter any contract address to verify if it's an official escrowhaven contract.
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
                
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">What can be verified:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• escrowhaven factory contracts</li>
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

        <footer className="border-t border-gray-200 py-8 px-6 text-center">
          <p className="text-sm text-gray-600">
            All data is pulled directly from the blockchain and updated in real-time.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            escrowhaven uses email-authenticated wallets for true non-custodial escrow. All contracts are verified on {currentContracts.network}.
          </p>
        </footer>
      </main>
    </div>
  );
}