'use client';

export function Hero() {
  return (
    <div className="relative bg-white">
      {/* Add 170px from top for heading */}
      <div className="pt-[170px] pb-16">
        <div>
          <div className="text-center mb-12 px-6">
            <h1 className="text-6xl lg:text-7xl font-normal text-black mb-8 tracking-tight leading-[1.1]">
              Secure Payments.
              <br />
              Instant Peace of Mind.
            </h1>
            
            <p className="text-xl text-[#787B86] max-w-2xl mx-auto mb-12">
              Lock funds in escrow until both sides agree the job is done. No chargebacks. No delays. No surprises.
            </p>
            
            <div className="flex justify-center items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-5 py-3 bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg text-base w-72 focus:outline-none focus:border-[#2962FF] transition-colors"
              />
              <button className="px-7 py-3 bg-[#2962FF] text-white rounded-lg text-base font-medium hover:bg-[#1E53E5] transition-colors">
                Start an Escrow
              </button>
              <button className="px-5 py-3 text-[#787B86] hover:text-black text-base font-medium transition-colors">
                Book a Demo
              </button>
            </div>
          </div>
          
          {/* Dashboard at 70% of viewport width - Payment flow mockup */}
          <div className="flex justify-center mt-16">
            <div style={{ width: '70vw' }}>
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#E0E2E7]">
                {/* Browser bar */}
                <div className="bg-white px-4 py-3 border-b border-[#E0E2E7] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-[#EF5350] rounded-full"></div>
                      <div className="w-3 h-3 bg-[#FFC107] rounded-full"></div>
                      <div className="w-3 h-3 bg-[#26A69A] rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#787B86]">
                      <span className="bg-white text-black px-2 py-1 rounded text-xs font-medium border border-[#E0E2E7]">Escrow #ESC-4829</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#26A69A] font-medium">● Funded</span>
                    <button className="text-xs text-[#2962FF] font-medium">View Details</button>
                  </div>
                </div>
                
                {/* Main dashboard */}
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-56 bg-[#F8F9FD] border-r border-[#E0E2E7] p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-black bg-white rounded-lg">
                        <span className="text-[#787B86]">▶</span> Active Escrows
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#787B86] hover:bg-white rounded-lg transition-colors cursor-pointer">
                        <span className="text-[#787B86]">✓</span> Completed
                        <span className="ml-auto text-xs bg-white px-2 py-0.5 rounded border border-[#E0E2E7]">24</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#787B86] hover:bg-white rounded-lg transition-colors cursor-pointer">
                        <span className="text-[#787B86]">◷</span> Pending
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#787B86] hover:bg-white rounded-lg transition-colors cursor-pointer">
                        <span className="text-[#787B86]">$</span> Payouts
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#787B86] hover:bg-white rounded-lg transition-colors cursor-pointer">
                        <span className="text-[#787B86]">◈</span> Reports
                      </div>
                    </div>
                  </div>
                  
                  {/* Main content */}
                  <div className="flex-1 p-8">
                    <div className="mb-8">
                      <h2 className="text-xl font-normal text-black mb-6">Current Escrow</h2>
                      
                      <div className="flex gap-2 mb-8">
                        <button className="px-4 py-2 bg-[#2962FF] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#1E53E5] transition-colors">
                          <span>✓</span> Approve Release
                        </button>
                        <button className="px-4 py-2 bg-white border border-[#E0E2E7] text-[#787B86] rounded-lg text-sm hover:border-[#787B86] transition-colors">Request Partial</button>
                        <button className="px-4 py-2 bg-white border border-[#E0E2E7] text-[#787B86] rounded-lg text-sm hover:border-[#787B86] transition-colors">Message</button>
                        <button className="px-4 py-2 bg-white border border-[#E0E2E7] text-[#787B86] rounded-lg text-sm hover:border-[#787B86] transition-colors">Dispute</button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <div className="text-sm text-[#787B86] mb-3">Escrow Balance</div>
                          <div className="text-3xl font-light text-black mb-2">
                            $3,500<sup className="text-lg">.00</sup>
                          </div>
                          <div className="text-sm text-[#787B86]">
                            <span className="text-[#26A69A]">Funded</span> • 
                            <span className="ml-2">Created 2 days ago</span>
                          </div>
                          
                          {/* Status timeline */}
                          <div className="mt-6 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#26A69A] rounded-full flex items-center justify-center text-white text-xs">✓</div>
                              <span className="text-xs text-[#787B86]">Created</span>
                            </div>
                            <div className="flex-1 h-1 bg-[#26A69A]"></div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#26A69A] rounded-full flex items-center justify-center text-white text-xs">✓</div>
                              <span className="text-xs text-[#787B86]">Funded</span>
                            </div>
                            <div className="flex-1 h-1 bg-[#E0E2E7]"></div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#E0E2E7] rounded-full flex items-center justify-center text-[#787B86] text-xs">3</div>
                              <span className="text-xs text-[#787B86]">Approved</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-5 border border-[#E0E2E7]">
                            <div className="text-sm text-[#787B86] mb-1">From</div>
                            <div className="text-base text-black font-medium">TechStartup Inc.</div>
                            <div className="text-sm text-[#787B86]">client@techstartup.com</div>
                          </div>
                          <div className="bg-white rounded-lg p-5 border border-[#E0E2E7]">
                            <div className="text-sm text-[#787B86] mb-1">To</div>
                            <div className="text-base text-black font-medium">Sarah Johnson</div>
                            <div className="text-sm text-[#787B86]">sarah@designstudio.com</div>
                          </div>
                          <div className="bg-white rounded-lg p-5 border border-[#E0E2E7]">
                            <div className="text-sm text-[#787B86] mb-1">Your Payout (after 1.99% fee)</div>
                            <div className="text-xl font-light text-black">$3,430<sup className="text-xs">.35</sup></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom bar */}
                <div className="bg-[#F8F9FD] text-[#787B86] text-xs px-4 py-2 text-center border-t border-[#E0E2E7]">
                  Secured by smart contracts on Polygon blockchain escrowhaven never holds your funds.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section below hero - Escrow lifecycle */}
      <div className="py-20 border-t border-[#E0E2E7]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-normal text-black mb-3">
              Payments that protect both sides.
            </h2>
            <p className="text-base text-[#787B86] mb-6">
              Clients keep control until work is approved. Freelancers know payment is secured from day one.
            </p>
          </div>
          
          {/* Circular diagram placeholder - Escrow lifecycle */}
          <div className="flex justify-center mt-16">
            <div className="relative w-96 h-96 bg-white rounded-full border border-[#E0E2E7] flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-medium text-black mb-2">Escrow</div>
                <div className="text-sm text-[#787B86]">Lifecycle</div>
              </div>
              {/* Orbital elements */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-lg border border-[#E0E2E7] flex items-center justify-center shadow-sm">
                <span className="text-xs text-[#787B86]">Create</span>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-20 h-20 bg-white rounded-lg border border-[#E0E2E7] flex items-center justify-center shadow-sm">
                <span className="text-xs text-[#787B86]">Fund</span>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-lg border border-[#E0E2E7] flex items-center justify-center shadow-sm">
                <span className="text-xs text-[#787B86]">Deliver</span>
              </div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-20 h-20 bg-white rounded-lg border border-[#E0E2E7] flex items-center justify-center shadow-sm">
                <span className="text-xs text-[#787B86]">Approve</span>
              </div>
              <div className="absolute top-24 right-24 w-20 h-20 bg-[#26A69A] rounded-lg flex items-center justify-center text-white shadow-sm">
                <span className="text-xs font-medium">Release</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
