'use client';

export function Treasury() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-normal text-black mb-6">
            Your gateway to a longer runway
          </h2>
          <p className="text-lg text-[#787B86] max-w-3xl mx-auto">
            Accelerate your growth with Mercury Treasury<sup className="text-xs">2</sup> and financing options integrated directly with your account.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-10 border border-[#E0E2E7] shadow-sm">
            <h3 className="text-2xl font-normal text-black mb-4">
              Earn up to 4.27% yield<sup className="text-xs">7</sup> on your idle cash with portfolios powered by J.P. Morgan Asset Management and Morgan Stanley
            </h3>
            <div className="space-y-4 mt-8">
              <div>
                <p className="text-sm text-[#787B86] mb-2">Current Portfolio</p>
                <div className="flex items-center gap-4">
                  <div className="h-2 bg-[#2962FF] rounded" style={{ width: '75%' }}></div>
                  <span className="text-sm">75% J.P. Morgan</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="h-2 bg-[#787B86] rounded" style={{ width: '25%' }}></div>
                  <span className="text-sm">25% Morgan Stanley</span>
                </div>
              </div>
            </div>
            <button className="mt-8 text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors">
              Start Earning with Treasury →
            </button>
          </div>
          
          <div className="bg-white rounded-2xl p-10 border border-[#E0E2E7] shadow-sm">
            <div className="text-5xl font-light text-black mb-4">$9.6M</div>
            <p className="text-[#787B86] mb-8">Post-Money SAFE to John Marnie</p>
            <div className="space-y-3">
              <button className="px-6 py-2 bg-[#F8F9FD] text-black rounded-lg hover:bg-[#F0F2F5] transition-colors border border-[#E0E2E7]">
                Balance
              </button>
              <button className="px-6 py-2 bg-white text-[#787B86] border border-[#E0E2E7] rounded-lg hover:border-[#787B86] transition-colors ml-3">
                Draw Request
              </button>
            </div>
            <div className="mt-8">
              <p className="text-2xl text-black">$250,000.00</p>
              <p className="text-sm text-[#787B86] mt-2">Signed on Feb 7</p>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-normal text-black mb-4">
              Fuel your growth with startup-friendly Venture Debt
            </h3>
            <a href="#" className="text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors">
              Grow with Venture Debt →
            </a>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-normal text-black mb-4">
              Speed up your fundraise with free SAFEs
            </h3>
            <a href="#" className="text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors">
              Create a SAFE →
            </a>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-xl p-8 text-center border border-[#E0E2E7] shadow-sm">
            <h4 className="text-lg font-normal text-black mb-3">Building trust as a finance leader</h4>
            <a href="#" className="text-sm text-[#2962FF] hover:text-[#1E53E5] transition-colors">
              Read the Story →
            </a>
          </div>
          
          <div className="bg-white rounded-xl p-8 text-center border border-[#E0E2E7] shadow-sm">
            <h4 className="text-lg font-normal text-black mb-3">Carolynn Levy, inventor of the SAFE</h4>
            <a href="#" className="text-sm text-[#2962FF] hover:text-[#1E53E5] transition-colors">
              Read the Story →
            </a>
          </div>
          
          <div className="bg-white rounded-xl p-8 text-center border border-[#E0E2E7] shadow-sm">
            <h4 className="text-lg font-normal text-black mb-3">Sending international wires through SWIFT</h4>
            <a href="#" className="text-sm text-[#2962FF] hover:text-[#1E53E5] transition-colors">
              Read the Story →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
