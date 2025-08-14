// app/terms/page.tsx
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-600 mb-4">
            Last updated: [Date]
          </p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Terms of Service Coming Soon</h2>
              <p>
                We're currently finalizing our terms of service. Here are the key points:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>SafeRelay provides escrow services for freelancers and clients</li>
                <li>We charge a 1.99% platform fee to recipients</li>
                <li>Funds are held in smart contracts on the blockchain</li>
                <li>Both parties must approve before funds are released</li>
                <li>We do not have access to your escrowed funds</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Acceptable Use</h2>
              <p>
                By using SafeRelay, you agree to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Use the service only for legitimate business purposes</li>
                <li>Provide accurate information</li>
                <li>Not use the service for illegal activities</li>
                <li>Respect the rights of other users</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <p>
                For questions about these terms, please contact:
                <br />
                <a href="mailto:legal@saferelay.com" className="text-blue-600 hover:underline">
                  legal@saferelay.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}