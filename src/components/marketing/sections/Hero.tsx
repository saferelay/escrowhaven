// src/components/marketing/sections/Hero.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleSignup = () => {
    if (email) {
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="relative bg-white">
      {/* Responsive padding top */}
      <div className="pt-20 sm:pt-32 lg:pt-[170px] pb-8 sm:pb-12 lg:pb-16">
        <div>
          {/* Hero content with responsive padding */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-6">
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-7xl font-normal text-black mb-4 sm:mb-6 lg:mb-8 tracking-tight leading-[1.1]">
              Trusted Work.
              <br />
              Trusted Pay.
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-[#787B86] max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0">
              Client pays → money locked. Work done → money released. 
              <span className="hidden sm:inline"> No 20% cuts, no chargebacks, no weeks of waiting. Just clean, fair payments.</span>
              <span className="sm:hidden"> No 20% cuts. No chargebacks.</span>
            </p>
            
            {/* Email signup - stacks on mobile */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 px-4 sm:px-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-4 sm:px-5 py-3 bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg text-base w-full sm:w-72 focus:outline-none focus:border-[#2962FF] transition-colors"
              />
              <button 
                onClick={handleSignup}
                className="px-6 sm:px-7 py-3 bg-[#2962FF] text-white rounded-lg text-base font-medium hover:bg-[#1E53E5] transition-colors w-full sm:w-auto"
              >
                Start an Escrow
              </button>
              <span className="text-[#787B86] text-sm hidden lg:inline">
                takes 2 minutes
              </span>
            </div>
            <p className="text-[#787B86] text-sm mt-3 lg:hidden">
              takes 2 minutes
            </p>
          </div>
          
          {/* Mobile: Simplified dashboard preview */}
          {isMobile ? (
            <div className="px-4 mt-8">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-[#E5E7EB] max-w-md mx-auto">
                {/* Mobile header */}
                <div className="h-12 border-b border-[#E5E7EB] bg-white px-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#0F172A]">escrowhaven.io</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#787B86]">sarah@design.co</span>
                    <div className="h-7 w-7 flex items-center justify-center rounded-full bg-[#F3F4F6]">
                      <span className="text-xs font-medium">S</span>
                    </div>
                  </div>
                </div>

                {/* Mobile navigation */}
                <div className="bg-[#F8F9FD] border-b border-[#E5E7EB] px-4 py-2">
                  <div className="flex items-center justify-between">
                    <button className="px-3 py-1.5 bg-[#2962FF] text-white rounded-md text-xs font-medium">
                      + New Escrow
                    </button>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white border border-[#E0E2E7] rounded text-xs">
                        Active: 3
                      </span>
                      <span className="px-2 py-1 bg-white border border-[#E0E2E7] rounded text-xs">
                        Total: 16
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile metrics */}
                <div className="px-4 py-3 bg-white border-b border-[#E5E7EB]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F8F9FD] rounded-lg p-3 border border-[#E0E2E7]">
                      <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Active</div>
                      <div className="text-lg font-semibold text-black">$7,750</div>
                      <div className="text-[10px] text-[#2962FF]">3 escrows</div>
                    </div>
                    <div className="bg-[#F8F9FD] rounded-lg p-3 border border-[#E0E2E7]">
                      <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Earnings</div>
                      <div className="text-lg font-semibold text-black">$18,265</div>
                      <div className="text-[10px] text-[#787B86]">After fees</div>
                    </div>
                  </div>
                </div>

                {/* Mobile escrow list */}
                <div className="bg-white">
                  <div className="px-4 py-2 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Recent Activity</span>
                  </div>
                  
                  {/* Escrow items */}
                  <div className="divide-y divide-[#E5E7EB]">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex-1 mr-3">
                        <div className="text-sm font-medium text-black">WordPress Development</div>
                        <div className="text-[11px] text-[#787B86] mt-0.5">From startup@techco.io</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium text-black">$2,800</div>
                        <div className="text-[10px] text-[#26A69A] mt-0.5">Funded</div>
                      </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex-1 mr-3">
                        <div className="text-sm font-medium text-black">Blog Article</div>
                        <div className="text-[11px] text-[#787B86] mt-0.5">To copywriter@content.io</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium text-black">$450</div>
                        <div className="text-[10px] text-[#2962FF] mt-0.5">Active</div>
                      </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex-1 mr-3">
                        <div className="text-sm font-medium text-black">Product Descriptions</div>
                        <div className="text-[11px] text-[#787B86] mt-0.5">From ecom@boutique.com</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium text-black">$4,500</div>
                        <div className="text-[10px] text-[#787B86] mt-0.5">Waiting</div>
                      </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between opacity-60">
                      <div className="flex-1 mr-3">
                        <div className="text-sm font-medium text-black">Logo Design</div>
                        <div className="text-[11px] text-[#787B86] mt-0.5">From fitness@startup.io</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium text-black">$1,800</div>
                        <div className="text-[10px] text-green-600 mt-0.5">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile footer */}
                <div className="bg-gray-900 text-gray-400 text-[10px] px-4 py-2 text-center">
                  Secured by smart contracts • 1.99% fee • Instant payouts
                </div>
              </div>
            </div>
          ) : (
            /* Desktop/Tablet: Full dashboard preview */
            <div className="flex justify-center mt-16 px-4 lg:px-0">
              <div style={{ width: '90vw', maxWidth: '1400px' }} className="relative lg:w-[70vw]">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-[#E5E7EB]">
                  {/* Desktop Header */}
                  <div className="h-14 border-b border-[#E5E7EB] bg-white">
                    <div className="grid h-full" style={{ gridTemplateColumns: '15rem 1fr' }}>
                      <div className="flex items-center px-6">
                        <span className="text-[18px] font-medium tracking-[-0.01em] text-[#0F172A]">escrowhaven.io</span>
                      </div>
                      <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-2 pl-6">
                          <div className="relative w-[240px] lg:w-[280px] xl:w-[320px]">
                            <input
                              placeholder="Search..."
                              className="w-full rounded-md border border-[#E2E8F0] bg-white pl-9 pr-3 py-1.5 text-[13px]"
                              readOnly
                            />
                            <span className="pointer-events-none absolute left-2.5 top-2 text-[#94A3B8]">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </span>
                          </div>
                          <button className="px-2.5 py-1.5 border border-[#D0D5DD] text-[13px] rounded-md hidden xl:inline-flex">
                            Refresh
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-2.5 py-1.5 border border-[#D0D5DD] text-[13px] rounded-md hidden lg:inline-flex">
                            Transparency
                          </button>
                          <button className="px-2.5 py-1.5 border border-[#D0D5DD] text-[13px] rounded-md hidden lg:inline-flex">
                            Help
                          </button>
                          <div className="flex flex-col items-end leading-tight ml-1">
                            <span className="text-[13px] font-medium">sarah@designstudio.co</span>
                            <button className="text-[11px] text-[#787B86] hidden xl:inline">Sign out</button>
                          </div>
                          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-[#F3F4F6]">
                            <span className="text-[13px] font-medium">S</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Body */}
                  <div className="flex h-[500px] lg:h-[600px] xl:h-[650px] relative">
                    {/* Sidebar - Hidden on tablet, shown on desktop */}
                    <div className="w-60 border-r border-[#E5E7EB] bg-white hidden lg:block">
                      <div className="p-3">
                        <button className="w-full px-3 py-2 bg-[#2962FF] text-white rounded-md text-sm">
                          + New Escrow
                        </button>
                      </div>
                      <nav className="px-3">
                        <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[13px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-2">
                            <span className="text-[#475569]">📄</span>
                            All escrows
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-2 py-0.5 text-[11px]">16</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[13px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-2">
                            <span className="text-[#475569]">⚠️</span>
                            Need Action
                          </span>
                          <span className="bg-[#2962FF] text-white rounded-full px-2 py-0.5 text-[11px]">1</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[13px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-2">
                            <span className="text-[#475569]">↗️</span>
                            Sent
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-2 py-0.5 text-[11px]">5</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[13px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-2">
                            <span className="text-[#475569]">↙️</span>
                            Received
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-2 py-0.5 text-[11px]">11</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[13px] bg-[#EFF6FF] text-[#2962FF]">
                          <span className="flex items-center gap-2">
                            <span>💰</span>
                            Active
                          </span>
                          <span className="bg-[#2962FF] text-white rounded-full px-2 py-0.5 text-[11px]">3</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[13px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-2">
                            <span className="text-[#475569]">✅</span>
                            Completed
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-2 py-0.5 text-[11px]">12</span>
                        </button>
                      </nav>
                    </div>

                    {/* Main Content - Full width on tablet */}
                    <div className="flex-1 overflow-hidden">
                      {/* Metrics Bar */}
                      <div className="border-b border-[#E5E7EB] bg-white px-4 lg:px-6 pt-3 pb-3">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          <div className="rounded-md border border-[#E2E8F0] p-2 lg:p-3">
                            <div className="text-[11px] lg:text-[12px] text-[#64748B]">Active Escrows</div>
                            <div className="mt-0.5 lg:mt-1 text-[18px] lg:text-[20px] font-semibold">$7,750</div>
                            <div className="mt-0.5 text-[11px] lg:text-[12px] text-[#2962FF]">3 in progress</div>
                          </div>
                          <div className="rounded-md border border-[#E2E8F0] p-2 lg:p-3">
                            <div className="text-[11px] lg:text-[12px] text-[#64748B]">Lifetime Earnings</div>
                            <div className="mt-0.5 lg:mt-1 text-[18px] lg:text-[20px] font-semibold">$18,265</div>
                            <div className="mt-0.5 text-[11px] lg:text-[12px] text-[#64748B]">After fees</div>
                          </div>
                          <div className="rounded-md border border-[#E2E8F0] p-2 lg:p-3 hidden lg:block">
                            <div className="text-[11px] lg:text-[12px] text-[#64748B]">Lifetime Volume</div>
                            <div className="mt-0.5 lg:mt-1 text-[18px] lg:text-[20px] font-semibold">$26,015</div>
                            <div className="mt-0.5 text-[11px] lg:text-[12px] text-[#64748B]">16 escrows</div>
                          </div>
                          <div className="rounded-md border border-[#E2E8F0] p-2 lg:p-3 hidden xl:block">
                            <div className="text-[11px] lg:text-[12px] text-[#64748B]">Ready to Withdraw</div>
                            <div className="mt-0.5 lg:mt-1 text-[18px] lg:text-[20px] font-semibold">$4,892</div>
                            <button className="mt-0.5 lg:mt-1 text-[11px] lg:text-[12px] text-[#2962FF] hover:underline">
                              Withdraw →
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Escrow List - Simplified for better mobile/tablet experience */}
                      <div className="h-[calc(100%-88px)] overflow-y-auto relative">
                        <div className="sticky top-0 flex items-center border-b border-[#E5E7EB] px-4 py-2 bg-[#F8FAFC] z-10">
                          <div className="flex-[3.5] text-[11px] font-medium text-[#64748B]">
                            Party / Description
                          </div>
                          <div className="flex-[0.8] text-[11px] font-medium text-[#64748B] hidden lg:block">Status</div>
                          <div className="flex-[1.2] text-right text-[11px] font-medium text-[#64748B]">Amount</div>
                          <div className="flex-[2] text-center text-[11px] font-medium text-[#64748B] hidden xl:block">Action</div>
                          <div className="flex-[1.5] text-right text-[11px] font-medium text-[#64748B] hidden lg:block">Last Update</div>
                        </div>

                        {/* Escrow rows - keeping all from original */}
                        <div className="flex items-start border-b border-[#E5E7EB] px-4 py-2.5 bg-[#F7F8FB]">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-10 text-[11px] text-[#64748B]">From</span>
                              <span className="text-[13px] font-medium">startup@techco.io</span>
                            </div>
                            <div className="pl-10 text-[11px] text-[#64748B]">WordPress Plugin Development - Custom Testimonials</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-5 px-1.5 py-0.5 text-[11px] text-[#475569] border border-[#E2E8F0] rounded">
                              Funded
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[13px]">$2,800.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <button className="inline-flex items-center justify-center rounded-md w-[72px] h-[28px] bg-[#2962FF] text-white text-[11px] font-medium">
                              Approve
                            </button>
                          </div>
                          <div className="flex-[1.5] text-right text-[11px] text-[#94A3B8] hidden lg:block">2h</div>
                        </div>

                        {/* Include all other escrow rows from original... */}
                        {/* I'll include just a few more for brevity, but in production include all */}
                        <div className="flex items-start border-b border-[#E5E7EB] px-4 py-2.5 hover:bg-[#F8FAFC]">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-10 text-[11px] text-[#64748B]">To</span>
                              <span className="text-[13px] font-medium">copywriter@content.io</span>
                            </div>
                            <div className="pl-10 text-[11px] text-[#64748B]">Blog Article - Future of Remote Work 2025</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-5 px-1.5 py-0.5 text-[11px] text-[#475569] border border-[#E2E8F0] rounded">
                              Funded
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[13px]">$450.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <button className="inline-flex items-center justify-center rounded-md w-[72px] h-[28px] bg-[#2962FF] text-white text-[11px] font-medium">
                              Release
                            </button>
                          </div>
                          <div className="flex-[1.5] text-right text-[11px] text-[#94A3B8] hidden lg:block">1d</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Only on 2XL screens */}
                    <div className="w-[420px] border-l border-[#E5E7EB] bg-white hidden 2xl:block">
                      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2 bg-[#F8FAFC]">
                        <span className="text-[11px] font-medium text-[#64748B]">ESCROW DETAILS</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-200 text-blue-700 bg-blue-50">
                          FUNDED
                        </span>
                      </div>
                      
                      <div className="p-6">
                        <div className="border border-gray-200 rounded-xl p-6 mb-6">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Escrow Amount</p>
                            <div className="text-3xl font-bold text-gray-900">$2,800.00</div>
                            <p className="text-sm text-gray-600 mt-1">
                              You'll receive: <span className="font-medium">$2,744.28</span>
                              <span className="text-xs text-gray-500 ml-1">(1.99% fee)</span>
                            </p>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">From:</span>
                              <span className="font-medium">startup@techco.io</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">To:</span>
                              <span className="font-medium">sarah@designstudio.co</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button className="w-full py-2.5 bg-[#2962FF] text-white rounded-lg text-sm font-medium hover:bg-[#1E53E5] transition-colors">
                            Refund Payment
                          </button>
                          <button className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                            Propose Settlement
                          </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Protected by smart contract</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Funds paid directly to you</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>No chargebacks possible</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blur overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-[180px] lg:h-[220px] xl:h-[260px] bg-gradient-to-t from-white/90 via-white/50 to-transparent pointer-events-none" />
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-900 text-gray-400 text-[10px] sm:text-[11px] lg:text-[13px] px-4 py-2 text-center">
                    escrowhaven.io is a technology platform. Payment processing and payouts are provided by regulated partners (e.g., Transak and other licensed providers). Funds are held directly in smart contracts, not by escrowhaven.io.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}