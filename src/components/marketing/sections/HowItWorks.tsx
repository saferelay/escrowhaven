// src/components/marketing/sections/HowItWorks.tsx
'use client';

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Client pays",
      description: "Client sends payment to secure escrow vault",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Card icon */}
            <div className="w-20 h-14 rounded-lg border-2 border-[#2962FF] bg-white">
              <div className="h-2 mt-3 mx-2 bg-[#E0E2E7] rounded"></div>
              <div className="flex gap-1 mt-2 mx-2">
                <div className="w-3 h-3 bg-[#F8F9FD] rounded"></div>
                <div className="w-3 h-3 bg-[#F8F9FD] rounded"></div>
                <div className="w-3 h-3 bg-[#F8F9FD] rounded"></div>
                <div className="w-3 h-3 bg-[#F8F9FD] rounded"></div>
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      )
    },
    {
      number: "2",
      title: "Funds lock",
      description: "Money secured until work is approved",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Vault icon */}
            <div className="w-20 h-20 rounded-lg border-2 border-[#787B86] bg-white flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-[#F8F9FD] border border-[#E0E2E7] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            {/* Lock indicator */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#26A69A] rounded-full animate-pulse"></div>
          </div>
        </div>
      )
    },
    {
      number: "3",
      title: "Instant release",
      description: "Get paid immediately when work is complete",
      visual: (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Success checkmark */}
            <div className="w-20 h-20 rounded-full border-2 border-[#26A69A] bg-white flex items-center justify-center">
              <svg className="w-10 h-10 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* Speed lines */}
            <div className="absolute -right-3 top-1/2 -translate-y-1/2">
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-[#26A69A]"></div>
                <div className="w-4 h-0.5 bg-[#26A69A] opacity-60"></div>
                <div className="w-2 h-0.5 bg-[#26A69A] opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-normal text-[#000000] text-center mb-12">
          How it works
        </h2>
        
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
              <p className="text-[#787B86] text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mt-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#2962FF] rounded-full"></div>
            <div className="w-12 h-0.5 bg-[#E0E2E7]"></div>
            <div className="w-2 h-2 bg-[#787B86] rounded-full"></div>
            <div className="w-12 h-0.5 bg-[#E0E2E7]"></div>
            <div className="w-2 h-2 bg-[#26A69A] rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}