// src/components/marketing/sections/ComparisonKeepMore.tsx
'use client';

export function ComparisonKeepMore() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            Keep more, get paid faster
          </h2>
          <p className="text-lg text-[#787B86] max-w-2xl mx-auto">
            Compare us to traditional platforms and see the difference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Keep More Card - Clean white with wire frame */}
          <div className="bg-white rounded-xl p-8 border border-[#E0E2E7] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-normal text-[#000000]">You keep more</h3>
              <span className="px-3 py-1.5 bg-white border border-[#26A69A] text-[#26A69A] rounded-lg text-sm font-medium">
                Save 17%
              </span>
            </div>

            {/* Dashboard-style comparison cards - fixed height container */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-[#26A69A] bg-white h-[76px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#000000]">EscrowHaven</span>
                    <span className="text-sm font-medium text-[#26A69A]">97%</span>
                  </div>
                  <div className="w-full bg-[#F8F9FD] rounded-full h-2">
                    <div className="bg-[#26A69A] h-2 rounded-full animate-pulse" style={{ width: '97%' }}></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-[#E0E2E7] bg-white h-[76px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#787B86]">Upwork</span>
                    <span className="text-sm text-[#787B86]">80%</span>
                  </div>
                  <div className="w-full bg-[#F8F9FD] rounded-full h-2">
                    <div className="bg-[#E0E2E7] h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-[#E0E2E7] bg-white h-[76px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#787B86]">Fiverr</span>
                    <span className="text-sm text-[#787B86]">80%</span>
                  </div>
                  <div className="w-full bg-[#F8F9FD] rounded-full h-2">
                    <div className="bg-[#E0E2E7] h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>

              {/* Dashboard-style metric card */}
              <div className="mt-8 pt-6 border-t border-[#E0E2E7]">
                <div className="bg-[#F8F9FD] rounded-lg p-4 text-center h-[88px] flex flex-col justify-center">
                  <div className="text-3xl font-normal text-[#26A69A]">$1,700</div>
                  <div className="text-xs text-[#787B86] mt-1">saved on every $10,000</div>
                </div>
              </div>
            </div>
          </div>

          {/* Faster Payouts Card - Clean white with wire frame */}
          <div className="bg-white rounded-xl p-8 border border-[#E0E2E7] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-normal text-[#000000]">Faster payouts</h3>
              <span className="px-3 py-1.5 bg-white border border-[#2962FF] text-[#2962FF] rounded-lg text-sm font-medium">
                10x faster
              </span>
            </div>

            {/* Dashboard-style timeline - fixed height container */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-[#2962FF] bg-white h-[76px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#000000]">EscrowHaven</span>
                    <span className="text-sm font-medium text-[#2962FF]">Instant</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[#2962FF] rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-[#2962FF]"></div>
                        <div className="w-3 h-3 bg-[#2962FF] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[#2962FF] ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-[#E0E2E7] bg-white h-[76px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#787B86]">Traditional Banks</span>
                    <span className="text-sm text-[#787B86]">5-7 days</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[#E0E2E7] rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-[#E0E2E7] border-t-2 border-dashed border-[#E0E2E7]"></div>
                        <div className="w-3 h-3 bg-[#E0E2E7] rounded-full"></div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[#B2B5BE] ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-[#E0E2E7] bg-white h-[76px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#787B86]">PayPal</span>
                    <span className="text-sm text-[#787B86]">2-3 days</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[#E0E2E7] rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-[#E0E2E7] border-t-2 border-dashed border-[#E0E2E7]"></div>
                        <div className="w-3 h-3 bg-[#E0E2E7] rounded-full"></div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[#B2B5BE] ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dashboard-style metric card */}
              <div className="mt-8 pt-6 border-t border-[#E0E2E7]">
                <div className="bg-[#F8F9FD] rounded-lg p-4 text-center h-[88px] flex flex-col justify-center">
                  <div className="text-3xl font-normal text-[#2962FF]">0 days</div>
                  <div className="text-xs text-[#787B86] mt-1">waiting for payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual proof section - dashboard style */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mini dashboard preview cards - fixed heights */}
          <div className="border border-[#E0E2E7] rounded-lg p-6 bg-white h-[156px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F8F9FD] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-normal text-[#000000]">100%</p>
                <p className="text-xs text-[#787B86]">Funds secured</p>
              </div>
            </div>
            <div className="h-px bg-[#E0E2E7] my-3"></div>
            <p className="text-xs text-[#787B86]">Verified on-chain</p>
          </div>

          <div className="border border-[#E0E2E7] rounded-lg p-6 bg-white h-[156px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F8F9FD] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-normal text-[#000000]">Zero</p>
                <p className="text-xs text-[#787B86]">Platform disputes</p>
              </div>
            </div>
            <div className="h-px bg-[#E0E2E7] my-3"></div>
            <p className="text-xs text-[#787B86]">Instant settlements</p>
          </div>

          <div className="border border-[#E0E2E7] rounded-lg p-6 bg-white h-[156px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F8F9FD] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-normal text-[#000000]">Instant</p>
                <p className="text-xs text-[#787B86]">Payout speed</p>
              </div>
            </div>
            <div className="h-px bg-[#E0E2E7] my-3"></div>
            <p className="text-xs text-[#787B86]">When approved</p>
          </div>
        </div>
      </div>
    </section>
  );
}