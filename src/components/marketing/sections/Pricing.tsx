'use client';

export function Pricing() {
  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl lg:text-5xl font-normal text-center text-black mb-6">
          Simple, fair pricing
        </h2>
        <p className="text-center text-base text-[#787B86] mb-16">
          Keep more of what you earn — pay only when money moves.
        </p>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-white border border-[#E0E2E7] rounded-xl p-10">
            <h3 className="text-2xl font-medium text-black mb-2">EscrowHaven Pay-As-You-Go</h3>
            <p className="text-3xl text-black mb-6">$0/month</p>
            <ul className="space-y-3 text-sm text-[#787B86] mb-8">
              <li>• 1.99% platform fee (only on release)</li>
              <li>• Standard payment processing fees apply (~1.5%–3.5%)</li>
              <li>• Instant payout via Transak</li>
              <li>• Unlimited escrows</li>
              <li>• Email support</li>
            </ul>
            <button className="w-full py-3 bg-[#2962FF] text-white rounded-lg text-base font-medium hover:bg-[#1E53E5] transition-colors">
              Start Free
            </button>
          </div>
          
          <div className="bg-white border-2 border-[#2962FF] rounded-xl p-10">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-medium text-black">EscrowHaven Pro</h3>
            </div>
            <p className="text-3xl text-black mb-6">$25/month</p>
            <ul className="space-y-3 text-sm text-[#787B86] mb-8">
              <li className="font-medium text-black">• Reduced platform fee: 1.25%</li>
              <li>• Priority support</li>
              <li>• Branded escrow pages</li>
              <li>• Advanced reporting</li>
              <li>• API access</li>
            </ul>
            <button className="w-full py-3 bg-[#2962FF] text-white rounded-lg text-base font-medium hover:bg-[#1E53E5] transition-colors">
              Start Pro Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
