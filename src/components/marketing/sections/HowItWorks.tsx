// src/components/marketing/sections/HowItWorks.tsx
'use client';

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Create your agreement",
      description: "Client funds the escrow vault. Freelancer sees proof of payment",
      details: "7 payment methods",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Multiple payment methods */}
            <div className="flex gap-2">
              <div className="w-16 h-10 rounded border border-[#E0E2E7] bg-white flex items-center justify-center">
                <svg className="w-6 h-4 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center">
                <svg className="w-4 h-4 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-[8px] text-[#787B86] mt-1">USDC</span>
              </div>
              <div className="w-16 h-10 rounded border-2 border-[#2962FF] bg-[#F8F9FD] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            {/* Security badge */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#26A69A] rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "2",
      title: "Work with confidence",
      description: "Freelancer delivers work knowing funds are locked and reserved.",
      details: "Both sides protected",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Smart contract vault */}
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#F8F9FD] to-white border-2 border-[#787B86] flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 text-[#787B86] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="flex justify-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-[#2962FF] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#2962FF] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#2962FF] rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Two-party approval indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-6 h-6 rounded-full border border-[#E0E2E7] bg-white flex items-center justify-center">
                <span className="text-[8px] text-[#787B86]">C</span>
              </div>
              <div className="w-6 h-6 rounded-full border border-[#E0E2E7] bg-white flex items-center justify-center">
                <span className="text-[8px] text-[#787B86]">F</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "3",
      title: "Get paid instantly",
      description: "Client approves, freelancer gets paid. No waiting, no chargebacks",
      details: "Direct to your wallet or bank",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Instant transfer visualization */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-[#26A69A] bg-white flex items-center justify-center">
                <svg className="w-6 h-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex gap-0.5">
                  <div className="w-8 h-0.5 bg-[#26A69A]"></div>
                  <div className="w-6 h-0.5 bg-[#26A69A] opacity-60"></div>
                  <div className="w-4 h-0.5 bg-[#26A69A] opacity-30"></div>
                </div>
                <span className="text-[8px] text-[#26A69A] mt-1">instant</span>
              </div>
              <div className="w-12 h-8 rounded border border-[#26A69A] bg-[#F8F9FD] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            {/* Lightning bolt for speed */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <svg className="w-4 h-4 text-[#F7931A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            How it works
          </h2>
          <p className="text-lg text-[#787B86] max-w-2xl mx-auto">
            Simple escrow that guarantees you get paid — and your client gets peace of mind.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Visual container with aspect ratio */}
              <div className="aspect-[4/3] bg-white rounded-xl border border-[#E0E2E7] flex items-center justify-center mb-6">
                {step.visual}
              </div>
              
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#2962FF] bg-white text-[#2962FF] font-medium text-sm mb-3">
                {step.number}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-normal text-[#000000] mb-2">
                {step.title}
              </h3>
              <p className="text-[#787B86] text-sm mb-2">
                {step.description}
              </p>
              <p className="text-[#2962FF] text-xs font-medium">
                {step.details}
              </p>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-[#E0E2E7]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-[#787B86]">No chargebacks</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-[#787B86]">24/7 accessible</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs text-[#787B86]">Instant payouts</span>
          </div>
        </div>
      </div>
    </section>
  );
}