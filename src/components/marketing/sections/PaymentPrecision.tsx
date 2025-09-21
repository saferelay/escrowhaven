// src/components/marketing/sections/PaymentPrecision.tsx
'use client';

export function PaymentPrecision() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-normal text-black mb-6">
              Handle every payment with precision
            </h2>
            
            <p className="text-[#787B86] mb-8">
              From milestone projects to single deliverables, escrowhaven ensures both sides agree before money moves.
            </p>
            
            <ul className="space-y-4 text-[#787B86]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Fund in minutes via Transak</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Release instantly with unique signatures</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Keep a full on-chain record of every transaction</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Never worry about chargebacks or delays</span>
              </li>
            </ul>
          </div>
          
          <div>
            {/* Escrow agreement view mockup */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-[#E0E2E7]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm bg-[#26A69A] text-white px-3 py-1 rounded-full">Funded</span>
                <span className="text-sm text-[#787B86]">#ESC-4829</span>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-[#E0E2E7]">
                  <span className="text-sm text-[#787B86]">Amount</span>
                  <span className="text-sm text-black font-medium">$3,500.00</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#E0E2E7]">
                  <span className="text-sm text-[#787B86]">Status</span>
                  <span className="text-sm text-[#26A69A] font-medium">Awaiting Approval</span>
                </div>
              </div>
              <button className="w-full py-3 bg-[#2962FF] text-white rounded-lg font-medium">
                Approve Release
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}