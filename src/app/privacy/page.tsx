// app/privacy/page.tsx
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-600 mb-4">
            Last updated: [Date]
          </p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Privacy Policy Coming Soon</h2>
              <p>
                We're currently working on our comprehensive privacy policy. In the meantime, please know that:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>We take your privacy seriously</li>
                <li>We don't sell your personal data</li>
                <li>We use industry-standard security measures</li>
                <li>We only collect information necessary to provide our service</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <p>
                If you have any questions about our privacy practices, please contact us at:
                <br />
                <a href="mailto:privacy@saferelay.com" className="text-blue-600 hover:underline">
                  privacy@saferelay.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}