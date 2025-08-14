'use client';

export function Expenses() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-normal text-black mb-6">
              Control spend effortlessly at any size
            </h2>
            
            <a href="#" className="text-[#2962FF] font-medium hover:text-[#1E53E5] transition-colors inline-block mb-8">
              Manage Expenses →
            </a>
            
            <ul className="space-y-4 text-[#787B86]">
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Issue corporate cards and reimburse expenses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Tailor permissions to each team member</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Lock cards to specific merchants</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Easily spot duplicate subscriptions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#26A69A]">→</span>
                <span>Set company-wide spend policies in minutes</span>
              </li>
            </ul>
          </div>
          
          <div>
            {/* Corporate card placeholder */}
            <div className="bg-[#2962FF] rounded-2xl p-8 h-56 relative overflow-hidden shadow-lg">
              <div className="absolute top-6 right-6">
                <div className="text-white text-lg font-bold">IO</div>
              </div>
              <div className="absolute bottom-8 left-8">
                <div className="text-white/80 text-sm mb-4">•••• •••• •••• 1242</div>
                <div className="text-white text-lg font-medium mb-1">ERICA MARQUEZ</div>
                <div className="text-white/80 text-sm">12/25</div>
              </div>
              <div className="absolute bottom-8 right-8">
                <div className="w-12 h-8 bg-white/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
