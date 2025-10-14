// src/components/marketing/sections/HowItWorksIllustrated.tsx
'use client';

// Clean, modern SVG illustrations matching dashboard aesthetic
const PaymentIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="w-full h-full">
    {/* Background card */}
    <rect x="50" y="60" width="300" height="180" rx="12" fill="#F8F9FD" stroke="#E0E2E7" strokeWidth="1.5"/>
    
    {/* Credit card */}
    <rect x="80" y="90" width="160" height="100" rx="8" fill="white" stroke="#E0E2E7" strokeWidth="1.5"/>
    <rect x="95" y="110" width="130" height="8" rx="4" fill="#E0E2E7"/>
    <rect x="95" y="130" width="80" height="8" rx="4" fill="#E0E2E7"/>
    <rect x="95" y="150" width="100" height="8" rx="4" fill="#E0E2E7"/>
    <circle cx="215" cy="140" r="20" fill="#2962FF" opacity="0.1"/>
    <circle cx="215" cy="140" r="12" fill="#2962FF"/>
    <path d="M210 140L213 143L220 136" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Arrow pointing right */}
    <path d="M260 140L290 140M290 140L280 130M290 140L280 150" stroke="#2962FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Dollar signs floating */}
    <text x="310" y="120" fill="#26A69A" fontSize="24" fontFamily="system-ui" fontWeight="600">$</text>
    <text x="320" y="160" fill="#26A69A" fontSize="20" fontFamily="system-ui" fontWeight="600">$</text>
  </svg>
);

const VaultIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="w-full h-full">
    {/* Vault container */}
    <rect x="100" y="50" width="200" height="200" rx="16" fill="#F8F9FD" stroke="#E0E2E7" strokeWidth="2"/>
    
    {/* Vault door */}
    <circle cx="200" cy="150" r="70" fill="white" stroke="#E0E2E7" strokeWidth="2"/>
    <circle cx="200" cy="150" r="60" fill="#F8F9FD" stroke="#E0E2E7" strokeWidth="1.5"/>
    
    {/* Lock mechanism */}
    <circle cx="200" cy="150" r="35" fill="white" stroke="#2962FF" strokeWidth="2"/>
    <rect x="190" y="145" width="20" height="25" rx="3" fill="#2962FF"/>
    <circle cx="200" cy="153" r="3" fill="white"/>
    
    {/* Security indicators */}
    <circle cx="150" cy="100" r="4" fill="#26A69A"/>
    <circle cx="250" cy="100" r="4" fill="#26A69A"/>
    <circle cx="150" cy="200" r="4" fill="#26A69A"/>
    <circle cx="250" cy="200" r="4" fill="#26A69A"/>
    
    {/* Shield icon */}
    <path d="M200 120L185 128V140C185 148 191 154 200 158C209 154 215 148 215 140V128L200 120Z" 
          fill="#2962FF" opacity="0.1" stroke="#2962FF" strokeWidth="1.5"/>
  </svg>
);

const ReleaseIllustration = () => (
  <svg viewBox="0 0 400 300" fill="none" className="w-full h-full">
    {/* Central burst */}
    <circle cx="200" cy="150" r="80" fill="#26A69A" opacity="0.05"/>
    <circle cx="200" cy="150" r="60" fill="#26A69A" opacity="0.08"/>
    <circle cx="200" cy="150" r="40" fill="#26A69A" opacity="0.1"/>
    
    {/* Lightning bolt / instant symbol */}
    <path d="M210 120L190 155H200L190 180L220 145H205L210 120Z" 
          fill="#26A69A" stroke="#26A69A" strokeWidth="2" strokeLinejoin="round"/>
    
    {/* Speed lines */}
    <path d="M140 150L100 150" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    <path d="M260 150L300 150" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    <path d="M160 190L130 210" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    <path d="M240 110L270 90" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    
    {/* Checkmarks */}
    <circle cx="150" cy="120" r="12" fill="white" stroke="#26A69A" strokeWidth="1.5"/>
    <path d="M145 120L148 123L155 116" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    
    <circle cx="250" cy="180" r="12" fill="white" stroke="#26A69A" strokeWidth="1.5"/>
    <path d="M245 180L248 183L255 176" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function HowItWorksIllustrated() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-10">
          How EscrowHaven works
        </h2>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="rounded-2xl border border-black/5 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white">
            <div className="relative aspect-[4/3] rounded-xl bg-[#F4F6FB] overflow-hidden border border-black/5">
              <PaymentIllustration />
            </div>
            <h3 className="mt-5 text-xl md:text-2xl font-semibold">Client pays</h3>
            <p className="mt-2 text-[#5A5F6A]">Buyer funds the project up front with a familiar checkout.</p>
          </div>
          
          <div className="rounded-2xl border border-black/5 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white">
            <div className="relative aspect-[4/3] rounded-xl bg-[#F4F6FB] overflow-hidden border border-black/5">
              <VaultIllustration />
            </div>
            <h3 className="mt-5 text-xl md:text-2xl font-semibold">Funds lock</h3>
            <p className="mt-2 text-[#5A5F6A]">Money sits safely in an escrow vault—nobody can pull it alone.</p>
          </div>
          
          <div className="rounded-2xl border border-black/5 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white">
            <div className="relative aspect-[4/3] rounded-xl bg-[#F4F6FB] overflow-hidden border border-black/5">
              <ReleaseIllustration />
            </div>
            <h3 className="mt-5 text-xl md:text-2xl font-semibold">Instant release</h3>
            <p className="mt-2 text-[#5A5F6A]">When both approve, funds release immediately to the freelancer.</p>
          </div>
        </div>
      </div>
    </section>
  );
}