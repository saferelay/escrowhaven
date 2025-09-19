// src/app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | escrowhaven.io',
  description: 'Learn about escrowhaven - we are building the future of secure online payments through blockchain technology.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-normal text-black mb-6">
            About escrowhaven.io
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're building the future of secure online payments through blockchain technology, 
            making escrow accessible to everyone without the complexity.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-normal text-black mb-4">Our Mission</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              escrowhaven exists to solve the fundamental trust problem in online transactions. 
              Too many freelancers get stiffed by clients, and too many clients worry about paying upfront 
              without guarantee of delivery.
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              By leveraging smart contracts on the Polygon blockchain, we create a system where both 
              parties can transact with confidence, knowing their interests are protected by immutable code 
              rather than hoping the other party will honor their agreement.
            </p>
          </div>
        </div>

        {/* How We're Different */}
        <div className="mb-16">
          <h2 className="text-2xl font-normal text-black mb-8 text-center">How We're Different</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-black mb-3">Non-Custodial</h3>
              <p className="text-sm text-gray-700">
                Unlike traditional platforms, we never hold your money. Funds go directly into 
                smart contracts that only you and the other party can control.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-black mb-3">No Crypto Knowledge Required</h3>
              <p className="text-sm text-gray-700">
                Pay with your card or bank account. We handle all blockchain complexity behind 
                the scenes, including gas fees.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-black mb-3">Fair Pricing</h3>
              <p className="text-sm text-gray-700">
                Just 1.99% fee on successful releases. No monthly subscriptions, no hidden fees, 
                no 20% platform cuts.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-black mb-3">True Finality</h3>
              <p className="text-sm text-gray-700">
                No chargebacks, no surprise reversals. Once funds are released, they're final 
                unless both parties agree otherwise.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-normal text-black mb-6">Our Technology</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-black mb-2">Polygon Blockchain</h3>
                <p className="text-sm text-gray-700">
                  We deploy smart contracts on Polygon for fast, low-cost transactions while 
                  maintaining Ethereum-level security through regular checkpoints.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-black mb-2">Smart Contract Architecture</h3>
                <p className="text-sm text-gray-700">
                  Each escrow creates a unique, audited smart contract with built-in fee splitting, 
                  multiple release mechanisms, and gasless transaction support.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-black mb-2">Secure Authentication</h3>
                <p className="text-sm text-gray-700">
                  Email-based authentication via Magic.link eliminates the need for complex 
                  wallet management while maintaining cryptographic security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="mb-16">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-normal text-black mb-6">Security & Compliance</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-base font-medium text-black mb-3">Smart Contract Audits</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Our smart contracts undergo rigorous security audits and testing before deployment. 
                  All code is open source and verifiable on the blockchain.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-black mb-3">Data Protection</h3>
                <p className="text-sm text-gray-700 mb-4">
                  We comply with GDPR, CCPA, and other privacy regulations. Your personal data 
                  is encrypted and never shared without your consent.
                </p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Important:</strong> escrowhaven is a technology platform, not a financial institution. 
                We don't hold licenses as a bank or money transmitter because we never custody your funds. 
                All funds are held in smart contracts that only you control.
              </p>
            </div>
          </div>
        </div>

        {/* Team Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-normal text-black mb-8 text-center">Our Values</h2>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-black mb-2">Transparency First</h3>
              <p className="text-sm text-gray-700 max-w-2xl mx-auto">
                Every transaction is recorded on the public blockchain. Our smart contract code 
                is open source. No hidden fees, no surprise terms.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-black mb-2">User Empowerment</h3>
              <p className="text-sm text-gray-700 max-w-2xl mx-auto">
                You control your funds, not us. You decide when to release payment, not an algorithm 
                or customer service representative.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-black mb-2">Fair Economics</h3>
              <p className="text-sm text-gray-700 max-w-2xl mx-auto">
                Keep 98.01% of what you earn. No monthly fees, no premium tiers, no complex pricing structures. 
                You pay only when you succeed.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-normal text-black mb-4">Get in Touch</h2>
            <p className="text-base text-gray-700 mb-6">
              Have questions about our platform or want to learn more about how we're 
              building the future of secure payments?
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-600">Email:</span> 
                <span className="text-black ml-2">hello@escrowhaven.io</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Support:</span> 
                <span className="text-black ml-2">support@escrowhaven.io</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}