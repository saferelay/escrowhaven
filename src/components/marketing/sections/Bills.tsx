'use client';

export function Bills() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-normal text-black mb-6">
              Handle all your bills with precision
            </h2>
            
            <a href="#" className="text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors inline-block mb-8">
              Explore Bill Pay →
            </a>
            
            <ul className="space-y-4 text-[#787B86]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Hold your money for longer by eliminating third-party processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Harness AI to populate bill details for you</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Set multi-layered approvals and approve payments instantly via Slack</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Never overpay with duplicate bill detection</span>
              </li>
            </ul>
          </div>
          
          <div>
            {/* Bill Pay Demo placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-[#E0E2E7]">
              <div className="text-center text-[#787B86] mb-6">Bill Pay Demo</div>
              <div className="space-y-4">
                <div className="h-12 bg-[#F8F9FD] rounded border border-[#E0E2E7]"></div>
                <div className="h-12 bg-[#F8F9FD] rounded border border-[#E0E2E7]"></div>
                <div className="h-12 bg-[#F8F9FD] rounded border border-[#E0E2E7]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
