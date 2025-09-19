// src/app/cookies/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | escrowhaven.io',
  description: 'escrowhaven cookie policy - how we use cookies and similar tracking technologies on our platform.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-normal text-black mb-8">Cookie Policy</h1>
          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective Date: January 1, 2025</strong><br />
            <strong>Last Updated: January 1, 2025</strong>
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">1. INTRODUCTION</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            This Cookie Policy explains how escrowhaven.io, operated by Woodrow Stores LLC (&quot;escrowhaven,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar tracking technologies on our blockchain-based escrow platform (&quot;Platform&quot;). This policy should be read together with our Privacy Policy and Terms of Service.
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            <strong>By continuing to use our Platform, you consent to our use of cookies as described in this policy.</strong>
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">2. WHAT ARE COOKIES?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Cookies are small text files that are downloaded and stored on your computer or mobile device by websites you visit. They are widely used to make websites work more efficiently and to provide information to website owners.
          </p>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">2.1 Types of Cookies</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-8">
            <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them</li>
            <li><strong>First-Party Cookies:</strong> Cookies set by escrowhaven.io directly</li>
            <li><strong>Third-Party Cookies:</strong> Cookies set by external services integrated into our Platform</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">3. COOKIES WE USE</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">3.1 Essential Cookies</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            These cookies are necessary for our Platform to function properly and cannot be disabled without severely affecting your ability to use our services.
          </p>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium">Cookie Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium">Purpose</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium">Duration</th>
                  <th className="border border-gray-200 px-4 py-2 text-left font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-gray-200 px-4 py-2">session_token</td>
                  <td className="border border-gray-200 px-4 py-2">Maintains your login session</td>
                  <td className="border border-gray-200 px-4 py-2">Session</td>
                  <td className="border border-gray-200 px-4 py-2">First-party</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">auth_state</td>
                  <td className="border border-gray-200 px-4 py-2">Manages authentication status</td>
                  <td className="border border-gray-200 px-4 py-2">Session</td>
                  <td className="border border-gray-200 px-4 py-2">First-party</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">csrf_token</td>
                  <td className="border border-gray-200 px-4 py-2">Protects against cross-site request forgery</td>
                  <td className="border border-gray-200 px-4 py-2">Session</td>
                  <td className="border border-gray-200 px-4 py-2">First-party</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">3.2 Third-Party Cookies</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our Platform integrates with various third-party services that may set their own cookies:
          </p>

          <div className="space-y-6 mb-8">
            <div>
              <p className="font-medium text-gray-900 mb-2">Magic.link (Authentication)</p>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                <li>Purpose: Secure email-based authentication</li>
                <li>Privacy Policy: https://magic.link/privacy</li>
                <li>Duration: 24 hours to 30 days</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">Stripe (Payment Processing)</p>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                <li>Purpose: Fraud prevention and payment security</li>
                <li>Privacy Policy: https://stripe.com/privacy</li>
                <li>Duration: Session to 2 years</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">Onramp.money (Payment Processing)</p>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                <li>Purpose: Bank transfer payment processing</li>
                <li>Privacy Policy: https://onramp.money/privacy</li>
                <li>Duration: Session to 30 days</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">4. COOKIE MANAGEMENT</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">4.1 Browser Settings</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You can control and delete cookies through your browser settings:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li><strong>Chrome:</strong> Settings {'->'} Privacy and Security {'->'} Cookies and other site data</li>
            <li><strong>Firefox:</strong> Settings {'->'} Privacy & Security {'->'} Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences {'->'} Privacy {'->'} Manage Website Data</li>
            <li><strong>Edge:</strong> Settings {'->'} Privacy & Security {'->'} Cookies and site permissions</li>
          </ul>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">4.2 Impact of Disabling Cookies</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-8">
            <li><strong>Essential Cookies:</strong> Disabling these will prevent you from using core Platform features including login, transaction processing, and security features</li>
            <li><strong>Functional Cookies:</strong> Disabling these may result in reduced functionality, such as having to re-enter preferences each visit</li>
            <li><strong>Analytics Cookies:</strong> Disabling these will not affect Platform functionality but will prevent us from understanding usage patterns to improve our services</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">5. CONTACT INFORMATION</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For questions about our cookie practices:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@escrowhaven.io</p>
            <p className="text-gray-700 mb-2"><strong>Subject:</strong> Cookie Policy Inquiry</p>
            <p className="text-gray-700"><strong>Response Time:</strong> Within 72 hours</p>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-12">
            <p className="text-sm text-gray-600">
              This Cookie Policy is effective as of January 1, 2025, and applies to all cookie use on or after this date.
              By using escrowhaven.io, you acknowledge that you have read, understood, and agree to this Cookie Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}