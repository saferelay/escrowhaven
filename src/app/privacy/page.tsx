// src/app/privacy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | escrowhaven.io',
  description: 'escrowhaven privacy policy - how we collect, use, and protect your personal information on our blockchain escrow platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-normal text-black mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective Date: January 1, 2025</strong><br />
            <strong>Last Updated: January 1, 2025</strong>
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">1. INTRODUCTION</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            escrowhaven.io ("escrowhaven," "we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, share, and protect information when you use our blockchain-based escrow platform ("Platform").
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            <strong>By using our Platform, you agree to the collection and use of information in accordance with this Privacy Policy.</strong>
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">2. INFORMATION WE COLLECT</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">2.1 Information You Provide to Us</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Account Information:</strong>
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Email address (required for authentication)</li>
            <li>Name and contact details</li>
            <li>Business information (if applicable)</li>
            <li>Payment information (processed by third parties)</li>
          </ul>

          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Transaction Information:</strong>
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Escrow details (amounts, descriptions, terms)</li>
            <li>Communication with other users through our Platform</li>
            <li>Support requests and correspondence</li>
          </ul>

          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Identity Verification Information (when required):</strong>
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-8">
            <li>Government-issued identification documents</li>
            <li>Proof of address</li>
            <li>Business registration documents</li>
            <li>Beneficial ownership information</li>
          </ul>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">2.2 Information We Collect Automatically</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Technical Information:</strong>
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>IP address and location data</li>
            <li>Browser type and version</li>
            <li>Operating system and device information</li>
            <li>Unique device identifiers</li>
            <li>Mobile network information</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">3. HOW WE USE YOUR INFORMATION</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">3.1 Primary Uses</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Service Provision:</strong>
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Creating and managing your account</li>
            <li>Processing escrow transactions</li>
            <li>Deploying and managing smart contracts</li>
            <li>Facilitating payments through our partners</li>
            <li>Providing customer support</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">4. HOW WE SHARE YOUR INFORMATION</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">4.1 Service Providers</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We share information with trusted third-party service providers who help us operate our Platform:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li><strong>Stripe</strong> (credit/debit card processing)</li>
            <li><strong>Onramp.money</strong> (bank transfers and alternative payments)</li>
            <li><strong>Magic.link</strong> (authentication services)</li>
            <li>Cloud hosting providers (AWS, Google Cloud)</li>
            <li>Analytics and monitoring services</li>
            <li>Customer support platforms</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">5. DATA SECURITY</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We implement appropriate technical and organizational security measures to protect your information including encryption of data in transit and at rest, secure cloud infrastructure with access controls, regular security audits, and multi-factor authentication for internal systems.
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            <strong>No Absolute Security:</strong> While we implement strong security measures, no system is completely secure. We cannot guarantee absolute protection against unauthorized access, use, or disclosure.
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">6. YOUR PRIVACY RIGHTS</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-8">
            <li><strong>Access:</strong> Request copies of your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
            <li><strong>Portability:</strong> Request transfer of your information in a machine-readable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your information</li>
            <li><strong>Restriction:</strong> Request limitation of processing under certain circumstances</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">7. CONTACT INFORMATION</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For privacy-related questions or to exercise your rights, contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 mb-2"><strong>Email:</strong> hello@escrowhaven.io</p>
            <p className="text-gray-700 mb-2"><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
            <p className="text-gray-700"><strong>Response Time:</strong> Within 72 hours</p>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-12">
            <p className="text-sm text-gray-600">
              This Privacy Policy is effective as of January 1, 2025, and applies to all information collected on or after this date.
              By using escrowhaven.io, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
