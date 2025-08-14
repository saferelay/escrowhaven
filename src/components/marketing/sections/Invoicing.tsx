'use client';

export function Invoicing() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* Invoice placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E0E0E0]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-normal text-black mb-2">Invoice</h3>
                  <p className="text-sm text-[#787878]">TechVista Solutions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#787878]">Invoice #005</p>
                  <p className="text-sm text-[#787878]">Feb 10, 2024</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b border-[#E0E0E0]">
                  <span className="text-sm text-[#787878]">Design Services</span>
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
              Seamless invoicing for you and your customers
            </h2>
            
            <a href="#" className="text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors inline-block mb-8">
              Explore Invoicing →
            </a>
            
            <ul className="space-y-4 text-[#787878]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Generate polished invoices in minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Get paid by credit card, Apple Pay, Google Pay, wire, ACH transfer, and ACH debit for subscribers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Easily send recurring invoices and payment reminders</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Simplify reconciliation with automatically matched payments and invoices</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
