'use client';

export function Footer() {
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
                <li><a href="#" className="hover:text-black transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Create Escrow</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Security</a></li>
              </ul>
            </div>
            
            {/* For Clients */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">For Clients</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li><a href="#" className="hover:text-black transition-colors">Protect Your Payment</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Hire with Confidence</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Instant Approvals</a></li>
              </ul>
            </div>
            
            {/* For Freelancers */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">For Freelancers</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li><a href="#" className="hover:text-black transition-colors">Avoid Chargebacks</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Get Paid Faster</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Global Withdrawals</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">Resources</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Transparency Reports</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">Company</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li><a href="#" className="hover:text-black transition-colors">About escrowhaven</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Account */}
            <div>
              <h4 className="font-medium mb-6 text-sm text-black">Account</h4>
              <ul className="space-y-4 text-sm text-[#787B86]">
                <li><a href="#" className="hover:text-black transition-colors">Start Escrow</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Log In</a></li>
                <li><a href="#" className="hover:text-black transition-colors">iOS App</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Android App</a></li>
              </ul>
            </div>
          </div>
          
          {/* Social links and logo */}
          <div className="border-t border-[#E0E2E7] pt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
              <div className="mb-6 md:mb-0">
                <span className="text-lg font-semibold text-black">escrowhaven</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-[#787B86]">Follow Us</span>
                <a href="#" className="text-[#787B86] hover:text-black transition-colors" aria-label="Twitter">X</a>
                <a href="#" className="text-[#787B86] hover:text-black transition-colors" aria-label="LinkedIn">LinkedIn</a>
                <a href="#" className="text-[#787B86] hover:text-black transition-colors" aria-label="YouTube">YouTube</a>
                <a href="#" className="text-[#787B86] hover:text-black transition-colors" aria-label="Reddit">Reddit</a>
                <a href="#" className="text-[#787B86] hover:text-black transition-colors" aria-label="Instagram">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legal disclaimers - WHITE background with border separation */}
      <div className="bg-white border-t border-[#E0E2E7] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-xs text-[#787B86] leading-relaxed space-y-4">
            <p>
              <strong className="text-[#787B86]">1. Technology Service, Not a Financial Institution.</strong> escrowhaven is a technology platform that facilitates non-custodial escrow transactions. We are not a bank, money transmitter, or financial institution.
            </p>
            <p>
              <strong className="text-[#787B86]">2. Non-Custodial Nature.</strong> escrowhaven never holds, controls, or has access to your funds. All funds are locked in autonomous smart contracts on the Polygon blockchain and can only be released with mutual approval from both parties.
            </p>
            <p>
              <strong className="text-[#787B86]">3. No Government Insurance.</strong> Funds in escrowhaven smart contracts are not covered by the Federal Deposit Insurance Corporation (FDIC), the Securities Investor Protection Corporation (SIPC), or any other government insurance program.
            </p>
            <p>
              <strong className="text-[#787B86]">4. Smart Contract Risks.</strong> Smart contracts are immutable once deployed. While we conduct code audits and testing, blockchain transactions are irreversible and carry inherent risks, including potential vulnerabilities, exploits, or network issues.
            </p>
            <p>
              <strong className="text-[#787B86]">5. Payment Processing.</strong> All fiat-to-crypto conversions are provided by Transak, a third-party service provider. KYC/AML verification is required to use Transak. Standard processing fees apply (approximately 3.5% for card payments).
            </p>
            <p>
              <strong className="text-[#787B86]">6. Platform Fees.</strong> escrowhaven charges a 1.99% fee on successful escrow releases. This fee is automatically deducted from the released amount.
            </p>
            <p>
              <strong className="text-[#787B86]">7. Blockchain Network Dependency.</strong> Service performance depends on the Polygon blockchain network. Network congestion, outages, or gas price spikes may affect transaction speed and costs.
            </p>
            <p>
              <strong className="text-[#787B86]">8. Dispute Resolution Limitations.</strong> escrowhaven's smart contracts execute only with mutual digital signatures from both parties. We cannot unilaterally release funds or override contract terms. If parties cannot reach agreement, funds will remain locked until resolved through mutual consent or agreed arbitration.
            </p>
            <p>
              <strong className="text-[#787B86]">9. User Compliance Responsibilities.</strong> Users are solely responsible for understanding and complying with all applicable laws, tax obligations, and reporting requirements related to cryptocurrency transactions in their jurisdiction.
            </p>
            <p>
              <strong className="text-[#787B86]">10. Account Security.</strong> escrowhaven uses email-based authentication via Magic.link. You are responsible for maintaining the security of your email account. Loss of access to your email may result in loss of access to your escrow.
            </p>
            <p>
              <strong className="text-[#787B86]">11. No Financial, Legal, or Tax Advice.</strong> escrowhaven does not provide financial, legal, or tax advice. You should consult with qualified professionals before making any decisions related to your escrow transactions.
            </p>
            <p>
              <strong className="text-[#787B86]">12. Forward-Looking Statements.</strong> Any forward-looking statements in escrowhaven materials are based on current expectations and assumptions. Actual results may differ due to market, regulatory, technological, or operational factors.
            </p>
          </div>
          
          {/* Copyright and additional links */}
          <div className="mt-8 pt-8 border-t border-[#E0E2E7]">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-xs text-[#787B86] mb-4 md:mb-0">
                © 2025 escrowhaven. All rights reserved.
              </p>
              <div className="flex gap-6 text-xs">
                <a href="#" className="text-[#787B86] hover:text-black transition-colors">Terms of Service</a>
                <a href="#" className="text-[#787B86] hover:text-black transition-colors">Privacy Policy</a>
                <a href="#" className="text-[#787B86] hover:text-black transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
