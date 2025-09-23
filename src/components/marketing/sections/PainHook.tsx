// src/components/marketing/sections/PainHook.tsx
'use client';

export function PainHook() {
  return (
    <section className="py-8 md:py-10 bg-white border-y border-[#E0E2E7]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Freelancer Pain */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#2962FF] bg-white flex-shrink-0">
              <svg className="w-5 h-5 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm md:text-base text-[#000000]">
                <span className="font-medium">No chargebacks.</span>
                <span className="text-[#787B86] ml-1">Keep 98%+ of your pay.</span>
              </p>
              <p className="text-xs text-[#787B86] mt-1">For freelancers</p>
            </div>
          </div>

          {/* Client Pain */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#26A69A] bg-white flex-shrink-0">
              <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm md:text-base text-[#000000]">
                <span className="font-medium">Only pay when work is delivered.</span>
                <span className="text-[#787B86] ml-1">100% protected.</span>
              </p>
              <p className="text-xs text-[#787B86] mt-1">For clients</p>
            </div>
          </div>
        </div>

        {/* Optional: Central trust message for mobile */}
        <div className="mt-6 text-center md:hidden">
          <p className="text-xs text-[#787B86]">
            EscrowHaven protects both sides until the job's done.
          </p>
        </div>
      </div>
    </section>
  );
}