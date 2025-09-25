// src/components/marketing/illustrations/index.tsx
'use client';

// Illustration for "Client pays" step
export const ClientPaysIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-6">
    <svg viewBox="0 0 320 240" className="w-full h-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Card shape */}
      <rect x="40" y="60" width="180" height="110" rx="12" fill="#2962FF" opacity="0.1"/>
      <rect x="40" y="60" width="180" height="110" rx="12" stroke="#2962FF" strokeWidth="2"/>
      
      {/* Card details */}
      <rect x="55" y="90" width="60" height="8" rx="4" fill="#2962FF" opacity="0.3"/>
      <rect x="55" y="105" width="40" height="6" rx="3" fill="#787B86" opacity="0.3"/>
      
      {/* Card numbers */}
      <circle cx="65" cy="130" r="4" fill="#2962FF" opacity="0.5"/>
      <circle cx="80" cy="130" r="4" fill="#2962FF" opacity="0.5"/>
      <circle cx="95" cy="130" r="4" fill="#2962FF" opacity="0.5"/>
      <circle cx="110" cy="130" r="4" fill="#2962FF" opacity="0.5"/>
      
      {/* Payment flow arrow */}
      <path d="M230 115 L260 115" stroke="#26A69A" strokeWidth="3" strokeLinecap="round"/>
      <path d="M255 110 L260 115 L255 120" stroke="#26A69A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Success checkmark circle */}
      <circle cx="280" cy="115" r="15" fill="#26A69A" opacity="0.1"/>
      <circle cx="280" cy="115" r="15" stroke="#26A69A" strokeWidth="2"/>
      <path d="M273 115 L277 119 L287 109" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

// Illustration for "Funds lock" step
export const FundsLockIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-6">
    <svg viewBox="0 0 320 240" className="w-full h-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Vault/safe shape */}
      <rect x="100" y="70" width="120" height="100" rx="8" fill="#2962FF" opacity="0.05"/>
      <rect x="100" y="70" width="120" height="100" rx="8" stroke="#2962FF" strokeWidth="2.5"/>
      
      {/* Lock mechanism */}
      <circle cx="160" cy="120" r="25" fill="#2962FF" opacity="0.1"/>
      <circle cx="160" cy="120" r="25" stroke="#2962FF" strokeWidth="2"/>
      
      {/* Lock shackle */}
      <path d="M145 120 L145 105 Q160 90 175 105 L175 120" stroke="#2962FF" strokeWidth="2.5" strokeLinecap="round"/>
      
      {/* Keyhole */}
      <circle cx="160" cy="118" r="4" fill="#2962FF"/>
      <rect x="158" y="118" width="4" height="10" fill="#2962FF"/>
      
      {/* Security lines */}
      <path d="M85 90 L95 90" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M85 120 L95 120" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M85 150 L95 150" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      
      <path d="M225 90 L235 90" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M225 120 L235 120" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M225 150 L235 150" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  </div>
);

// Illustration for "Instant release" step
export const InstantReleaseIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-6">
    <svg viewBox="0 0 320 240" className="w-full h-full max-w-[280px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lightning/speed effect */}
      <path d="M140 60 L120 110 L150 110 L130 160" stroke="#26A69A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      
      {/* Money/payment representation */}
      <circle cx="200" cy="120" r="35" fill="#26A69A" opacity="0.1"/>
      <circle cx="200" cy="120" r="35" stroke="#26A69A" strokeWidth="2"/>
      
      {/* Dollar sign */}
      <text x="200" y="130" fontSize="28" fill="#26A69A" textAnchor="middle" fontWeight="500">$</text>
      
      {/* Speed lines */}
      <path d="M155 105 L165 105" stroke="#2962FF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M155 120 L170 120" stroke="#2962FF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M155 135 L165 135" stroke="#2962FF" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      
      {/* Checkmark */}
      <circle cx="220" cy="140" r="12" fill="#26A69A"/>
      <path d="M214 140 L218 144 L226 136" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

// Illustration for freelancer benefits
export const FreelancerBenefitsIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4">
    <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield with checkmark */}
      <path d="M200 30 L240 50 L240 90 C240 120 220 145 200 155 C180 145 160 120 160 90 L160 50 Z" 
            fill="#26A69A" opacity="0.1" stroke="#26A69A" strokeWidth="2"/>
      <path d="M185 85 L195 95 L215 75" stroke="#26A69A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Money saved indicator */}
      <rect x="60" y="100" width="80" height="50" rx="8" fill="#2962FF" opacity="0.05" stroke="#2962FF" strokeWidth="1.5"/>
      <text x="100" y="130" fontSize="18" fill="#2962FF" textAnchor="middle" fontWeight="600">98%</text>
      <text x="100" y="145" fontSize="11" fill="#787B86" textAnchor="middle">kept</text>
      
      {/* Fast payment indicator */}
      <rect x="260" y="100" width="80" height="50" rx="8" fill="#2962FF" opacity="0.05" stroke="#2962FF" strokeWidth="1.5"/>
      <text x="300" y="130" fontSize="18" fill="#2962FF" textAnchor="middle" fontWeight="600">24h</text>
      <text x="300" y="145" fontSize="11" fill="#787B86" textAnchor="middle">payout</text>
    </svg>
  </div>
);

