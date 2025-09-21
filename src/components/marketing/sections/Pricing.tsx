// src/components/marketing/sections/Pricing.tsx
'use client';

import { useRouter } from 'next/navigation';

export function Pricing() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <div id="pricing" className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-black mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-[#787B86]">
            No monthly fees. No minimums. Just pay when money moves.
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="bg-white border border-[#E0E2E7] rounded-xl overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-[#F8F9FD] px-8 py-6 text-center border-b border-[#E0E2E7]">
            <h3 className="text-2xl font-normal text-black mb-2">escrowhaven Pricing</h3>
            <div className="text-5xl font-normal text-black">1.99%</div>
            <p className="text-[#787B86] mt-2">Platform fee on successful transactions</p>
          </div>

          {/* Two Column Benefits */}
          <div className="grid md:grid-cols-2 divide-x divide-[#E0E2E7]">
            {/* Freelancers */}
            <div className="p-8">
              <h4 className="text-sm font-medium text-black mb-4">FOR FREELANCERS</h4>
              <div className="space-y-3 mb-6">
                <div className="text-sm text-[#787B86]">✓ Keep 98.01% of payments</div>
                <div className="text-sm text-[#787B86]">✓ No monthly fees</div>
                <div className="text-sm text-[#787B86]">✓ No minimums</div>
                <div className="text-sm text-[#787B86]">✓ 24-48h payouts</div>
              </div>
              
              {/* Examples */}
              <div className="bg-[#F8F9FD] rounded-lg p-4">
                <p className="text-xs text-[#787B86] font-medium mb-2">YOU RECEIVE</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#787B86]">$1,000</span>
                    <span className="font-medium text-black">$980.10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787B86]">$5,000</span>
                    <span className="font-medium text-black">$4,900.50</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clients */}
            <div className="p-8">
              <h4 className="text-sm font-medium text-black mb-4">FOR CLIENTS</h4>
              <div className="space-y-3 mb-6">
                <div className="text-sm text-[#787B86]">✓ $0 platform fees</div>
                <div className="text-sm text-[#787B86]">✓ 7+ payment methods</div>
                <div className="text-sm text-[#787B86]">✓ Pay in your currency</div>
                <div className="text-sm text-[#787B86]">✓ Full refund option</div>
              </div>
              
              {/* Payment Methods */}
              <div className="bg-[#F8F9FD] rounded-lg p-4">
                <p className="text-xs text-[#787B86] font-medium mb-2">PAY WITH</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-[#787B86]">
                  <div>Cards</div>
                  <div>Apple Pay</div>
                  <div>Bank</div>
                  <div>Google Pay</div>
                  <div>ACH</div>
                  <div>+more</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#F8F9FD] px-8 py-4 text-center border-t border-[#E0E2E7]">
            <p className="text-xs text-[#787B86]">
              Powered by Transak • Available in 170+ countries • All fees transparent upfront
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={handleSignup}
            className="px-8 py-3 bg-[#2962FF] text-white rounded-lg text-base font-medium hover:bg-[#1E53E5] transition-colors"
          >
            Start Your First Escrow
          </button>
          <p className="text-sm text-[#787B86] mt-3">
            Free to start • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}