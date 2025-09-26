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
            No more chasing clients. No more paying for undelivered work. escrowhaven protects both sides until the job's done.
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
                Start a Transaction
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
                  <span className="text-sm font-medium text-[#0F172A]">escrowhaven</span>
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
                      + New Transaction
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
                      <div className="text-lg font-semibold text-black">$1,950</div>
                      <div className="text-[10px] text-[#2962FF]">3 escrows</div>
                    </div>
                    <div className="bg-[#F8F9FD] rounded-lg p-3 border border-[#E0E2E7]">
                      <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Earnings</div>
                      <div className="text-lg font-semibold text-black">$8,265</div>
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
                        <div className="text-sm font-medium text-black">WordPress Setup</div>
                        <div className="text-[11px] text-[#787B86] mt-0.5">From startup@techco.io</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium text-black">$800</div>
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
                        <div className="text-sm font-medium text-black">Product Copy</div>
                        <div className="text-[11px] text-[#787B86] mt-0.5">From ecom@boutique.com</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium text-black">$700</div>
                        <div className="text-[10px] text-[#787B86] mt-0.5">Waiting</div>
                      </div>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between opacity-60">
                      <div className="flex-1 mr-3">
                        <div className="text-sm font-medium text-black">Logo Design</div>
                        <div className="text-[11px] text-[#787B86] mt-0.5">From fitness@startup.io</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium text-black">$1,200</div>
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
            /* Desktop/Tablet: Full dashboard preview with browser frame */
            <div className="flex justify-center mt-16 px-4 lg:px-0">
              <div className="w-full max-w-6xl">
                {/* Minimalist Browser Frame */}
                <div className="bg-[#F8F9FD] rounded-t-xl border border-[#E0E2E7] border-b-0 px-4 py-3">
                  <div className="flex items-center">
                    {/* Mac-style browser dots */}
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#EF5350]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#F7931A]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#26A69A]"></div>
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="bg-white rounded-b-xl shadow-2xl overflow-hidden border border-[#E5E7EB] border-t-0">
                  {/* Desktop Header */}
                  <div className="h-12 border-b border-[#E5E7EB] bg-white">
                    <div className="grid h-full" style={{ gridTemplateColumns: '13rem 1fr' }}>
                      <div className="flex items-center px-4 border-r border-[#E5E7EB]">
                        <span className="text-[15px] font-medium tracking-[-0.01em] text-[#0F172A]">Dashboard</span>
                      </div>
                      <div className="flex items-center justify-between pr-4">
                        <div className="flex items-center gap-2 pl-4">
                          <div className="relative w-[200px] lg:w-[240px] xl:w-[280px]">
                            <input
                              placeholder="Search..."
                              className="w-full rounded-md border border-[#E2E8F0] bg-white pl-8 pr-2 py-1 text-[11px]"
                              readOnly
                            />
                            <span className="pointer-events-none absolute left-2 top-1.5 text-[#94A3B8]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </span>
                          </div>
                          <button className="px-2 py-1 border border-[#D0D5DD] text-[10px] rounded-md hidden xl:inline-flex">
                            Refresh
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 border border-[#D0D5DD] text-[10px] rounded-md hidden lg:inline-flex">
                            Transparency
                          </button>
                          <button className="px-2 py-1 border border-[#D0D5DD] text-[10px] rounded-md hidden lg:inline-flex">
                            Help
                          </button>
                          <div className="flex flex-col items-end leading-tight ml-1">
                            <span className="text-[11px] font-medium">sarah@designstudio.co</span>
                            <button className="text-[9px] text-[#787B86] hidden xl:inline">Sign out</button>
                          </div>
                          <div className="h-7 w-7 flex items-center justify-center rounded-full bg-[#F3F4F6]">
                            <span className="text-[11px] font-medium">S</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Body */}
                  <div className="flex h-[450px] lg:h-[500px] xl:h-[550px] relative">
                    {/* Sidebar - Hidden on tablet, shown on desktop */}
                    <div className="w-52 border-r border-[#E5E7EB] bg-white hidden lg:block">
                      <div className="p-2">
                        <button className="w-full px-2 py-1.5 bg-[#2962FF] text-white rounded-md text-xs">
                          + New Transaction
                        </button>
                      </div>
                      <nav className="px-2">
                        <button className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            All Transactions
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-1.5 py-0.5 text-[9px]">16</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Need Action
                          </span>
                          <span className="bg-[#2962FF] text-white rounded-full px-1.5 py-0.5 text-[9px]">1</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            Sent
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-1.5 py-0.5 text-[9px]">5</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            Received
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-1.5 py-0.5 text-[9px]">11</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] bg-[#EFF6FF] text-[#2962FF]">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Active
                          </span>
                          <span className="bg-[#2962FF] text-white rounded-full px-1.5 py-0.5 text-[9px]">3</span>
                        </button>
                        <button className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] hover:bg-[#F8FAFC]">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Completed
                          </span>
                          <span className="bg-[#E2E8F0] text-[#475569] rounded-full px-1.5 py-0.5 text-[9px]">12</span>
                        </button>
                      </nav>
                    </div>

                    {/* Main Content - Full width on tablet */}
                    <div className="flex-1 overflow-hidden">
                      {/* Metrics Bar */}
                      <div className="border-b border-[#E5E7EB] bg-white px-3 lg:px-4 pt-2 pb-2">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          <div className="rounded-md border border-[#E2E8F0] p-2">
                            <div className="text-[9px] lg:text-[10px] text-[#64748B]">Active Transactions</div>
                            <div className="mt-0.5 text-[14px] lg:text-[16px] font-semibold">$1,950</div>
                            <div className="text-[9px] lg:text-[10px] text-[#2962FF]">3 in progress</div>
                          </div>
                          <div className="rounded-md border border-[#E2E8F0] p-2">
                            <div className="text-[9px] lg:text-[10px] text-[#64748B]">Lifetime Earnings</div>
                            <div className="mt-0.5 text-[14px] lg:text-[16px] font-semibold">$8,265</div>
                            <div className="text-[9px] lg:text-[10px] text-[#64748B]">After fees</div>
                          </div>
                          <div className="rounded-md border border-[#E2E8F0] p-2 hidden lg:block">
                            <div className="text-[9px] lg:text-[10px] text-[#64748B]">Lifetime Volume</div>
                            <div className="mt-0.5 text-[14px] lg:text-[16px] font-semibold">$12,015</div>
                            <div className="text-[9px] lg:text-[10px] text-[#64748B]">16 escrows</div>
                          </div>
                          <div className="rounded-md border border-[#E2E8F0] p-2 hidden xl:block">
                            <div className="text-[9px] lg:text-[10px] text-[#64748B]">Ready to Withdraw</div>
                            <div className="mt-0.5 text-[14px] lg:text-[16px] font-semibold">$1,892</div>
                            <button className="text-[9px] lg:text-[10px] text-[#2962FF] hover:underline">
                              Withdraw →
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Escrow List - Simplified for better mobile/tablet experience */}
                      <div className="h-[calc(100%-68px)] overflow-y-auto relative">
                        <div className="sticky top-0 flex items-center border-b border-[#E5E7EB] px-3 py-1.5 bg-[#F8FAFC] z-10">
                          <div className="flex-[3.5] text-[9px] font-medium text-[#64748B]">
                            Party / Description
                          </div>
                          <div className="flex-[0.8] text-[9px] font-medium text-[#64748B] hidden lg:block">Status</div>
                          <div className="flex-[1.2] text-right text-[9px] font-medium text-[#64748B]">Amount</div>
                          <div className="flex-[2] text-center text-[9px] font-medium text-[#64748B] hidden xl:block">Action</div>
                          <div className="flex-[1.5] text-right text-[9px] font-medium text-[#64748B] hidden lg:block">Last Update</div>
                        </div>

                        {/* Active escrows */}
                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 bg-[#F7F8FB]">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">From</span>
                              <span className="text-[11px] font-medium">startup@techco.io</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">WordPress Plugin Development - Contact Form</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#2962FF] border border-[#2962FF] rounded">
                              Funded
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$800.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <button className="inline-flex items-center justify-center rounded-md w-[60px] h-[22px] bg-[#2962FF] text-white text-[9px] font-medium">
                              Approve
                            </button>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">2h</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC]">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">To</span>
                              <span className="text-[11px] font-medium">copywriter@content.io</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Blog Article - Remote Work Guide</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#2962FF] border border-[#2962FF] rounded">
                              Funded
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$450.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <button className="inline-flex items-center justify-center rounded-md w-[60px] h-[22px] bg-[#2962FF] text-white text-[9px] font-medium">
                              Release
                            </button>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">1d</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC]">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">From</span>
                              <span className="text-[11px] font-medium">ecom@boutique.com</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Product Descriptions - 15 Items</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#F7931A] border border-[#F7931A] rounded">
                              Pending
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$700.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <button className="inline-flex items-center justify-center rounded-md w-[60px] h-[22px] bg-white border border-[#E2E8F0] text-[#475569] text-[9px] font-medium">
                              View
                            </button>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">3d</div>
                        </div>

                        {/* Completed escrows - More entries */}
                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-75">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">From</span>
                              <span className="text-[11px] font-medium">fitness@startup.io</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Logo Design - Complete Brand Identity</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$1,200.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">5d</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-75">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">To</span>
                              <span className="text-[11px] font-medium">developer@agency.io</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Landing Page Development</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$1,500.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">1w</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-75">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">From</span>
                              <span className="text-[11px] font-medium">legal@lawfirm.com</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Contract Review - Terms of Service</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$950.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">2w</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-70">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">To</span>
                              <span className="text-[11px] font-medium">video@production.co</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Video Editing - 30 Second Promo</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$650.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">2w</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-65">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">From</span>
                              <span className="text-[11px] font-medium">realestate@agency.net</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Property Photos - 2 Locations</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$550.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">3w</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-60">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">To</span>
                              <span className="text-[11px] font-medium">seo@marketing.io</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">SEO Audit - Website Analysis</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$400.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">1m</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-55">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">From</span>
                              <span className="text-[11px] font-medium">nonprofit@charity.org</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Website Updates - Homepage</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$350.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">1m</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-50">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">To</span>
                              <span className="text-[11px] font-medium">writer@books.com</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Blog Post - Industry Analysis</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$600.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">6w</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-45">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">From</span>
                              <span className="text-[11px] font-medium">music@label.com</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Album Cover Design - Digital</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$750.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">2m</div>
                        </div>

                        <div className="flex items-start border-b border-[#E5E7EB] px-3 py-2 hover:bg-[#F8FAFC] opacity-40">
                          <div className="flex-[3.5]">
                            <div className="flex items-center">
                              <span className="w-8 text-[9px] text-[#64748B]">To</span>
                              <span className="text-[11px] font-medium">data@analytics.co</span>
                            </div>
                            <div className="pl-8 text-[9px] text-[#64748B]">Data Analysis - Sales Report</div>
                          </div>
                          <div className="flex-[0.8] hidden lg:block">
                            <span className="inline-flex items-center h-4 px-1 py-0.5 text-[9px] text-[#26A69A] border border-[#26A69A] rounded">
                              Complete
                            </span>
                          </div>
                          <div className="flex-[1.2] text-right font-mono text-[11px]">$1,100.00</div>
                          <div className="flex-[2] justify-center hidden xl:flex">
                            <span className="text-[9px] text-[#26A69A]">Released</span>
                          </div>
                          <div className="flex-[1.5] text-right text-[9px] text-[#94A3B8] hidden lg:block">2m</div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced blur overlay - stronger gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-[200px] lg:h-[250px] xl:h-[300px] bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-900 text-gray-400 text-[9px] sm:text-[10px] lg:text-[12px] px-4 py-2 text-center">
                    escrowhaven.io is a technology platform. Payment processing and payouts are provided by regulated partners. Funds are held directly in smart contracts, not by escrowhaven.io.
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