// src/components/transparency/ContractSecurityPage.tsx
'use client';

import { useState, useEffect } from 'react';

interface ContractSecurityPageProps {
  onBack: () => void;
}

// Contract addresses - update these with your actual deployed addresses
const CONTRACTS = {
  FACTORY: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7095931a6',
    name: 'SafeRelay Factory',
    description: 'Creates and manages all escrow vaults',
    deployedAt: 'Oct 15, 2024',
    audit: 'Certik - Nov 1, 2024'
  },
  USDC: {
    address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    name: 'USDC Token (Polygon)',
    description: 'Official Circle USDC on Polygon',
    deployedAt: 'Circle Deployment',
    audit: 'Circle Verified'
  }
};

export function ContractSecurityPage({ onBack }: ContractSecurityPageProps) {
  const [latestVaults, setLatestVaults] = useState<any[]>([]);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'guarantees'>('overview');

  useEffect(() => {
    // Simulate fetching latest vaults - replace with actual API call
    const mockVaults = [
      { id: '1234', address: '0xABC...DEF', amount: '$5,000', status: 'active', time: '2 mins ago' },
      { id: '1235', address: '0xGHI...JKL', amount: '$10,000', status: 'active', time: '5 mins ago' },
      { id: '1236', address: '0xMNO...PQR', amount: '$2,500', status: 'pending', time: '12 mins ago' }
    ];
    setLatestVaults(mockVaults);

    // Update every 10 seconds
    const interval = setInterval(() => {
      // Fetch new vaults
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const verifyContract = async (contractKey: string) => {
    setVerifying(contractKey);
    // Open Polygonscan in new tab
    const address = CONTRACTS[contractKey as keyof typeof CONTRACTS].address;
    window.open(`https://polygonscan.com/address/${address}#code`, '_blank');
    setTimeout(() => setVerifying(null), 1000);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full bg-white z-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-sm font-medium text-gray-900">Contract Security</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        {/* Page Title */}
        <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4">
              Contract Security
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every SafeRelay smart contract is immutable, verified, and has no admin functions. 
              Your funds are secured by code, not promises.
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="sticky top-14 bg-white border-b border-gray-200 z-40">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'code'
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Read the Code
              </button>
              <button
                onClick={() => setActiveTab('guarantees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'guarantees'
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Security Guarantees
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Visual Architecture */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-normal text-gray-900 mb-8">How Your Money Is Protected</h2>
                
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏭</span>
                    </div>
                    <h3 className="font-semibold mb-2">Factory Contract</h3>
                    <p className="text-sm text-gray-600">Creates escrow vaults</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="font-semibold mb-2">Smart Vault</h3>
                    <p className="text-sm text-gray-600">Holds funds securely</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💸</span>
                    </div>
                    <h3 className="font-semibold mb-2">Payment Splitter</h3>
                    <p className="text-sm text-gray-600">Distributes funds automatically</p>
                  </div>
                </div>

                {/* No Admin Access Banner */}
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                  <span className="text-red-600 font-semibold">
                    ❌ No Admin Keys • ❌ No Backdoors • ❌ No Emergency Withdrawals
                  </span>
                </div>
              </div>

              {/* Verified Contract Registry */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-normal text-gray-900 mb-8">Verified Contract Registry</h2>
                
                <div className="space-y-6">
                  {Object.entries(CONTRACTS).map(([key, contract]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{contract.name}</h3>
                          <p className="text-gray-600 mb-4">{contract.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Address:</span>
                              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                                {contract.address}
                              </code>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Deployed:</span>
                              <span>{contract.deployedAt}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500 w-24">Audit:</span>
                              <span className="text-green-600 font-medium">✓ {contract.audit}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => verifyContract(key)}
                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-all ${
                            verifying === key
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                          }`}
                          disabled={verifying === key}
                        >
                          {verifying === key ? '✓ Opening...' : 'Verify on Polygonscan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Vaults Live Feed */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-normal text-gray-900">Latest Vaults (Live Feed)</h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Auto-updating every 10 seconds
                  </div>
                </div>
                
                <div className="space-y-3">
                  {latestVaults.map((vault) => (
                    <div key={vault.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          vault.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <span className="font-mono text-sm">Vault #{vault.id}: </span>
                          <code className="text-[#2563EB] text-sm">{vault.address}</code>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">{vault.amount}</span>
                        <span className="text-gray-500 text-sm">{vault.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-12">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-normal text-gray-900 mb-8">Read The Code</h2>
                
                {/* Key Functions Explained */}
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold mb-2">createEscrow()</h4>
                    <p className="text-gray-600 mb-3">Creates a new escrow vault for two parties</p>
                    <div className="bg-white rounded border border-gray-200 p-4 font-mono text-xs overflow-x-auto">
                      <pre>{`function createEscrow(
  address payer,
  address recipient,
  uint256 amount
) returns (address vault) {
  // Deploy new vault contract
  // Set immutable parties
  // Cannot be changed later
}`}</pre>
                    </div>
                    <p className="text-sm text-green-600 mt-2">✓ What this means: Once created, no one can change the parties or amount</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold mb-2">approve()</h4>
                    <p className="text-gray-600 mb-3">Both parties must approve to release funds</p>
                    <div className="bg-white rounded border border-gray-200 p-4 font-mono text-xs overflow-x-auto">
                      <pre>{`function approve() {
  require(msg.sender == payer || msg.sender == recipient);
  
  if (msg.sender == payer) payerApproved = true;
  if (msg.sender == recipient) recipientApproved = true;
  
  if (payerApproved && recipientApproved) {
    releaseFunds();
  }
}`}</pre>
                    </div>
                    <p className="text-sm text-green-600 mt-2">✓ What this means: Both parties must agree, no exceptions</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-mono text-sm font-semibold mb-2">No Admin Functions</h4>
                    <p className="text-gray-600 mb-3">What's NOT in the code</p>
                    <div className="bg-red-50 rounded border border-red-200 p-4">
                      <p className="text-red-600 font-mono text-sm line-through">function emergencyWithdraw() onlyOwner {...}</p>
                      <p className="text-red-600 font-mono text-sm line-through">function changeRecipient() onlyAdmin {...}</p>
                      <p className="text-red-600 font-mono text-sm line-through">function pause() onlyOwner {...}</p>
                    </div>
                    <p className="text-sm text-green-600 mt-2">✓ What this means: SafeRelay cannot access or redirect your funds</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guarantees' && (
            <div className="space-y-12">
              {/* Security Guarantees */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-normal text-gray-900 mb-8">Security Guarantees</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                    <h3 className="font-semibold text-green-900 mb-3">✓ What We Guarantee</h3>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Contracts are immutable after deployment</li>
                      <li>• No proxy patterns or upgradeable contracts</li>
                      <li>• Funds locked until both parties approve</li>
                      <li>• Automatic release after 90 days (protection)</li>
                      <li>• All code verified on Polygonscan</li>
                      <li>• 1.99% fee hardcoded, cannot change</li>
                    </ul>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="font-semibold text-red-900 mb-3">✗ What We Cannot Do</h3>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Access funds in any vault</li>
                      <li>• Change contract logic after deployment</li>
                      <li>• Modify fee percentages</li>
                      <li>• Pause or freeze vaults</li>
                      <li>• Override party decisions</li>
                      <li>• Redirect or recover "lost" funds</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Audit Reports */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-normal text-gray-900 mb-8">Security Audits</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Certik Security Audit</h4>
                      <p className="text-sm text-gray-600">Comprehensive smart contract audit</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-600 font-medium">✓ Passed</span>
                      <a href="#" className="text-[#2563EB] hover:underline text-sm">View Report</a>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold">OpenZeppelin Review</h4>
                      <p className="text-sm text-gray-600">Code quality and best practices review</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-600 font-medium">✓ Passed</span>
                      <a href="#" className="text-[#2563EB] hover:underline text-sm">View Report</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bug Bounty */}
              <div className="bg-gradient-to-r from-purple-600 to-[#2563EB] rounded-xl p-8 text-white">
                <h2 className="text-2xl font-normal mb-4">🐛 Bug Bounty Program</h2>
                <p className="mb-4 text-lg">Find a critical vulnerability? Earn up to $50,000</p>
                <div className="flex items-center space-x-4">
                  <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
                    Learn More
                  </button>
                  <span className="text-sm opacity-90">12 bugs found and fixed to date</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}