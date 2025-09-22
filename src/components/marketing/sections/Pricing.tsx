// src/components/marketing/sections/Pricing.tsx
'use client';

export function Pricing() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[#787B86] max-w-2xl mx-auto">
            No setup fees. No monthly costs. Pay only when you get paid.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main pricing card */}
          <div className="bg-white rounded-xl border-2 border-[#2962FF] p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8F9FD] rounded-lg border border-[#E0E2E7] mb-4">
                <span className="text-xs text-[#787B86] uppercase">One simple fee</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-normal text-[#000000]">1.99</span>
                <span className="text-2xl text-[#787B86]">%</span>
              </div>
              <p className="text-sm text-[#787B86] mt-2">per successful transaction</p>
            </div>

            {/* What's included */}
            <div className="border-t border-[#E0E2E7] pt-6">
              <p className="text-xs text-[#787B86] uppercase mb-4">Everything included</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <span className="text-sm text-[#000000]">Unlimited escrows</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <span className="text-sm text-[#000000]">Smart contract security</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <span className="text-sm text-[#000000]">Instant payouts</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <span className="text-sm text-[#000000]">24/7 support</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <span className="text-sm text-[#000000]">Dispute resolution</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <span className="text-sm text-[#000000]">API access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-[#E0E2E7] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E0E2E7] bg-[#F8F9FD]">
              <p className="text-sm font-medium text-[#000000]">How we compare</p>
            </div>
            <div className="divide-y divide-[#E0E2E7]">
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <div className="text-sm text-[#787B86]">Platform</div>
                <div className="text-sm text-[#787B86]">Their fee</div>
                <div className="text-sm text-[#787B86]">You save</div>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-[#F8F9FD] transition-colors">
                <div className="text-sm text-[#000000] font-medium">EscrowHaven</div>
                <div className="text-sm text-[#2962FF] font-medium">1.99%</div>
                <div className="text-sm text-[#26A69A] font-medium">—</div>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-[#F8F9FD] transition-colors">
                <div className="text-sm text-[#000000]">Upwork</div>
                <div className="text-sm text-[#787B86]">20%</div>
                <div className="text-sm text-[#26A69A]">18.01%</div>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-[#F8F9FD] transition-colors">
                <div className="text-sm text-[#000000]">Fiverr</div>
                <div className="text-sm text-[#787B86]">20%</div>
                <div className="text-sm text-[#26A69A]">18.01%</div>
              </div>
              <div className="px-6 py-4 grid grid-cols-3 gap-4 hover:bg-[#F8F9FD] transition-colors">
                <div className="text-sm text-[#000000]">PayPal G&S</div>
                <div className="text-sm text-[#787B86]">3.49% + $0.49</div>
                <div className="text-sm text-[#26A69A]">1.5%+</div>
              </div>
            </div>
          </div>

          {/* Calculator */}
          <div className="mt-8 bg-white rounded-xl border border-[#E0E2E7] p-6">
            <p className="text-sm font-medium text-[#000000] mb-4">Quick calculator</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F8F9FD] rounded-lg p-4 border border-[#E0E2E7]">
                <p className="text-xs text-[#787B86] mb-1">If you charge</p>
                <p className="text-xl font-normal text-[#000000]">$10,000</p>
              </div>
              <div className="bg-[#F8F9FD] rounded-lg p-4 border border-[#E0E2E7]">
                <p className="text-xs text-[#787B86] mb-1">You keep</p>
                <p className="text-xl font-normal text-[#2962FF]">$9,801</p>
              </div>
              <div className="bg-[#F8F9FD] rounded-lg p-4 border border-[#E0E2E7]">
                <p className="text-xs text-[#787B86] mb-1">vs Upwork you save</p>
                <p className="text-xl font-normal text-[#26A69A]">$1,801</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}