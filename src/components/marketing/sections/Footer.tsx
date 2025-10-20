// src/components/marketing/sections/Footer.tsx
'use client';

import { useRouter } from 'next/navigation';

export function Footer() {
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <footer className="bg-white border-t border-[#E0E2E7]">
      {/* Main footer content */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            {/* Product */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">Product</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li>
                  <button 
                    onClick={() => scrollToSection('how-it-works')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/signup')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Create a Vault
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('pricing')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/help')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Security
                  </button>
                </li>
              </ul>
            </div>
            
            {/* For Clients */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">For Clients</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li>
                  <button 
                    onClick={scrollToTop} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Secure Your Payment
                  </button>
                </li>
                <li>
                  <button 
                    onClick={scrollToTop} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Hire with Confidence
                  </button>
                </li>
                <li>
                  <button 
                    onClick={scrollToTop} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Instant Approvals
                  </button>
                </li>
              </ul>
            </div>
            
            {/* For Freelancers */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">For Freelancers</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li>
                  <button 
                    onClick={scrollToTop} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Avoid Chargebacks
                  </button>
                </li>
                <li>
                  <button 
                    onClick={scrollToTop} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Get Paid Faster
                  </button>
                </li>
                <li>
                  <button 
                    onClick={scrollToTop} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Global Withdrawals
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">Resources</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li>
                  <button 
                    onClick={() => handleNavigation('/help')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                <button
                    onClick={() => handleNavigation('/transparency')}
                    className="hover:text-black transition-colors text-left"
                  >
                    Transparency Reports
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/blog')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/api-docs')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    API Docs
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">Company</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li>
                  <button 
                    onClick={() => handleNavigation('/about')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    About EscrowHaven
                  </button>
                </li>
                <li>
                  <a href="mailto:hello@escrowhaven.io" className="hover:text-black transition-colors">Contact</a>
                </li>
              </ul>
            </div>
            
            {/* Account */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">Account</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li>
                  <button 
                    onClick={() => handleNavigation('/signup')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    New Vault
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/login')} 
                    className="hover:text-black transition-colors text-left"
                  >
                    Log In
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Logo only - removed social links */}
          <div className="border-t border-[#E0E2E7] pt-10">
            <div className="mb-6">
              <span className="text-lg font-semibold text-black">escrowhaven.io</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legal disclaimers - WHITE background with border separation */}
      <div className="bg-white border-t border-[#E0E2E7] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-xs text-[#787B86] leading-relaxed space-y-4">
            <p>
              <strong className="text-[#787B86]">1. Technology Service, Not a Financial Institution.</strong> EscrowHaven is a technology platform that facilitates non-custodial transactions. We are not a bank, money transmitter, or financial institution.
            </p>
            <p>
              <strong className="text-[#787B86]">2. Non-Custodial Transaction Vaults.</strong> EscrowHaven never holds, controls, or has access to your funds. All funds are secured in autonomous vaults (smart contracts) on the Polygon blockchain and can only be released with mutual approval from both parties.
            </p>
            <p>
              <strong className="text-[#787B86]">3. No Government Insurance.</strong> Funds in vaults are not covered by the Federal Deposit Insurance Corporation (FDIC), the Securities Investor Protection Corporation (SIPC), or any other government insurance program.
            </p>
            <p>
              <strong className="text-[#787B86]">4. Transaction Vault Risks.</strong> Transaction vaults are immutable once deployed. While we conduct code audits and testing, blockchain transactions are irreversible and carry inherent risks, including potential vulnerabilities, exploits, or network issues.
            </p>
            <p>
              <strong className="text-[#787B86]">5. Payment Processing.</strong> All fiat-to-crypto conversions are provided by third-party payment partners. KYC/AML verification may be required. Standard processing fees apply.
            </p>
            <p>
              <strong className="text-[#787B86]">6. Platform Fees.</strong> EscrowHaven charges a 1.99% fee on successful vault releases. This fee is automatically deducted from the released amount via our smart contract splitter.
            </p>
            <p>
              <strong className="text-[#787B86]">7. Blockchain Network Dependency.</strong> Service performance depends on the Polygon blockchain network. Network congestion, outages, or gas price spikes may affect transaction speed and costs.
            </p>
            <p>
              <strong className="text-[#787B86]">8. Gasless Transactions.</strong> EscrowHaven pays blockchain gas fees on behalf of users. This service is provided at our discretion and may be modified or discontinued.
            </p>
            <p>
              <strong className="text-[#787B86]">9. Settlement Resolution.</strong> Our vaults support partial settlements through mutual agreement. If parties cannot reach agreement, funds will remain locked in the vault until resolved through mutual consent.
            </p>
            <p>
              <strong className="text-[#787B86]">10. User Compliance Responsibilities.</strong> Users are solely responsible for understanding and complying with all applicable laws, tax obligations, and reporting requirements related to cryptocurrency transactions in their jurisdiction.
            </p>
            <p>
              <strong className="text-[#787B86]">11. Account Security.</strong> EscrowHaven uses email-based authentication via Magic.link. You are responsible for maintaining the security of your email account. Loss of access to your email may result in loss of access to your transactions.
            </p>
            <p>
              <strong className="text-[#787B86]">12. No Financial, Legal, or Tax Advice.</strong> EscrowHaven does not provide financial, legal, or tax advice. You should consult with qualified professionals before making any decisions related to your transactions.
            </p>
            <p>
              <strong className="text-[#787B86]">13. Forward-Looking Statements.</strong> Any forward-looking statements in EscrowHaven materials are based on current expectations and assumptions. Actual results may differ due to market, regulatory, technological, or operational factors.
            </p>
          </div>
          
          {/* Copyright and additional links */}
          <div className="mt-8 pt-8 border-t border-[#E0E2E7]">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-xs text-[#787B86] mb-4 md:mb-0">
                © 2025 escrowhaven.io. All rights reserved.
              </p>
              <div className="flex gap-6 text-xs">
                <a href="/terms" className="text-[#787B86] hover:text-black transition-colors">Terms of Service</a>
                <a href="/privacy" className="text-[#787B86] hover:text-black transition-colors">Privacy Policy</a>
                <a href="/cookies" className="text-[#787B86] hover:text-black transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}