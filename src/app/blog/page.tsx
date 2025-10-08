// src/app/blog/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - EscrowHaven',
  description: 'Latest updates from EscrowHaven',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header spacing consistent with design system */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        {/* H1 - 56px, weight 400, line-height 1.1 */}
        <h1 className="text-[56px] font-normal text-black leading-[1.1] mb-6">
          Blog
        </h1>
        
        {/* Body Large - 18px for emphasis */}
        <p className="text-lg text-[#787B86] leading-relaxed mb-8 max-w-2xl">
          Coming Soon - Check back for updates about EscrowHaven, blockchain escrow, and the future of secure payments.
        </p>
        
        {/* Body text - 16px */}
        <p className="text-base text-[#787B86] leading-relaxed">
          For immediate assistance, contact us at{' '}
          <a 
            href="mailto:hello@escrowhaven.io" 
            className="text-[#2962FF] hover:text-[#1E53E5] transition-colors"
          >
            hello@escrowhaven.io
          </a>
        </p>
      </div>
    </div>
  );
}