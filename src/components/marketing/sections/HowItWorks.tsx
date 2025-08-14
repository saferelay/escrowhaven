'use client';

export function HowItWorks() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-normal text-black mb-6">
            How SafeRelay works
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-white border-2 border-[#2962FF] rounded-full flex items-center justify-center text-2xl font-medium text-[#2962FF] mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Create Escrow</h3>
            <p className="text-sm text-[#787B86]">
              Enter amount, email, and terms.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white border-2 border-[#2962FF] rounded-full flex items-center justify-center text-2xl font-medium text-[#2962FF] mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Fund Securely</h3>
            <p className="text-sm text-[#787B86]">
              Client pays via card, bank, or wallet — funds lock in smart contract.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white border-2 border-[#2962FF] rounded-full flex items-center justify-center text-2xl font-medium text-[#2962FF] mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Deliver & Approve</h3>
            <p className="text-sm text-[#787B86]">
              Freelancer delivers work, client approves.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-[#26A69A] rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
              ✓
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Instant Release</h3>
            <p className="text-sm text-[#787B86]">
              Funds arrive within minutes via Transak.
            </p>
          </div>
        </div>
        
        {/* Feature cards - WHITE background with border */}
        <div className="bg-white rounded-xl p-8 border border-[#E0E2E7]">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#2962FF] rounded-lg flex items-center justify-center text-white font-medium mx-auto mb-3">
                SC
              </div>
              <h4 className="font-medium text-black mb-2">Secured by Code</h4>
              <p className="text-sm text-[#787B86]">
                Smart contracts that no one can override
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#2962FF] rounded-lg flex items-center justify-center text-white font-medium mx-auto mb-3">
                MA
              </div>
              <h4 className="font-medium text-black mb-2">Mutual Agreement</h4>
              <p className="text-sm text-[#787B86]">
                Both parties must approve to release
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#2962FF] rounded-lg flex items-center justify-center text-white font-medium mx-auto mb-3">
                IS
              </div>
              <h4 className="font-medium text-black mb-2">Instant Settlement</h4>
              <p className="text-sm text-[#787B86]">
                No waiting, no holds, no delays
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
