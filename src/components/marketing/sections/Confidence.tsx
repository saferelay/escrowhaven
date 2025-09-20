// src/components/marketing/sections/Confidence.tsx
'use client';

import { useState } from 'react';

export function Confidence() {
  const [activeTab, setActiveTab] = useState('smart-contract');

  const tabs = [
    { id: 'smart-contract', label: 'Smart Contract Security' },
    { id: 'payment-partners', label: 'Reputable Payment Partners' },
    { id: 'fraud', label: 'Fraud Protection' },
    { id: 'data', label: 'Data Security' },
  ];

  const content: Record<string, { title: string; description: string }> = {
    'smart-contract': {
      title: 'Smart Contract Security',
      description: 'Funds live in code that no one — not even escrowhaven — can touch without both parties agreeing.'
    },
    'payment-partners': {
      title: 'Reputable Payment Partners',
      description: 'Payments and payouts via Transak for secure global coverage.'
    },
    'fraud': {
      title: 'Fraud Protection',
      description: 'No chargebacks. No surprise reversals.'
    },
    'data': {
      title: 'Data Security',
      description: 'Encrypted, verified, and monitored at every step.'
    }
  };

  const currentContent = content[activeTab as keyof typeof content] || content['smart-contract'];

  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl lg:text-5xl font-normal text-center text-black mb-12">
          Escrow you can trust completely
        </h2>
        
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#2962FF] text-white'
                    : 'text-[#787B86] hover:text-black'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="text-center py-8">
            <h3 className="text-2xl font-normal text-black mb-4">
              {currentContent.title}
            </h3>
            <p className="text-base text-[#787B86] max-w-2xl mx-auto">
              {currentContent.description}
            </p>
          </div>
        </div>
        
        {/* Platform fees comparison */}
        <div className="bg-white rounded-xl p-8 border border-[#E0E2E7]">
          <h3 className="text-xl font-medium text-black mb-6 text-center">Platform Fees Comparison</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-4xl font-light text-[#26A69A] mb-2">1.99%</div>
              <div className="text-sm text-[#787B86]">escrowhaven</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-[#EF5350] mb-2">20%</div>
              <div className="text-sm text-[#787B86]">Typical Platforms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}