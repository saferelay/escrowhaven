// src/app/terms/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | escrowhaven.io',
  description: 'escrowhaven terms of service - legal terms and conditions for using our blockchain-based escrow platform.',
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-normal text-black mb-8">Terms of Service</h1>
        <div className="text-sm text-[#787B86] mb-12 pb-8 border-b border-[#E0E2E7]">
          <div className="font-medium text-black">Effective Date: September 1, 2025</div>
          <div className="font-medium text-black">Last Updated: September 1, 2025</div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-normal text-black mb-6">1. ACCEPTANCE OF TERMS</h2>
            <p className="text-[#787B86] leading-relaxed">
              By accessing or using the escrowhaven.io website and platform ("Platform"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">2. PLATFORM OVERVIEW</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">2.1 Service Description</h3>
            <p className="text-[#787B86] leading-relaxed mb-8">
              escrowhaven.io, operated by Woodrow Stores LLC ("escrowhaven," "we," "us," or "our") is a blockchain-based technology platform that facilitates non-custodial escrow transactions through smart contracts deployed on the Polygon blockchain network. We provide software tools that enable users to create, fund, and manage escrow agreements without escrowhaven acting as a custodian of funds.
            </p>

            <h3 className="text-xl font-medium text-black mb-4">2.2 Non-Financial Institution Status</h3>
            <div className="bg-[#F8F9FD] border border-[#F7931A]/20 rounded-lg p-6 mb-8">
              <p className="text-black font-medium mb-4">IMPORTANT: escrowhaven is NOT:</p>
              <ul className="space-y-2 text-[#787B86]">
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>A bank or financial institution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>A money services business (MSB)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>A money transmitter</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>A payment processor</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>A custodial service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#787B86] mr-2">•</span>
                  <span>An investment advisor or broker-dealer</span>
                </li>
              </ul>
              <p className="text-[#787B86] mt-4">
                We are a technology company providing software tools for blockchain-based escrow transactions.
              </p>
            </div>

            <h3 className="text-xl font-medium text-black mb-4">2.3 Non-Custodial Nature</h3>
            <p className="text-[#787B86] leading-relaxed">
              escrowhaven NEVER holds, controls, or has access to your funds. All funds are secured in autonomous smart contracts deployed on the Polygon blockchain that can only be released through cryptographic signatures from authorized parties (the client and recipient).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">3. ELIGIBILITY AND REGISTRATION</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">3.1 Age Requirements</h3>
            <p className="text-[#787B86] leading-relaxed mb-6">
              You must be at least 18 years old to use our Platform. By using the Platform, you represent and warrant that you are at least 18 years of age.
            </p>

            <h3 className="text-xl font-medium text-black mb-4">3.2 Prohibited Jurisdictions</h3>
            <p className="text-[#787B86] leading-relaxed mb-6">
              Our services are not available to residents of countries or jurisdictions where the use of blockchain technology or cryptocurrency transactions is prohibited by law.
            </p>

            <h3 className="text-xl font-medium text-black mb-4">3.3 Account Registration</h3>
            <ul className="space-y-2 text-[#787B86]">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>You must provide accurate, current, and complete information during registration</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>You are responsible for maintaining the confidentiality of your account credentials</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>You must notify us immediately of any unauthorized access to your account</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>One person or entity may only maintain one account</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">4. HOW THE PLATFORM WORKS</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">4.1 Escrow Creation</h3>
            <p className="text-[#787B86] leading-relaxed mb-4">
              Users can create escrows by specifying:
            </p>
            <ul className="space-y-2 text-[#787B86] mb-8">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Payment amount (automatically converted to USDC stablecoin)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Recipient email address</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Optional description and terms</span>
              </li>
            </ul>

            <h3 className="text-xl font-medium text-black mb-4">4.2 Smart Contract Deployment</h3>
            <p className="text-[#787B86] leading-relaxed mb-4">
              Each escrow creates a unique, immutable smart contract on the Polygon blockchain. The contract includes:
            </p>
            <ul className="space-y-2 text-[#787B86] mb-8">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Escrow terms and conditions</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Participant addresses (client and recipient)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Fund amount and currency (USDC)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Release and refund mechanisms</span>
              </li>
            </ul>

            <h3 className="text-xl font-medium text-black mb-4">4.3 Funding Process</h3>
            <p className="text-[#787B86] leading-relaxed mb-4">
              Funds are provided through our integrated payment partners:
            </p>
            <ul className="space-y-2 text-[#787B86] mb-8">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Stripe:</span> Credit/debit card payments with instant USDC conversion</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Onramp.money:</span> Bank transfers and alternative payment methods</span>
              </li>
            </ul>

            <h3 className="text-xl font-medium text-black mb-4">4.4 Fund Release Mechanisms</h3>
            <p className="text-[#787B86] leading-relaxed mb-4">
              Smart contracts support multiple release mechanisms:
            </p>
            <ul className="space-y-2 text-[#787B86]">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Full Release:</span> Complete transfer to recipient upon client approval</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Full Refund:</span> Complete return to client upon recipient approval</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Partial Settlement:</span> Mutually agreed distribution of funds</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span><span className="font-medium text-black">Gasless Transactions:</span> escrowhaven pays blockchain gas fees on behalf of users</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">5. USER RESPONSIBILITIES</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">5.1 Compliance with Laws</h3>
            <p className="text-[#787B86] leading-relaxed mb-4">
              You are solely responsible for compliance with all applicable laws, regulations, and tax obligations in your jurisdiction, including but not limited to:
            </p>
            <ul className="space-y-2 text-[#787B86] mb-8">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Anti-money laundering (AML) regulations</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Know Your Customer (KYC) requirements</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Tax reporting and payment obligations</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Securities and commodities regulations</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Consumer protection laws</span>
              </li>
            </ul>

            <h3 className="text-xl font-medium text-black mb-4">5.2 Prohibited Uses</h3>
            <p className="text-[#787B86] leading-relaxed mb-4">
              You may not use the Platform for:
            </p>
            <ul className="space-y-2 text-[#787B86]">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Illegal activities or transactions</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Money laundering or terrorist financing</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Fraudulent or deceptive practices</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Circumventing economic sanctions or embargoes</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Trademark or copyright infringement</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Harassment, abuse, or threats against other users</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">6. FEES AND PAYMENTS</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">6.1 Platform Fees</h3>
            <p className="text-[#787B86] leading-relaxed mb-6">
              escrowhaven charges a 1.99% platform fee on successful escrow releases. This fee is automatically deducted from the released amount through our smart contract splitter system.
            </p>

            <h3 className="text-xl font-medium text-black mb-4">6.2 Payment Processing Fees</h3>
            <p className="text-[#787B86] leading-relaxed mb-6">
              Third-party payment processing fees are charged separately by our payment partners (Stripe and Onramp.money). These fees vary based on payment method and jurisdiction.
            </p>

            <h3 className="text-xl font-medium text-black mb-4">6.3 Gas Fees</h3>
            <p className="text-[#787B86] leading-relaxed">
              escrowhaven pays blockchain gas fees on behalf of users as a service convenience. This service is provided at our discretion and may be modified or discontinued with notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">7. RISKS AND DISCLAIMERS</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">7.1 Technology Risks</h3>
            <div className="bg-[#EF5350]/5 border border-[#EF5350]/20 rounded-lg p-6 mb-8">
              <p className="text-[#787B86] mb-4">
                <span className="font-medium text-black">Smart Contract Risks:</span> Smart contracts are immutable once deployed. While we conduct security audits, blockchain technology carries inherent risks including potential vulnerabilities, exploits, or network issues.
              </p>
              <p className="text-[#787B86] mb-4">
                <span className="font-medium text-black">Blockchain Dependency:</span> Service performance depends on the Polygon blockchain network. Network congestion, outages, or protocol changes may affect transaction speed and costs.
              </p>
              <p className="text-[#787B86]">
                <span className="font-medium text-black">Irreversible Transactions:</span> Blockchain transactions are irreversible. Errors in transaction details cannot be corrected after execution.
              </p>
            </div>

            <h3 className="text-xl font-medium text-black mb-4">7.2 Financial Disclaimers</h3>
            <div className="bg-[#2962FF]/5 border border-[#2962FF]/20 rounded-lg p-6">
              <p className="text-[#787B86] mb-4">
                <span className="font-medium text-black">No FDIC Insurance:</span> Funds in escrowhaven smart contracts are not covered by the Federal Deposit Insurance Corporation (FDIC), Securities Investor Protection Corporation (SIPC), or any other government insurance program.
              </p>
              <p className="text-[#787B86]">
                <span className="font-medium text-black">No Investment Advice:</span> escrowhaven does not provide financial, investment, legal, or tax advice. Consult qualified professionals before making financial decisions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">8. DISPUTE RESOLUTION</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">8.1 Settlement Process</h3>
            <p className="text-[#787B86] leading-relaxed mb-6">
              Our smart contracts support partial settlements through mutual agreement. If parties cannot reach agreement, funds will remain locked in the smart contract until resolved through mutual consent.
            </p>

            <h3 className="text-xl font-medium text-black mb-4">8.2 Platform Limitations</h3>
            <p className="text-[#787B86] leading-relaxed">
              escrowhaven cannot unilaterally release funds or override smart contract terms. We do not act as arbitrators in disputes between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">9. LIMITATION OF LIABILITY</h2>
            <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-6">
              <p className="text-[#787B86] mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <p className="text-[#787B86] mb-4">
                <span className="font-medium text-black">Disclaimer of Warranties:</span> THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-[#787B86] mb-4">
                <span className="font-medium text-black">Limitation of Damages:</span> ESCROWHAVEN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, REGARDLESS OF THE THEORY OF LIABILITY.
              </p>
              <p className="text-[#787B86]">
                <span className="font-medium text-black">Maximum Liability:</span> OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE FEES PAID BY YOU TO ESCROWHAVEN IN THE 12 MONTHS PRECEDING THE CLAIM.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">10. INDEMNIFICATION</h2>
            <p className="text-[#787B86] leading-relaxed">
              You agree to indemnify, defend, and hold harmless escrowhaven, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including attorney fees) arising from your use of the Platform, your violation of these Terms, your violation of applicable laws, or your transactions with other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">11. MODIFICATIONS TO TERMS</h2>
            
            <h3 className="text-xl font-medium text-black mb-4">11.1 Right to Modify</h3>
            <p className="text-[#787B86] leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. Material changes will be communicated through:
            </p>
            <ul className="space-y-2 text-[#787B86] mb-8">
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Email notification to registered users</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Prominent notice on the Platform</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#787B86] mr-2">•</span>
                <span>Updated "Last Modified" date</span>
              </li>
            </ul>

            <h3 className="text-xl font-medium text-black mb-4">11.2 Acceptance of Changes</h3>
            <p className="text-[#787B86] leading-relaxed">
              Continued use of the Platform after changes constitutes acceptance of the modified Terms. If you disagree with changes, you must stop using the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">12. GOVERNING LAW</h2>
            <p className="text-[#787B86] leading-relaxed mb-6">
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.
            </p>

            <p className="text-[#787B86] leading-relaxed">
              Any dispute arising from these Terms or your use of the Platform shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. You agree to resolve disputes individually and waive any right to participate in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-normal text-black mb-6">13. CONTACT INFORMATION</h2>
            <p className="text-[#787B86] mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <div className="bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg p-6">
              <div className="space-y-2">
                <p className="text-[#787B86]">
                  <span className="font-medium text-black">Email:</span> hello@escrowhaven.io
                </p>
                <p className="text-[#787B86]">
                  <span className="font-medium text-black">Legal Entity:</span> Woodrow Stores LLC
                </p>
                <p className="text-[#787B86]">
                  <span className="font-medium text-black">Website:</span> https://escrowhaven.io/contact
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-[#E0E2E7] pt-8 mt-16">
            <p className="text-sm text-[#B2B5BE]">
              These Terms are effective as of September 1, 2025. By using escrowhaven.io, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}