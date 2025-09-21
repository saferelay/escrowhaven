// src/components/marketing/sections/Comparison.tsx
'use client';

export function Comparison() {
  return (
    <div className="py-12 sm:py-16 lg:py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-black mb-4 lg:mb-6">
            Compare what matters
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#787B86] max-w-3xl mx-auto px-4">
            See why freelancers are switching to escrowhaven
          </p>
        </div>

        {/* Mobile: Show key metrics only */}
        <div className="block sm:hidden mb-8">
          <div className="bg-[#2962FF] text-white rounded-xl p-6 mb-4">
            <h3 className="text-lg font-medium mb-4">escrowhaven</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm opacity-90">You keep</span>
                <span className="text-lg font-medium">98.01%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Get paid in</span>
                <span className="text-lg font-medium">24-48h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Chargeback protection</span>
                <span className="text-lg font-medium">100%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-[#E0E2E7] rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4 text-[#787B86]">Other Platforms</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#787B86]">You keep</span>
                <span className="text-lg font-medium text-[#787B86]">80-90%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#787B86]">Get paid in</span>
                <span className="text-lg font-medium text-[#787B86]">5-14 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#787B86]">Chargeback protection</span>
                <span className="text-lg font-medium text-[#EF5350]">Limited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet: Full table */}
        <div className="hidden sm:block overflow-x-auto -mx-4 sm:-mx-6 lg:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-6 lg:px-0">
            <table className="w-full min-w-[700px] bg-white border border-[#E0E2E7] rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#F8F9FD] border-b border-[#E0E2E7]">
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-black"></th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-white bg-[#2962FF]">
                    escrowhaven
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-black">
                    Upwork
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-black">
                    Fiverr
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-black">
                    PayPal Direct
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E2E7]">
                <tr className="hover:bg-[#F8F9FD]">
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-black">You keep</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">98.01%</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">80-90%</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">80%</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">97.1%</td>
                </tr>
                <tr className="hover:bg-[#F8F9FD]">
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-black">Get paid in</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">24-48 hours</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">5-14 days</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">14 days</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Instant*</td>
                </tr>
                <tr className="hover:bg-[#F8F9FD]">
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-black">Chargeback protection</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">100%</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Limited</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Limited</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#EF5350]">None</td>
                </tr>
                <tr className="hover:bg-[#F8F9FD]">
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-black">Client payment options</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">All major cards</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Platform wallet</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Platform wallet</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">PayPal balance</td>
                </tr>
                <tr className="hover:bg-[#F8F9FD]">
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-black">Work with any client</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">Yes</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Platform only</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Platform only</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#26A69A]">Yes</td>
                </tr>
                <tr className="hover:bg-[#F8F9FD]">
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-black">Dispute resolution</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">Settlement tools</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Platform decides</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Platform decides</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-center text-[#787B86]">Buyer favored</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-xs text-[#787B86] text-center mt-4">
          *PayPal instant but with 180-day chargeback window
        </p>
      </div>
    </div>
  );
}