// src/components/marketing/sections/Features.tsx - WITH SIGNUP CTAs
'use client';

import { useRouter } from 'next/navigation';

export function Features() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl lg:text-5xl font-normal text-center text-black mb-16">
          Complete any payment agreement in just a few clicks
        </h2>
        
        <p className="text-center text-[#787B86] max-w-3xl mx-auto mb-20 text-base leading-relaxed">
          "escrowhaven gives me the confidence to start projects without worrying about payment — and my clients feel safe funding them."
        </p>
        
        {/* Create Escrow mockup */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-[#E0E2E7] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#787B86]">Search</span>
                  <input 
                    type="text" 
                    placeholder="Create Escrow" 
                    className="flex-1 text-lg outline-none bg-[#F8F9FD] px-3 py-2 rounded border border-[#E0E2E7]"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-[#787B86] mb-2">Quick Actions</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded hover:bg-[#F8F9FD] cursor-pointer border border-[#E0E2E7]">
                      <span className="text-sm">Create new escrow</span>
                    </div>
                    <div className="p-3 bg-white rounded hover:bg-[#F8F9FD] cursor-pointer border border-[#E0E2E7]">
                      <span className="text-sm">Fund existing escrow</span>
                    </div>
                    <div className="p-3 bg-white rounded hover:bg-[#F8F9FD] cursor-pointer border border-[#E0E2E7]">
                      <span className="text-sm">View escrow details</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-12 border border-[#E0E2E7] shadow-sm">
            <h3 className="text-2xl font-normal text-black mb-4">
              Send and receive funds securely
            </h3>
            <p className="text-base text-[#787B86] mb-6">
              Create an escrow link, share it, and get paid or pay with the confidence that funds are locked until everyone agrees.
            </p>
            
            {/* Escrow creation form placeholder */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-[#E0E2E7]">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-[#787B86] mb-2">Amount</div>
                  <input type="text" value="$2,500.00" className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E2E7] rounded text-black" disabled />
                </div>
                <div>
                  <div className="text-sm text-[#787B86] mb-2">Recipient Email</div>
                  <input type="text" value="freelancer@email.com" className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E2E7] rounded text-black" disabled />
                </div>
                <button 
                  onClick={handleSignup}
                  className="w-full py-2 bg-[#2962FF] text-white rounded-lg font-medium"
                >
                  Create Escrow Link
                </button>
              </div>
            </div>
            
            <a href="#how-it-works" className="text-base text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors">
              Learn More →
            </a>
          </div>
          
          <div className="bg-white rounded-2xl p-12 border border-[#E0E2E7] shadow-sm">
            <h3 className="text-2xl font-normal text-black mb-4">
              Approve, refund, or settle anytime
            </h3>
            <p className="text-base text-[#787B86] mb-6">
              Need to release part of the funds? Issue a full refund? escrowhaven supports partial settlements and mutual agreements with gasless transactions.
            </p>
            
            {/* Release options mockup */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-[#E0E2E7]">
              <div className="space-y-3">
                <button className="w-full py-3 bg-[#26A69A] text-white rounded-lg text-sm font-medium">
                  Full Release ($2,500)
                </button>
                <button className="w-full py-3 bg-white text-[#787B86] border border-[#E0E2E7] rounded-lg text-sm">
                  Propose Settlement
                </button>
                <button className="w-full py-3 bg-white text-[#787B86] border border-[#E0E2E7] rounded-lg text-sm">
                  Full Refund
                </button>
              </div>
            </div>
            
            <a href="#pricing" className="text-base text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors">
              See Options →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
