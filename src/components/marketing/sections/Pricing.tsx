// Pricing.tsx - Simplified without comparison
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
            No setup fees. No monthly costs. Just 1.99% when you get paid.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Main pricing card */}
          <div className="bg-white rounded-xl border-2 border-[#2962FF] p-8">
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
                  <span className="text-sm text-[#000000]">No chargebacks</span>
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
                  <span className="text-sm text-[#000000]">Work directly with anyone</span>
                </div>
              </div>
            </div>

            {/* Simple example */}
            <div className="mt-6 pt-6 border-t border-[#E0E2E7]">
              <div className="bg-[#F8F9FD] rounded-lg p-4 text-center">
                <p className="text-xs text-[#787B86] uppercase mb-2">Example</p>
                <p className="text-sm text-[#000000]">
                  On a $1,000 job, you keep <span className="font-medium text-[#26A69A]">$980</span>
                </p>
                <p className="text-xs text-[#787B86] mt-1">
                  vs $800 on Fiverr or $900 on Upwork
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}