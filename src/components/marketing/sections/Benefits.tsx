// src/components/marketing/sections/Benefits.tsx
'use client';

export function Benefits() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-black mb-6">
            Built for how you actually work
          </h2>
          <p className="text-xl text-[#787B86]">
            Whether you're hiring or getting hired, escrowhaven protects both sides
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* For Freelancers */}
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal text-black mb-2">For Freelancers</h3>
              <p className="text-sm text-[#787B86]">Get paid faster, keep more, worry less</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#26A69A]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-normal text-[#26A69A]">98%</span>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Keep more of what you earn</h4>
                  <p className="text-sm text-[#787B86] mt-1">Only 1.99% fee vs 20% on platforms</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#26A69A]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-normal text-[#26A69A]">24h</span>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Get paid next day</h4>
                  <p className="text-sm text-[#787B86] mt-1">Money in your bank in 24-48 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#26A69A]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-normal text-[#26A69A]">0%</span>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Zero chargebacks</h4>
                  <p className="text-sm text-[#787B86] mt-1">No PayPal reversals after 180 days</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#26A69A]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-normal text-[#26A69A]">170+</span>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Work globally</h4>
                  <p className="text-sm text-[#787B86] mt-1">Accept clients from 170+ countries</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#26A69A]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Your clients, your terms</h4>
                  <p className="text-sm text-[#787B86] mt-1">No platform restrictions or account bans</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-normal text-black mb-2">For Clients</h3>
              <p className="text-sm text-[#787B86]">Pay confidently, get quality work</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-normal text-[#2962FF]">100%</span>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Work guaranteed</h4>
                  <p className="text-sm text-[#787B86] mt-1">Approve before any funds release</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-normal text-[#2962FF]">7+</span>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Pay your way</h4>
                  <p className="text-sm text-[#787B86] mt-1">Credit card, Apple Pay, bank transfer</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-normal text-[#2962FF]">$0</span>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">No fees for you</h4>
                  <p className="text-sm text-[#787B86] mt-1">Only freelancer pays platform fee</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Simple approval</h4>
                  <p className="text-sm text-[#787B86] mt-1">Review work, click approve, done</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-medium text-black">Full refund option</h4>
                  <p className="text-sm text-[#787B86] mt-1">Get money back if work not delivered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}