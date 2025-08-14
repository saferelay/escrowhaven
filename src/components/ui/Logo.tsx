// src/components/ui/Logo.tsx
export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield icon */}
        <path d="M10 8 L10 25 L20 30 L30 25 L30 8 Z" fill="#2563EB" />
        <path d="M20 14 L17 17 L19 19 L24 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Text */}
        <text x="38" y="26" fontSize="18" fontWeight="600" fill="#0F172A">SafeRelay</text>
      </svg>
    );
  }