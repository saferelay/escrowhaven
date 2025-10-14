// src/components/marketing/sections/BenefitsComparison.tsx
'use client';

import { useRouter } from 'next/navigation';

export function BenefitsComparison() {
  const router = useRouter();
  
  const freelancerBenefits = [
    {
      title: "No chargebacks",
      description: "Once approved, money is yours forever"
    },
    {
      title: "Instant payouts", 
      description: "Get paid the moment work is approved"
    },
    {
      title: "Keep 98.01%",
      description: "Only 1.99% fee vs 20% on platforms"
    }
  ];

  const clientBenefits = [
    {
      title: "Pay with confidence",
      description: "Money held secure until you approve"
    },
    {
      title: "Clear milestones",
      description: "Release funds as work progresses"
    },
    {
      title: "Full transparency",
      description: "Track everything in real-time"
    }
  ];

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            Built for both sides
          </h2>
          <p className="text-lg text-[#787B86] max-w-2xl mx-auto">
            Whether you're hiring or getting hired, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Freelancer Benefits */}
          <div className="bg-white rounded-xl p-8 border border-[#E0E2E7]">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#F8F9FD] border border-[#E0E2E7] mb-4">
                <svg className="w-6 h-6 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-[#000000]">For Sellers</h3>
            </div>

            {/* Benefits list */}
            <div className="space-y-4">
              {freelancerBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-[#000000] text-sm">{benefit.title}</div>
                    <div className="text-xs text-[#787B86]">{benefit.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard-style metric display */}
            <div className="mt-8 p-4 bg-[#F8F9FD] rounded-lg border border-[#E0E2E7]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-normal text-[#2962FF]">98.01%</div>
                  <div className="text-xs text-[#787B86] mt-1">You keep</div>
                </div>
                <div className="w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E0E2E7"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2962FF"
                      strokeWidth="2"
                      strokeDasharray="98.01, 100"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Client Benefits */}
          <div className="bg-white rounded-xl p-8 border border-[#E0E2E7]">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#F8F9FD] border border-[#E0E2E7] mb-4">
                <svg className="w-6 h-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-[#000000]">For Buyers</h3>
            </div>

            {/* Benefits list */}
            <div className="space-y-4">
              {clientBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-5 h-5 rounded-full border border-[#26A69A] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                    <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-[#000000] text-sm">{benefit.title}</div>
                    <div className="text-xs text-[#787B86]">{benefit.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard-style protection display */}
            <div className="mt-8 p-4 bg-[#F8F9FD] rounded-lg border border-[#E0E2E7]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-normal text-[#26A69A]">100%</div>
                  <div className="text-xs text-[#787B86] mt-1">Protected</div>
                </div>
                <div className="w-16 h-16 flex items-center justify-center">
                  <div className="relative">
                    <svg className="w-12 h-12 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA - Dashboard style button */}
        <div className="text-center mt-12">
          <p className="text-[#787B86] text-sm mb-4">Join thousands already using escrow protection</p>
          <button 
            onClick={handleSignupClick}
            className="px-8 py-3 bg-[#2962FF] text-white rounded-lg font-medium text-sm hover:bg-[#1E53E5] transition-colors cursor-pointer"
          >
            Start Free Today
          </button>
        </div>
      </div>
    </section>
  );
}