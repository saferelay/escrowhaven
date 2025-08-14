'use client';

export function Accounting() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* QuickBooks placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E0E0E0]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#26A69A] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">QB</span>
                </div>
                <span className="text-lg font-medium">QuickBooks Online</span>
                <span className="ml-auto text-sm text-[#26A69A]">Connected</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[#E0E0E0]">
                  <span className="text-sm text-[#787878]">Sync Status</span>
                  <span className="text-sm text-[#26A69A]">Live</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#E0E0E0]">
                  <span className="text-sm text-[#787878]">Last Sync</span>
                  <span className="text-sm text-black">2 minutes ago</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-[#787878]">Transactions</span>
                  <span className="text-sm text-black">1,347 synced</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-normal text-black mb-6">
              Close the books quickly and accurately
            </h2>
            
            <a href="#" className="text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors inline-block mb-8">
              Explore Accounting Automations →
            </a>
            
            <ul className="space-y-4 text-[#787878]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Sync transactions to QuickBooks, NetSuite, or Xero</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Create rules to code card transactions and expenses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>See all your bills, cards, employee expenses, and incoming transactions in one place</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Easily review transactions with in-line receipts and notes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
