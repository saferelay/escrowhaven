// src/components/marketing/sections/PaymentMethods.tsx
'use client';

export function PaymentMethods() {
  return (
    <div className="py-12 sm:py-16 lg:py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-black mb-4 lg:mb-6">
            Pay any way. Get paid anywhere.
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#787B86] max-w-3xl mx-auto px-4">
            Clients pay with their preferred method. Freelancers withdraw to their bank in 170+ countries.
          </p>
        </div>

        {/* Fund Escrow Widget */}
        <div className="max-w-md mx-auto mb-12 px-4 sm:px-0">
          <div className="bg-white rounded-xl border border-[#E0E2E7] p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-normal text-black mb-6">Fund Escrow</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs sm:text-sm text-[#787B86] block mb-2">Amount</label>
                <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg px-4 py-3 text-black text-sm sm:text-base">
                  $2,500.00 USD
                </div>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm text-[#787B86] block mb-2">To</label>
                <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg px-4 py-3 text-black text-sm sm:text-base">
                  designer@studio.com
                </div>
              </div>
            </div>
            
            <button className="w-full py-3 bg-[#2962FF] text-white rounded-lg text-sm sm:text-base font-medium mb-6">
              Continue to Payment
            </button>
            
            {/* Payment method logos */}
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-[#787B86] mb-3">Accepted payment methods</p>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs sm:text-sm text-[#787B86]">Visa</span>
                <span className="text-xs sm:text-sm text-[#787B86]">Mastercard</span>
                <span className="text-xs sm:text-sm text-[#787B86]">Apple Pay</span>
                <span className="text-xs sm:text-sm text-[#787B86]">Google Pay</span>
                <span className="text-xs sm:text-sm text-[#787B86]">Bank</span>
                <span className="text-xs sm:text-sm text-[#787B86]">+more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto px-4 sm:px-0">
          <div className="text-center">
            <h4 className="text-base sm:text-lg font-normal text-black mb-3">For Clients</h4>
            <p className="text-[#787B86] text-xs sm:text-sm mb-4">Pay in your local currency with:</p>
            <ul className="text-xs sm:text-sm text-[#787B86] space-y-2">
              <li>Credit/Debit cards (Visa, Mastercard, Amex)</li>
              <li>Digital wallets (Apple Pay, Google Pay)</li>
              <li>Bank transfers (ACH, SEPA, Wire)</li>
              <li>170+ currencies supported</li>
            </ul>
          </div>
          
          <div className="text-center">
            <h4 className="text-base sm:text-lg font-normal text-black mb-3">For Freelancers</h4>
            <p className="text-[#787B86] text-xs sm:text-sm mb-4">Withdraw to your bank account:</p>
            <ul className="text-xs sm:text-sm text-[#787B86] space-y-2">
              <li>24-48 hour processing</li>
              <li>Direct to bank in 170+ countries</li>
              <li>No minimum withdrawal</li>
              <li>Transparent forex rates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}