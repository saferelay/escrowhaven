// src/components/marketing/sections/Comparison.tsx
'use client';

export function Comparison() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-black mb-6">
            Compare what matters
          </h2>
          <p className="text-xl text-[#787B86] max-w-3xl mx-auto">
            See why freelancers are switching to escrowhaven
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-[#E0E2E7] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F8F9FD] border-b border-[#E0E2E7]">
                <th className="px-6 py-4 text-left text-sm font-medium text-black"></th>
                <th className="px-6 py-4 text-center text-sm font-medium text-white bg-[#2962FF]">
                  escrowhaven
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-black">
                  Upwork
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-black">
                  Fiverr
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-black">
                  PayPal Direct
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E2E7]">
              <tr className="hover:bg-[#F8F9FD]">
                <td className="px-6 py-4 text-sm font-medium text-black">You keep</td>
                <td className="px-6 py-4 text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">98.01%</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">80-90%</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">80%</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">97.1%</td>
              </tr>
              <tr className="hover:bg-[#F8F9FD]">
                <td className="px-6 py-4 text-sm font-medium text-black">Get paid in</td>
                <td className="px-6 py-4 text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">24-48 hours</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">5-14 days</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">14 days</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Instant*</td>
              </tr>
              <tr className="hover:bg-[#F8F9FD]">
                <td className="px-6 py-4 text-sm font-medium text-black">Chargeback protection</td>
                <td className="px-6 py-4 text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">100%</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Limited</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Limited</td>
                <td className="px-6 py-4 text-sm text-center text-[#EF5350]">None</td>
              </tr>
              <tr className="hover:bg-[#F8F9FD]">
                <td className="px-6 py-4 text-sm font-medium text-black">Client payment options</td>
                <td className="px-6 py-4 text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">All major cards</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Platform wallet</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Platform wallet</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">PayPal balance</td>
              </tr>
              <tr className="hover:bg-[#F8F9FD]">
                <td className="px-6 py-4 text-sm font-medium text-black">Work with any client</td>
                <td className="px-6 py-4 text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">Yes</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Platform only</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Platform only</td>
                <td className="px-6 py-4 text-sm text-center text-[#26A69A]">Yes</td>
              </tr>
              <tr className="hover:bg-[#F8F9FD]">
                <td className="px-6 py-4 text-sm font-medium text-black">Dispute resolution</td>
                <td className="px-6 py-4 text-sm text-center font-medium text-[#26A69A] bg-[#F8F9FD]">Settlement tools</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Platform decides</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Platform decides</td>
                <td className="px-6 py-4 text-sm text-center text-[#787B86]">Buyer favored</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-[#787B86] text-center mt-4">
          *PayPal instant but with 180-day chargeback window
        </p>
      </div>
    </div>
  );
}