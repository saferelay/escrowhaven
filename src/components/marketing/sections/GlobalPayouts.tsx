'use client';

export function GlobalPayouts() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-normal text-black mb-6">
              Global payouts without the wait
            </h2>
            
            <p className="text-[#787B86] mb-8">
              Whether local or cross-border, funds release instantly when both sides approve. No 14–30 day delays.
            </p>
            
            <ul className="space-y-4 text-[#787B86]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Keep 98% of your earnings (1.99% platform fee)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Withdraw to 150+ countries via Transak</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>No arbitrary holds — payments arrive in hours, not weeks</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>All transactions final unless both sides agree otherwise</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Track everything in one place</span>
              </li>
            </ul>
          </div>
          
          <div>
            {/* Payout destinations card */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-[#E0E2E7]">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black mb-2">Instant Global Payouts</h3>
                <p className="text-sm text-[#787B86]">Available in 150+ countries</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F8F9FD] rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-black">Instant Release</div>
                    <div className="text-xs text-[#787B86]">Upon approval</div>
                  </div>
                  <span className="text-sm text-[#26A69A] font-medium">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#F8F9FD] rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-black">Direct to Bank</div>
                    <div className="text-xs text-[#787B86]">Via Transak</div>
                  </div>
                  <span className="text-sm text-[#26A69A] font-medium">Available</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#F8F9FD] rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-black">Card Payouts</div>
                    <div className="text-xs text-[#787B86]">Coming soon</div>
                  </div>
                  <span className="text-sm text-[#787B86]">Q1 2025</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E0E2E7]">
                <div className="text-center">
                  <div className="text-2xl font-light text-black mb-1">98.01%</div>
                  <div className="text-sm text-[#787B86]">You keep of every payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
