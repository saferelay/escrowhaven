// src/components/marketing/sections/BenefitsComparisonIllustrated.tsx
'use client';

// Dashboard-style illustration for freelancers
const FreelancerDashboard = () => (
  <svg viewBox="0 0 600 340" fill="none" className="w-full h-full">
    {/* Browser frame */}
    <rect x="0" y="0" width="600" height="340" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
    <rect x="0" y="0" width="600" height="32" rx="8" fill="#F8F9FD"/>
    <circle cx="16" cy="16" r="4" fill="#E0E2E7"/>
    <circle cx="32" cy="16" r="4" fill="#E0E2E7"/>
    <circle cx="48" cy="16" r="4" fill="#E0E2E7"/>
    
    {/* Metrics cards */}
    <rect x="20" y="52" width="170" height="80" rx="6" fill="white" stroke="#E0E2E7" strokeWidth="1"/>
    <text x="30" y="72" fontSize="11" fill="#64748B">Earnings</text>
    <text x="30" y="95" fontSize="20" fill="black" fontWeight="600">$18,265</text>
    <text x="30" y="115" fontSize="11" fill="#26A69A">↑ No chargebacks</text>
    
    <rect x="210" y="52" width="170" height="80" rx="6" fill="white" stroke="#E0E2E7" strokeWidth="1"/>
    <text x="220" y="72" fontSize="11" fill="#64748B">You Keep</text>
    <text x="220" y="95" fontSize="20" fill="black" fontWeight="600">98.01%</text>
    <text x="220" y="115" fontSize="11" fill="#2962FF">vs 80% elsewhere</text>
    
    <rect x="400" y="52" width="170" height="80" rx="6" fill="white" stroke="#E0E2E7" strokeWidth="1"/>
    <text x="410" y="72" fontSize="11" fill="#64748B">Payout Speed</text>
    <text x="410" y="95" fontSize="20" fill="black" fontWeight="600">24-48h</text>
    <text x="410" y="115" fontSize="11" fill="#26A69A">Instant release</text>
    
    {/* Transaction list */}
    <rect x="20" y="152" width="550" height="40" rx="4" fill="#F8F9FD"/>
    <circle cx="40" cy="172" r="8" fill="#26A69A" opacity="0.2"/>
    <text x="40" y="176" fontSize="10" fill="#26A69A" fontWeight="600" textAnchor="middle">✓</text>
    <text x="60" y="176" fontSize="12" fill="#0F172A">WordPress Development</text>
    <text x="500" y="176" fontSize="12" fill="#26A69A" fontWeight="600">+$2,800</text>
    
    <rect x="20" y="202" width="550" height="40" rx="4" fill="white"/>
    <circle cx="40" cy="222" r="8" fill="#26A69A" opacity="0.2"/>
    <text x="40" y="226" fontSize="10" fill="#26A69A" fontWeight="600" textAnchor="middle">✓</text>
    <text x="60" y="226" fontSize="12" fill="#0F172A">Logo Design Package</text>
    <text x="500" y="226" fontSize="12" fill="#26A69A" fontWeight="600">+$1,200</text>
    
    <rect x="20" y="252" width="550" height="40" rx="4" fill="white"/>
    <circle cx="40" cy="272" r="8" fill="#2962FF" opacity="0.2"/>
    <text x="40" y="276" fontSize="10" fill="#2962FF" fontWeight="600" textAnchor="middle">→</text>
    <text x="60" y="276" fontSize="12" fill="#0F172A">Blog Content (5 articles)</text>
    <text x="500" y="276" fontSize="12" fill="#0F172A">$850</text>
  </svg>
);

