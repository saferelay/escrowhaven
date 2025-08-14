'use client';

export function Transparency() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* Blockchain explorer screenshot with escrow transaction highlighted */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E0E2E7]">
              <div className="bg-[#F8F9FD] px-4 py-3 border-b border-[#E0E2E7]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-[#EF5350] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#FFC107] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#26A69A] rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-[#787B86]">polygonscan.com/tx/0x742d35...</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787B86]">Transaction Hash</span>
                    <span className="font-mono text-black">0x742d35Cc6634...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787B86]">Status</span>
                    <span className="text-[#26A69A] font-medium">✓ Success</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787B86]">Block</span>
                    <span className="text-black">48,329,102</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787B86]">From</span>
                    <span className="font-mono text-black text-xs">0xClient...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787B86]">To</span>
                    <span className="font-mono text-black text-xs">0xEscrow...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#787B86]">Value</span>
                    <span className="text-black font-medium">5,000 USDC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-normal text-black mb-6">
              Full transparency, every time
            </h2>
            
            <p className="text-[#787B86] mb-8">
              Every EscrowHaven payment has a verifiable on-chain record. Nothing can be altered, reversed, or hidden.
            </p>
            
            <ul className="space-y-4 text-[#787B86]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Immutable smart contract storage</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Email and in-app notifications for every action</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Downloadable receipts for records and compliance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Public verification via Polygon blockchain</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
