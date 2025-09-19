// src/components/marketing/sections/Pricing.tsx - WITH SIGNUP CTA
'use client';

import { useRouter } from 'next/navigation';

export function Pricing() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <div id="pricing" className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl lg:text-5xl font-normal text-center text-black mb-6">
          Simple, fair pricing
        </h2>
        <p className="text-center text-base text-[#787B86] mb-16">
          Keep more of what you earn — pay only when money moves.
        </p>
        
        <div className="grid lg:grid-cols-1 gap-8 max-w-lg mx-auto">
          <div className="bg-white border border-[#E0E2E7] rounded-xl p-10">
            <h3 className="text-2xl font-medium text-black mb-2">escrowhaven Pay-per-use</h3>
            <p className="text-3xl text-black mb-6">$0/month</p>
            <ul className="space-y-3 text-sm text-[#787B86] mb-8">
              <li>• 1.99% platform fee (only on release)</li>
              <li>• Payment processing fees by Stripe and Onramp.money apply</li>
              <li>• Instant payout via Onramp.money</li>
              <li>• Unlimited escrows</li>
              <li>• Email support</li>
            </ul>
            <button 
              onClick={handleSignup}
              className="w-full py-3 bg-[#2962FF] text-white rounded-lg text-base font-medium hover:bg-[#1E53E5] transition-colors"
            >
              Start Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}