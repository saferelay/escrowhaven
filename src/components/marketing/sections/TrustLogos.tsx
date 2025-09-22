// src/components/marketing/sections/TrustLogos.tsx
'use client';

export function TrustLogos() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#E0E2E7] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#787B86]">Secured</span>
              <svg className="w-4 h-4 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-lg font-normal text-[#000000] mt-1">256-bit</p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E0E2E7] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#787B86]">Network</span>
              <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-lg font-normal text-[#000000] mt-1">Polygon</p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E0E2E7] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#787B86]">Uptime</span>
              <div className="w-2 h-2 bg-[#26A69A] rounded-full animate-pulse"></div>
            </div>
            <p className="text-lg font-normal text-[#000000] mt-1">99.9%</p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E0E2E7] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#787B86]">Response</span>
              <svg className="w-4 h-4 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-normal text-[#000000] mt-1">&lt; 24hr</p>
          </div>
        </div>
      </div>
    </section>
  );
}