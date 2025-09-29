// src/app/privacy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | escrowhaven.io',
  description: 'escrowhaven privacy policy - how we collect, use, and protect your personal information on our blockchain escrow platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E0E2E7]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <a href="/" className="inline-block text-xl font-normal tracking-tight">
            <span className="text-black">escrowhaven</span>
            <span className="text-[#2962FF]">.io</span>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-normal text-black mb-8">Privacy Policy</h1>
        <div className="text-sm text-[#787B86] mb-12 pb-8 border-b border-[#E0E2E7]">
          <div className="font-medium text-black">Effective Date: September 1, 2025</div>
          <div className="font-medium text-black">Last Updated: September 1, 2025</div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-normal text-black mb-6">1. INTRODUCTION</h2>
            <p className="text-[#787B86] leading-relaxed mb-4">
              escrowhaven.io ("escrowhaven," "we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, share, and protect information when you use our blockchain-based escrow platform ("Platform").
            </p>
            <p className="text-[#787B86] leading-relaxed">
              <span className="font-medium text-black">By using our Platform, you agree to the collection and use of information in accordance with this Privacy Policy.</span>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">2. INFORMATION WE COLLECT</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">2.1 Information You Provide to Us</h3>
            
            <div className="mb-6">
              <p className="font-medium text-black mb-3">Account Information:</p>
              <ul className="space-y-2 text-[#787B86]">
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Email address (required for authentication)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Name and contact details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Business information (if applicable)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Payment information (processed by third parties)</span>
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="font-medium text-black mb-3">Transaction Information:</p>
              <ul className="space-y-2 text-[#787B86]">
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Escrow details (amounts, descriptions, terms)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Communication with other users through our Platform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Support requests and correspondence</span>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <p className="font-medium text-black mb-3">Identity Verification Information (when required):</p>
              <ul className="space-y-2 text-[#787B86]">
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Government-issued identification documents</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Proof of address</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Business registration documents</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Beneficial ownership information</span>
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-black mb-4">2.2 Information We Collect Automatically</h3>
            
            <div className="mb-6">
              <p className="font-medium text-black mb-3">Technical Information:</p>
              <ul className="space-y-2 text-[#787B86]">
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>IP address and location data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Browser type and version</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Operating system and device information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Unique device identifiers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Mobile network information</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">3. HOW WE USE YOUR INFORMATION</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">3.1 Primary Uses</h3>
            
            <div className="mb-6">
              <p className="font-medium text-black mb-3">Service Provision:</p>
              <ul className="space-y-2 text-[#787B86]">
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Creating and managing your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Processing escrow transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Deploying and managing smart contracts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Facilitating payments through our partners</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Providing customer support</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">4. HOW WE SHARE YOUR INFORMATION</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">4.1 Service Providers</h3>
            <p className="text-[#787B86] mb-4">
              We share information with trusted third-party service providers who help us operate our Platform:
            </p>
            <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-6">
              <ul className="space-y-2 text-[#787B86]">
                <li className="flex items-start">
                  <span className="text-[#2962FF] mr-2">•</span>
                  <span><span className="font-medium text-black">Stripe</span> (credit/debit card processing)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2962FF] mr-2">•</span>
                  <span><span className="font-medium text-black">Onramp.money</span> (bank transfers and alternative payments)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2962FF] mr-2">•</span>
                  <span><span className="font-medium text-black">Magic.link</span> (authentication services)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Cloud hosting providers (AWS, Google Cloud)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Analytics and monitoring services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>Customer support platforms</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">5. DATA SECURITY</h2>
            <p className="text-[#787B86] leading-relaxed mb-6">
              We implement appropriate technical and organizational security measures to protect your information including encryption of data in transit and at rest, secure cloud infrastructure with access controls, regular security audits, and multi-factor authentication for internal systems.
            </p>
            <p className="text-[#787B86] leading-relaxed">
              <span className="font-medium text-black">No Absolute Security:</span> While we implement strong security measures, no system is completely secure. We cannot guarantee absolute protection against unauthorized access, use, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">6. YOUR PRIVACY RIGHTS</h2>
            <p className="text-[#787B86] mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 text-[#787B86]">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Access:</span> Request copies of your personal information</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Correction:</span> Request correction of inaccurate information</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Deletion:</span> Request deletion of your information (subject to legal requirements)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Portability:</span> Request transfer of your information in a machine-readable format</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Objection:</span> Object to certain processing of your information</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Restriction:</span> Request limitation of processing under certain circumstances</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">7. CONTACT INFORMATION</h2>
            <p className="text-[#787B86] mb-4">
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-6">
              <div className="space-y-2">
                <p className="text-[#787B86]">
                  <span className="font-medium text-black">Email:</span> hello@escrowhaven.io
                </p>
                <p className="text-[#787B86]">
                  <span className="font-medium text-black">Subject Line:</span> Privacy Policy Inquiry
                </p>
                <p className="text-[#787B86]">
                  <span className="font-medium text-black">Response Time:</span> Within 72 hours
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-[#E0E2E7] pt-8 mt-16">
            <p className="text-sm text-[#B2B5BE]">
              This Privacy Policy is effective as of September 1, 2025, and applies to all information collected on or after this date.
              By using escrowhaven.io, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}