// Dashboard-style illustration for clients
const ClientDashboard = () => (
  <svg viewBox="0 0 600 340" fill="none" className="w-full h-full">
    {/* Browser frame */}
    <rect x="0" y="0" width="600" height="340" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
    <rect x="0" y="0" width="600" height="32" rx="8" fill="#F8F9FD"/>
    <circle cx="16" cy="16" r="4" fill="#E0E2E7"/>
    <circle cx="32" cy="16" r="4" fill="#E0E2E7"/>
    <circle cx="48" cy="16" r="4" fill="#E0E2E7"/>
    
    {/* Payment modal */}
    <rect x="100" y="80" width="400" height="220" rx="8" fill="white" stroke="#E0E2E7" strokeWidth="2" filter="drop-shadow(0 10px 25px rgba(0,0,0,0.1))"/>
    
    {/* Modal header */}
    <rect x="100" y="80" width="400" height="50" rx="8" fill="#F8F9FD"/>
    <text x="120" y="110" fontSize="16" fill="black" fontWeight="600">Fund Escrow</text>
    <text x="430" y="110" fontSize="14" fill="#2962FF" fontWeight="600">$3,500</text>
    
    {/* Progress bar */}
    <rect x="120" y="150" width="360" height="4" rx="2" fill="#E0E2E7"/>
    <rect x="120" y="150" width="240" height="4" rx="2" fill="#2962FF"/>
    
    {/* Checkmarks */}
    <g transform="translate(120, 170)">
      <circle cx="10" cy="10" r="10" fill="#26A69A" opacity="0.1"/>
      <path d="M5 10L8 13L15 6" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="28" y="14" fontSize="12" fill="#0F172A">Work guaranteed - approve before release</text>
    </g>
    
    <g transform="translate(120, 200)">
      <circle cx="10" cy="10" r="10" fill="#26A69A" opacity="0.1"/>
      <path d="M5 10L8 13L15 6" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="28" y="14" fontSize="12" fill="#0F172A">Pay with card, Apple Pay, or bank</text>
    </g>
    
    <g transform="translate(120, 230)">
      <circle cx="10" cy="10" r="10" fill="#26A69A" opacity="0.1"/>
      <path d="M5 10L8 13L15 6" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="28" y="14" fontSize="12" fill="#0F172A">Full refund option if work not delivered</text>
    </g>
    
    {/* CTA button */}
    <rect x="120" y="260" width="360" height="32" rx="6" fill="#2962FF"/>
    <text x="300" y="280" fontSize="14" fill="white" fontWeight="600" textAnchor="middle">Complete Payment</text>
  </svg>
);

export function BenefitsComparisonIllustrated() {
  return (
    <section className="py-16 md:py-24 bg-[#FAFBFD]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Freelancer Benefits */}
        <div className="md:col-span-6 rounded-2xl border border-black/5 bg-white p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
            Why freelancers love it
          </h2>
          <ul className="mt-6 space-y-4 text-[#3A3F47]">
            <li className="flex items-start gap-3">
              <span className="text-[#26A69A] text-xl">✓</span>
              <span>No chargebacks. Your pay can't be clawed back.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#26A69A] text-xl">✓</span>
              <span>Keep more of every invoice (not 20% platform cuts).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#26A69A] text-xl">✓</span>
              <span>Get paid fast — minutes, not weeks.</span>
            </li>
          </ul>
          
          <div className="mt-6 relative aspect-[16/9] rounded-xl bg-[#F4F6FB] border border-black/5 overflow-hidden">
            <FreelancerDashboard />
          </div>
        </div>
        
        {/* Client Benefits */}
        <div className="md:col-span-6 rounded-2xl border border-black/5 bg-white p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
            Why clients trust it
          </h2>
          <ul className="mt-6 space-y-4 text-[#3A3F47]">
            <li className="flex items-start gap-3">
              <span className="text-[#2962FF] text-xl">✓</span>
              <span>Only release funds when work is delivered.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2962FF] text-xl">✓</span>
              <span>Simple Stripe-style checkout — no crypto needed.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#2962FF] text-xl">✓</span>
              <span>Clear dispute path if something goes off-track.</span>
            </li>
          </ul>
          
          <div className="mt-6 relative aspect-[16/9] rounded-xl bg-[#F4F6FB] border border-black/5 overflow-hidden">
            <ClientDashboard />
          </div>
        </div>
        
      </div>
    </section>
  );
}