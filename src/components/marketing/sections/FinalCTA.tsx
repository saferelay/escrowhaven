// src/components/marketing/sections/FinalCTA.tsx
'use client';

import { useRouter } from 'next/navigation';

export function FinalCTA() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            Start protecting your payments today
          </h2>
          <p className="text-lg text-[#787B86] mb-8">
            No setup fees. No monthly costs. Just 1.99% when you get paid.
          </p>
          
          {/* Dashboard-style CTA card */}
          <div className="bg-white rounded-xl border border-[#E0E2E7] p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-[#26A69A] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-[#000000]">Ready to go</span>
                </div>
                <p className="text-xs text-[#787B86]">
                  Create your first escrow in under 60 seconds
                </p>
              </div>
              
              <button
                onClick={handleSignup}
                className="px-8 py-3 bg-[#2962FF] text-white rounded-lg font-medium text-sm hover:bg-[#1E53E5] transition-colors whitespace-nowrap"
              >
                Get Started Free
              </button>
            </div>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#787B86]">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No credit card required
            </span>
            <span className="hidden md:inline text-[#E0E2E7]">•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bank-level security
            </span>
            <span className="hidden md:inline text-[#E0E2E7]">•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant setup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}