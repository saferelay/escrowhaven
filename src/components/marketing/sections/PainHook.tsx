// src/components/marketing/sections/PainHook.tsx
'use client';

export function PainHook() {
  return (
    <section className="py-8 md:py-10 bg-white border-y border-[#E0E2E7]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-center gap-4">
          {/* Warning icon */}
          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg border border-[#EF5350] bg-white">
            <svg className="w-5 h-5 text-[#EF5350]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* Message */}
          <div className="text-center md:text-left">
            <p className="text-base md:text-lg text-[#000000]">
              <span className="text-[#EF5350] font-medium">"Another chargeback..."</span>
              <span className="text-[#787B86] ml-2">
                Freelancers lose $3B yearly to payment disputes.
              </span>
              <span className="text-[#000000] font-medium ml-2">
                Your work deserves protection.
              </span>
            </p>
          </div>
          
          {/* Live counter */}
          <div className="hidden lg:flex items-center gap-2 ml-auto px-4 py-2 bg-[#F8F9FD] rounded-lg border border-[#E0E2E7]">
            <div className="w-2 h-2 bg-[#EF5350] rounded-full animate-pulse"></div>
            <span className="text-xs text-[#787B86] uppercase">Live</span>
            <span className="text-sm font-medium text-[#000000]">$142k</span>
            <span className="text-xs text-[#787B86]">lost today</span>
          </div>
        </div>
      </div>
    </section>
  );
}