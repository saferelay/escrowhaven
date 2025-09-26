// src/components/marketing/sections/HowItWorks.tsx
'use client';

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Start a Transaction",
      description: "Enter job details and invite the other party",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Form representation */}
            <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-3 w-32">
              <div className="space-y-1.5">
                <div className="h-1.5 bg-[#E0E2E7] rounded w-3/4"></div>
                <div className="h-1.5 bg-[#E0E2E7] rounded w-full"></div>
                <div className="h-1.5 bg-[#E0E2E7] rounded w-5/6"></div>
              </div>
              <div className="mt-3 h-6 bg-[#2962FF] rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            {/* Email indicator */}
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white border border-[#E0E2E7] rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "2",
      title: "Accept Terms",
      description: "Both parties review and agree to terms",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E0E2E7] flex items-center justify-center">
              <span className="text-xs text-[#787B86]">C</span>
            </div>
            <div className="px-2 py-1 bg-[#26A69A] rounded-full">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-white border border-[#E0E2E7] flex items-center justify-center">
              <span className="text-xs text-[#787B86]">F</span>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "3",
      title: "Secure Payment",
      description: "Client funds the vault, money locks in escrow",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-12 h-8 rounded border border-[#E0E2E7] bg-white flex items-center justify-center">
                <svg className="w-5 h-3 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex flex-col items-center">
                <svg className="w-3 h-3 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[7px] text-[#787B86] mt-0.5">USDC</span>
              </div>
              <div className="w-12 h-12 rounded-lg border border-[#2962FF] bg-[#F8F9FD] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#26A69A] rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "4",
      title: "Deliver Work",
      description: "Freelancer completes work with payment secured",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#787B86] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="w-14 h-1 bg-[#E0E2E7] rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-[#2962FF] rounded-full"></div>
                </div>
                <span className="text-[7px] text-[#787B86]">75%</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "5",
      title: "Instant Release",
      description: "Client approves, freelancer gets paid instantly",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-10 rounded-full border border-[#26A69A] bg-white flex items-center justify-center">
                <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex gap-0.5">
                <div className="w-5 h-0.5 bg-[#26A69A]"></div>
                <div className="w-3 h-0.5 bg-[#26A69A] opacity-60"></div>
                <div className="w-2 h-0.5 bg-[#26A69A] opacity-30"></div>
              </div>
              <div className="w-12 h-8 rounded border border-[#26A69A] bg-[#F8F9FD] flex items-center justify-center">
                <span className="text-[9px] font-mono text-[#26A69A] font-medium">$$$</span>
              </div>
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <svg className="w-3 h-3 text-[#F7931A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-[40px] lg:text-[56px] font-normal text-[#000000] mb-4 leading-[1.2]">
            How It Works
          </h2>
          <p className="text-[16px] lg:text-[18px] text-[#787B86] max-w-2xl mx-auto leading-[1.6]">
            The safest way to pay and get paid online — funds locked in your transaction vault until both parties are satisfied
          </p>
        </div>

        {/* Steps Grid - Proper Spacing */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {steps.map((step, index) => (
            <div key={index} className={`${index === 4 ? 'col-span-2 md:col-span-1 mx-auto md:mx-0 max-w-[200px] md:max-w-none' : ''}`}>
              {/* Visual Container */}
              <div className="bg-white rounded-[12px] border border-[#E0E2E7] aspect-square mb-4 flex items-center justify-center">
                {step.visual}
              </div>
              
              {/* Step Number */}
              <div className="flex justify-center mb-3">
                <div className="w-[32px] h-[32px] rounded-full border border-[#2962FF] bg-white flex items-center justify-center">
                  <span className="text-[14px] font-medium text-[#2962FF]">{step.number}</span>
                </div>
              </div>
              
              {/* Text Content */}
              <h3 className="text-[16px] font-medium text-[#000000] text-center mb-2 leading-[1.4]">
                {step.title}
              </h3>
              <p className="text-[14px] text-[#787B86] text-center leading-[1.5]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Indicators - Proper Spacing */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8 py-8 lg:py-12 border-t border-b border-[#E0E2E7]">
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-[14px] text-[#787B86]">No chargebacks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[14px] text-[#787B86]">24/7 accessible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[14px] text-[#787B86]">Instant payouts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[14px] text-[#787B86]">7 payment methods</span>
          </div>
        </div>

        {/* CTA Section - Proper Spacing */}
        <div className="text-center mt-12 lg:mt-16">
          <button
            onClick={() => window.location.href = '/signup'}
            className="px-[32px] py-[12px] bg-[#2962FF] text-white rounded-[8px] font-medium text-[16px] hover:bg-[#1E53E5] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(41,98,255,0.25)]"
          >
            Start Your First Transaction
          </button>
          <div className="mt-4">
            <a href="/learn/how-escrow-protects-you" className="text-[#2962FF] text-[14px] hover:underline">
              Learn how escrow protection works →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}