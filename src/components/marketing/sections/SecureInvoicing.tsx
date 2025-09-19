// src/components/marketing/sections/SecureInvoicing.tsx
'use client';

export function SecureInvoicing() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* Invoice mockup */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-[#E0E2E7]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-normal text-black mb-2">Invoice</h3>
                  <p className="text-sm text-[#787B86]">TechVista Solutions</p>
                </div>
                <div className="text-right">
                  <div className="bg-[#26A69A] text-white px-3 py-1 rounded text-xs font-medium mb-2">
                    Secured in Escrow
                  </div>
                  <p className="text-sm text-[#787B86]">#INV-005</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b border-[#E0E2E7]">
                  <span className="text-sm text-[#787B86]">Design Services</span>
                  <span className="text-sm text-black">$5,000.00</span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-lg font-medium text-black">Total</span>
                <span className="text-lg font-medium text-black">$5,000.00</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-normal text-black mb-6">
              Request or send payment — escrow included
            </h2>
            
            <p className="text-[#787B86] mb-8">
              Turn any invoice into a secure escrow in one step. Your client pays as usual, but the funds stay protected until you release them.
            </p>
            
            <ul className="space-y-4 text-[#787B86]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Works with one-off invoices or recurring projects</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Clients pay in their currency, funds convert to stablecoin automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Protects against chargebacks and cancellations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Instant payout upon mutual approval</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
