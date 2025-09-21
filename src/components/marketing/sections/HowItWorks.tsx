// src/components/marketing/sections/HowItWorks.tsx
'use client';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Create & Share',
      description: 'Create escrow link, add amount and description, share with client',
      color: 'bg-[#2962FF]'
    },
    {
      number: 2,
      title: 'Client Accepts',
      description: 'Client reviews terms and accepts the escrow agreement',
      color: 'bg-[#2962FF]'
    },
    {
      number: 3,
      title: 'Client Funds',
      description: 'Client pays via card, Apple Pay, or bank transfer - funds lock in smart contract',
      color: 'bg-[#2962FF]'
    },
    {
      number: 4,
      title: 'Work & Deliver',
      description: 'Complete the work knowing payment is secured. Submit when ready.',
      color: 'bg-[#2962FF]'
    },
    {
      number: 5,
      title: 'Get Paid',
      description: 'Client approves, funds release instantly to your bank (24-48h processing)',
      color: 'bg-[#26A69A]'
    }
  ];

  return (
    <div id="how-it-works" className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-black mb-6">
            How escrowhaven works
          </h2>
          <p className="text-xl text-[#787B86] max-w-3xl mx-auto">
            Simple, secure payments in 5 steps
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-[#E0E2E7]"></div>
            
            {/* Steps */}
            <div className="relative space-y-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-6 items-start">
                  <div className={`relative z-10 w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}>
                    {step.number}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-lg font-medium text-black mb-2">{step.title}</h3>
                    <p className="text-sm text-[#787B86] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Settlement note */}
          <div className="mt-16 p-6 bg-[#F8F9FD] rounded-xl border border-[#E0E2E7]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-[#E0E2E7]">
                <span className="text-[#787B86]">?</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-black mb-2">What if there's a dispute?</h4>
                <p className="text-sm text-[#787B86] leading-relaxed">
                  Either party can propose a partial settlement. Both must agree for funds to move. 
                  No platform interference - you control the outcome together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}