// Illustration for client benefits  
export const ClientBenefitsIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4">
    <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand with approval gesture */}
      <circle cx="200" cy="90" r="45" fill="#2962FF" opacity="0.05" stroke="#2962FF" strokeWidth="2"/>
      <path d="M185 90 L195 100 L215 80" stroke="#2962FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Control indicator */}
      <rect x="60" y="100" width="80" height="50" rx="8" fill="#26A69A" opacity="0.05" stroke="#26A69A" strokeWidth="1.5"/>
      <text x="100" y="130" fontSize="18" fill="#26A69A" textAnchor="middle" fontWeight="600">100%</text>
      <text x="100" y="145" fontSize="11" fill="#787B86" textAnchor="middle">control</text>
      
      {/* Protection indicator */}
      <rect x="260" y="100" width="80" height="50" rx="8" fill="#26A69A" opacity="0.05" stroke="#26A69A" strokeWidth="1.5"/>
      <text x="300" y="130" fontSize="18" fill="#26A69A" textAnchor="middle" fontWeight="600">$0</text>
      <text x="300" y="145" fontSize="11" fill="#787B86" textAnchor="middle">risk</text>
    </svg>
  </div>
);

// Dashboard preview illustration for "Keep more, get paid faster" section
export const ComparisonIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4 bg-[#F4F6FB] rounded-xl">
    <svg viewBox="0 0 400 225" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Comparison bars */}
      <text x="50" y="60" fontSize="12" fill="#787B86">Platform fees</text>
      
      {/* Escrowhaven bar */}
      <rect x="50" y="70" width="300" height="30" rx="4" fill="#E0E2E7"/>
      <rect x="50" y="70" width="6" height="30" rx="4" fill="#26A69A"/>
      <text x="65" y="90" fontSize="14" fill="#26A69A" fontWeight="600">1.99%</text>
      
      {/* Others bar */}
      <rect x="50" y="110" width="300" height="30" rx="4" fill="#E0E2E7"/>
      <rect x="50" y="110" width="60" height="30" rx="4" fill="#EF5350"/>
      <text x="120" y="130" fontSize="14" fill="#EF5350" fontWeight="600">20%</text>
      
      {/* Speed indicator */}
      <text x="50" y="170" fontSize="12" fill="#787B86">Payout speed</text>
      <div>
        <circle cx="70" cy="185" r="8" fill="#26A69A"/>
        <text x="90" y="190" fontSize="13" fill="#26A69A" fontWeight="500">24-48 hours</text>
      </div>
      <div>
        <circle cx="220" cy="185" r="8" fill="#787B86" opacity="0.3"/>
        <text x="240" y="190" fontSize="13" fill="#787B86">14-30 days</text>
      </div>
    </svg>
  </div>
);

// Updated "Keep more" metrics illustration
export const KeepMoreIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4 bg-[#F4F6FB] rounded-xl">
    <div className="text-center">
      <div className="mb-4">
        <span className="text-4xl font-bold text-[#26A69A]">98.01%</span>
        <p className="text-sm text-[#787B86] mt-1">You keep of every payment</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-lg p-3 border border-black/5">
          <p className="text-xs text-[#787B86]">On $1,000</p>
          <p className="text-lg font-semibold text-black">$980.10</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-black/5">
          <p className="text-xs text-[#787B86]">On $5,000</p>
          <p className="text-lg font-semibold text-black">$4,900.50</p>
        </div>
      </div>
    </div>
  </div>
);

// Faster payouts illustration
export const FasterPayoutsIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4 bg-[#F4F6FB] rounded-xl">
    <div className="w-full max-w-[300px]">
      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#E0E2E7]"></div>
        
        {/* Escrowhaven marker */}
        <div className="relative flex justify-between items-center">
          <div className="bg-white rounded-full p-2 border-2 border-[#26A69A]">
            <div className="w-3 h-3 bg-[#26A69A] rounded-full"></div>
          </div>
          <div className="bg-white rounded-full p-2 border-2 border-[#26A69A]">
            <svg className="w-4 h-4 text-[#26A69A]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="flex justify-between mt-2">
          <span className="text-xs text-[#787B86]">Approved</span>
          <span className="text-xs font-semibold text-[#26A69A]">24-48h</span>
        </div>
      </div>
      
      {/* Comparison */}
      <div className="mt-8 pt-4 border-t border-[#E0E2E7]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#787B86]">Others:</span>
          <span className="text-[#787B86]">14-30 days wait</span>
        </div>
      </div>
    </div>
  </div>
);