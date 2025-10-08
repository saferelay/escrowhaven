// src/app/api-docs/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation - EscrowHaven',
  description: 'API documentation for EscrowHaven integration',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header spacing consistent with design system */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        {/* H1 - 56px, weight 400, line-height 1.1 */}
        <h1 className="text-[56px] font-normal text-black leading-[1.1] mb-6">
          API Documentation
        </h1>
        
        {/* Body Large - 18px for emphasis */}
        <p className="text-lg text-[#787B86] leading-relaxed mb-8 max-w-2xl">
          Coming Soon - Developer documentation for integrating EscrowHaven into your platform.
        </p>
        
        {/* Body text - 16px */}
        <p className="text-base text-[#787B86] leading-relaxed mb-6">
          For integration inquiries, contact us at{' '}
          <a 
            href="mailto:hello@escrowhaven.io" 
            className="text-[#2962FF] hover:text-[#1E53E5] transition-colors"
          >
            hello@escrowhaven.io
          </a>
        </p>
        
        {/* Optional: Add a subtle border section for visual interest */}
        <div className="mt-12 pt-12 border-t border-[#E0E2E7]">
          <h2 className="text-[30px] font-normal text-black leading-[1.3] mb-4">
            What to Expect
          </h2>
          <ul className="space-y-4 text-base text-[#787B86] leading-relaxed">
            <li>• RESTful API endpoints for escrow creation and management</li>
            <li>• Webhook integration for real-time transaction updates</li>
            <li>• SDKs for popular programming languages</li>
            <li>• Comprehensive code examples and tutorials</li>
          </ul>
        </div>
      </div>
    </div>
  );
}