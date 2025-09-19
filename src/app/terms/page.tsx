// src/app/terms/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | escrowhaven.io',
  description: 'escrowhaven terms of service - legal terms and conditions for using our blockchain-based escrow platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-normal text-black mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective Date: January 1, 2025</strong><br />
            <strong>Last Updated: January 1, 2025</strong>
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">1. ACCEPTANCE OF TERMS</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            By accessing or using the escrowhaven.io website and platform (&quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;) and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Platform.
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">2. PLATFORM OVERVIEW</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">2.1 Service Description</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            escrowhaven.io, operated by Woodrow Stores LLC (&quot;escrowhaven,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a blockchain-based technology platform that facilitates non-custodial escrow transactions through smart contracts deployed on the Polygon blockchain network. We provide software tools that enable users to create, fund, and manage escrow agreements without escrowhaven acting as a custodian of funds.
          </p>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">2.2 Non-Financial Institution Status</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>IMPORTANT:</strong> escrowhaven is NOT:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>A bank or financial institution</li>
              <li>A money services business (MSB)</li>
              <li>A money transmitter</li>
              <li>A payment processor</li>
              <li>A custodial service</li>
              <li>An investment advisor or broker-dealer</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We are a technology company providing software tools for blockchain-based escrow transactions.
            </p>
          </div>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">2.3 Non-Custodial Nature</h3>
          <p className="text-gray-700 leading-relaxed mb-8">
            escrowhaven NEVER holds, controls, or has access to your funds. All funds are secured in autonomous smart contracts deployed on the Polygon blockchain that can only be released through cryptographic signatures from authorized parties (the client and recipient).
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">3. ELIGIBILITY AND REGISTRATION</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">3.1 Age Requirements</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            You must be at least 18 years old to use our Platform. By using the Platform, you represent and warrant that you are at least 18 years of age.
          </p>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">3.2 Prohibited Jurisdictions</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our services are not available to residents of countries or jurisdictions where the use of blockchain technology or cryptocurrency transactions is prohibited by law.
          </p>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">3.3 Account Registration</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-8">
            <li>You must provide accurate, current, and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must notify us immediately of any unauthorized access to your account</li>
            <li>One person or entity may only maintain one account</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">4. HOW THE PLATFORM WORKS</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">4.1 Escrow Creation</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Users can create escrows by specifying:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Payment amount (automatically converted to USDC stablecoin)</li>
            <li>Recipient email address</li>
            <li>Optional description and terms</li>
          </ul>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">4.2 Smart Contract Deployment</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Each escrow creates a unique, immutable smart contract on the Polygon blockchain. The contract includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Escrow terms and conditions</li>
            <li>Participant addresses (client and recipient)</li>
            <li>Fund amount and currency (USDC)</li>
            <li>Release and refund mechanisms</li>
          </ul>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">4.3 Funding Process</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Funds are provided through our integrated payment partners:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li><strong>Stripe:</strong> Credit/debit card payments with instant USDC conversion</li>
            <li><strong>Onramp.money:</strong> Bank transfers and alternative payment methods</li>
          </ul>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">4.4 Fund Release Mechanisms</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Smart contracts support multiple release mechanisms:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-8">
            <li><strong>Full Release:</strong> Complete transfer to recipient upon client approval</li>
            <li><strong>Full Refund:</strong> Complete return to client upon recipient approval</li>
            <li><strong>Partial Settlement:</strong> Mutually agreed distribution of funds</li>
            <li><strong>Gasless Transactions:</strong> escrowhaven pays blockchain gas fees on behalf of users</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">5. USER RESPONSIBILITIES</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">5.1 Compliance with Laws</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You are solely responsible for compliance with all applicable laws, regulations, and tax obligations in your jurisdiction, including but not limited to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Anti-money laundering (AML) regulations</li>
            <li>Know Your Customer (KYC) requirements</li>
            <li>Tax reporting and payment obligations</li>
            <li>Securities and commodities regulations</li>
            <li>Consumer protection laws</li>
          </ul>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">5.2 Prohibited Uses</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may not use the Platform for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-8">
            <li>Illegal activities or transactions</li>
            <li>Money laundering or terrorist financing</li>
            <li>Fraudulent or deceptive practices</li>
            <li>Circumventing economic sanctions or embargoes</li>
            <li>Trademark or copyright infringement</li>
            <li>Harassment, abuse, or threats against other users</li>
          </ul>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">6. FEES AND PAYMENTS</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">6.1 Platform Fees</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            escrowhaven charges a 1.99% platform fee on successful escrow releases. This fee is automatically deducted from the released amount through our smart contract splitter system.
          </p>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">6.2 Payment Processing Fees</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Third-party payment processing fees are charged separately by our payment partners (Stripe and Onramp.money). These fees vary based on payment method and jurisdiction.
          </p>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">6.3 Gas Fees</h3>
          <p className="text-gray-700 leading-relaxed mb-8">
            escrowhaven pays blockchain gas fees on behalf of users as a service convenience. This service is provided at our discretion and may be modified or discontinued with notice.
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">7. RISKS AND DISCLAIMERS</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">7.1 Technology Risks</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Smart Contract Risks:</strong> Smart contracts are immutable once deployed. While we conduct security audits, blockchain technology carries inherent risks including potential vulnerabilities, exploits, or network issues.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Blockchain Dependency:</strong> Service performance depends on the Polygon blockchain network. Network congestion, outages, or protocol changes may affect transaction speed and costs.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Irreversible Transactions:</strong> Blockchain transactions are irreversible. Errors in transaction details cannot be corrected after execution.
            </p>
          </div>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">7.2 Financial Disclaimers</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>No FDIC Insurance:</strong> Funds in escrowhaven smart contracts are not covered by the Federal Deposit Insurance Corporation (FDIC), Securities Investor Protection Corporation (SIPC), or any other government insurance program.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>No Investment Advice:</strong> escrowhaven does not provide financial, investment, legal, or tax advice. Consult qualified professionals before making financial decisions.
            </p>
          </div>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">8. DISPUTE RESOLUTION</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">8.1 Settlement Process</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our smart contracts support partial settlements through mutual agreement. If parties cannot reach agreement, funds will remain locked in the smart contract until resolved through mutual consent.
          </p>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">8.2 Platform Limitations</h3>
          <p className="text-gray-700 leading-relaxed mb-8">
            escrowhaven cannot unilaterally release funds or override smart contract terms. We do not act as arbitrators in disputes between users.
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">9. LIMITATION OF LIABILITY</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Disclaimer of Warranties:</strong> THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Limitation of Damages:</strong> ESCROWHAVEN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, REGARDLESS OF THE THEORY OF LIABILITY.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Maximum Liability:</strong> OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE FEES PAID BY YOU TO ESCROWHAVEN IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </div>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">10. INDEMNIFICATION</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            You agree to indemnify, defend, and hold harmless escrowhaven, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including attorney fees) arising from your use of the Platform, your violation of these Terms, your violation of applicable laws, or your transactions with other users.
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">11. MODIFICATIONS TO TERMS</h2>
          
          <h3 className="text-xl font-medium text-black mt-8 mb-4">11.1 Right to Modify</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We reserve the right to modify these Terms at any time. Material changes will be communicated through:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Email notification to registered users</li>
            <li>Prominent notice on the Platform</li>
            <li>Updated &quot;Last Modified&quot; date</li>
          </ul>

          <h3 className="text-xl font-medium text-black mt-8 mb-4">11.2 Acceptance of Changes</h3>
          <p className="text-gray-700 leading-relaxed mb-8">
            Continued use of the Platform after changes constitutes acceptance of the modified Terms. If you disagree with changes, you must stop using the Platform.
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">12. GOVERNING LAW</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            Any dispute arising from these Terms or your use of the Platform shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. You agree to resolve disputes individually and waive any right to participate in class action lawsuits.
          </p>

          <h2 className="text-2xl font-medium text-black mt-12 mb-6">13. CONTACT INFORMATION</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For questions about these Terms, please contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-gray-700 mb-2"><strong>Email:</strong> hello@escrowhaven.io</p>
            <p className="text-gray-700 mb-2"><strong>Legal Entity:</strong> Woodrow Stores LLC</p>
            <p className="text-gray-700 mb-2"><strong>Website:</strong> https://escrowhaven.io/contact</p>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-12">
            <p className="text-sm text-gray-600">
              These Terms are effective as of January 1, 2025. By using escrowhaven.io, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}