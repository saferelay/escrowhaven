'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const faqs = [
  {
    section: 'Getting Started',
    id: 'getting-started',
    items: [
      { q: 'What is escrowhaven?', a: 'escrowhaven is a payment platform that protects both buyers and sellers. Money is held securely in a blockchain vault until both parties agree to release it. No chargebacks, instant settlements, and you keep 98% of your payment.' },
      { q: 'Do I need cryptocurrency knowledge?', a: 'No. While we use blockchain technology for security, you never need to understand crypto. Sign up with email, send/receive money like any payment app, and withdraw to your bank account.' },
      { q: 'Is escrowhaven safe?', a: 'Yes. Funds are protected by smart contracts on the Polygon blockchain - like digital vaults that can only be opened when both parties agree. We never have access to your money. All transactions are transparent and verifiable on the blockchain.' },
      { q: 'What does test mode mean?', a: 'Test mode uses fake money on a test blockchain. It is for trying out the platform without risk. Real mode uses actual money on the production blockchain. You will see a yellow TEST MODE badge when in test mode.' }
    ]
  },
  {
    section: 'Creating Transactions',
    id: 'transactions',
    items: [
      { q: 'How do I create a transaction?', a: 'Click New Transaction and fill in: amount in USD, other party email, description (optional but recommended), and your role (sender or recipient). They will receive an email to accept the terms. Once accepted, you can fund it.' },
      { q: 'What happens after I create a transaction?', a: 'The other party receives an email invitation. They review the terms and either accept or decline. If accepted, the sender funds the transaction. Money stays locked in a secure vault until both parties approve release.' },
      { q: 'Can I cancel a transaction?', a: 'Yes, but only before it is funded. Once money is in the vault, you need mutual agreement or settlement. Click the transaction and look for Cancel option.' },
      { q: 'What if the other party declines?', a: 'The transaction closes immediately. No money changes hands. You can create a new transaction if you want to try again with different terms.' }
    ]
  },
  {
    section: 'Withdrawing to Bank',
    id: 'withdrawal',
    items: [
      { q: 'How do I withdraw money to my bank account?', a: 'When you have funds available: (1) Click Withdraw to bank on your dashboard, (2) Connect your wallet (automatic - just confirm with email), (3) The USDC transfer happens automatically, (4) Enter your bank account details, (5) Money arrives in 1-3 business days.' },
      { q: 'Do I need a crypto wallet to withdraw?', a: 'No. When you signed up, we created a wallet for you automatically using just your email. You never need to download MetaMask, Binance, or any crypto apps.' },
      { q: 'What are gas fees? Do I pay them?', a: 'Gas fees are blockchain transaction costs (usually $0.01-0.05). You never pay them - escrowhaven.io covers all blockchain fees automatically when you withdraw.' },
      { q: 'Why does the withdrawal mention cryptocurrency?', a: 'Our payment partner (Onramp.money) converts your digital dollars (USDC) to regular money in your bank. They may use crypto terminology like MetaMask or wallet - you can ignore it. Just follow the steps like any normal checkout. Your wallet is email-based.' },
      { q: 'What is USDC?', a: 'USDC is a digital dollar - always worth exactly $1.00. It is how we store your payment securely on the blockchain. When you withdraw, it automatically converts to regular dollars in your bank account. You never need to think about it.' },
      { q: 'How long does withdrawal take?', a: 'Usually 1-3 business days from when you complete the Onramp checkout to when money hits your bank. You will receive confirmation emails along the way.' },
      { q: 'What if I get stuck during withdrawal?', a: 'Common issues: (1) Connect wallet - just confirm with your email, no app needed. (2) Approve USDC - this happens automatically, no action needed. (3) Bank details - enter them like any normal payment form. If still stuck, contact us immediately via the Feedback button.' }
    ]
  },
  {
    section: 'Fees and Pricing',
    id: 'fees',
    items: [
      { q: 'What are the fees?', a: 'Recipients pay 1.99% when payment is released. Senders pay nothing. Example: $100 transaction = recipient receives $98.01. No hidden fees, no monthly charges, no setup costs.' },
      { q: 'Who pays blockchain fees?', a: 'escrowhaven.io pays all blockchain (gas) fees. You never see them or pay them. This includes transaction fees, withdrawal fees, and any smart contract interactions.' },
      { q: 'Are there withdrawal fees?', a: 'Our platform has no withdrawal fees. Onramp.money (our bank transfer partner) may charge a small fee depending on your country and payment method - they will show you the exact amount before you confirm.' }
    ]
  },
  {
    section: 'Security and Safety',
    id: 'security',
    items: [
      { q: 'How is my money protected?', a: 'Funds are locked in smart contracts on the Polygon blockchain - like digital vaults with mathematically enforced rules. Only the specific conditions you agreed to can unlock them. Not even escrowhaven can access your money.' },
      { q: 'What if there is a dispute?', a: 'You have two options: (1) Propose a settlement - split the money however you both agree. (2) Request arbitration - a neutral third party (Kleros) decides based on evidence. Both parties must agree to use arbitration.' },
      { q: 'Can payments be reversed or charged back?', a: 'No. Once released, payments are final. This protects sellers from chargeback fraud. Buyers are protected because money stays locked until they approve release.' },
      { q: 'What if I send money to the wrong person?', a: 'Before funding, double-check the email address. Once funded, you need the other party to agree to refund. Blockchain transactions are irreversible, so verify everything before confirming.' }
    ]
  },
  {
    section: 'Common Issues',
    id: 'issues',
    items: [
      { q: 'I cannot access the site / getting 403 error', a: 'Try: (1) Clear browser cache and cookies, (2) Use incognito/private mode, (3) Try a different browser, (4) Use mobile data instead of WiFi, (5) Try a VPN. If none work, contact us - it may be a network restriction.' },
      { q: 'Email verification link is not working', a: 'Check spam folder. Link expires after 1 hour - request a new one. Make sure you are using the same browser/device. Try copying the link into a private/incognito window.' },
      { q: 'Transaction shows Waiting - what do I do?', a: 'Check who needs to act: (1) If you are waiting on the other party, they need to accept, fund, or approve. (2) If it says You need to act - click the transaction to see what action is required. Check your email for notifications.' },
      { q: 'I clicked Release but nothing happened', a: 'Check your email for a Magic login link. You need to sign the release authorization. If you do not see the email, check spam. The signature proves you approved the release - it is a security feature.' }
    ]
  }
];

export default function HelpPage() {
  const router = useRouter();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (sectionId: string, itemIndex: number) => {
    const key = `${sectionId}-${itemIndex}`;
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#E0E2E7] bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-xl font-normal text-black hover:opacity-80">
            escrowhaven<span className="text-[#2962FF]">.io</span>
          </button>
          <button onClick={() => router.push('/')} className="text-sm text-[#787B86] hover:text-black">
            Back to Homepage
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-normal text-black mb-3">Help Center</h1>
        <p className="text-lg text-[#787B86] mb-16">Everything you need to know about using escrowhaven</p>

        <div className="mb-12 p-5 bg-[#F8F9FD] rounded-xl border border-[#E0E2E7]">
          <h2 className="text-sm font-medium text-black mb-3">Jump to section</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {faqs.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-sm text-[#2962FF] hover:underline">
                {s.section}
              </a>
            ))}
          </div>
        </div>

        {faqs.map((faqSection) => (
          <section key={faqSection.id} id={faqSection.id} className="mb-16">
            <h2 className="text-4xl font-normal text-black mb-8 pb-3 border-b border-[#E0E2E7]">
              {faqSection.section}
            </h2>
            <div className="space-y-4">
              {faqSection.items.map((item, idx) => {
                const itemKey = `${faqSection.id}-${idx}`;
                const isOpen = openItems.has(itemKey);
                return (
                  <div key={idx} className="border border-[#E0E2E7] rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleItem(faqSection.id, idx)}
                      className="w-full px-6 py-4 flex items-start justify-between gap-4 text-left hover:bg-[#F8F9FD]"
                    >
                      <span className="text-base font-normal text-black flex-1">{item.q}</span>
                      <svg className={`w-5 h-5 text-[#787B86] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-base text-[#787B86] leading-relaxed">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="mt-20 p-8 bg-[#F8F9FD] rounded-xl border border-[#E0E2E7] text-center">
          <h2 className="text-3xl font-normal text-black mb-2">Still need help?</h2>
          <p className="text-base text-[#787B86] mb-8">Cannot find what you are looking for? We are here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:hello@escrowhaven.io" className="px-8 py-3 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] font-medium">
              Contact Support
            </a>
            <button onClick={() => router.push('/')} className="px-8 py-3 border border-[#E0E2E7] text-[#787B86] rounded-lg hover:bg-white hover:text-black">
              Back to Homepage
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-24 py-8 border-t border-[#E0E2E7]">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-[#787B86]">
          <p>© 2025 escrowhaven.io - Secure payments, zero chargebacks</p>
        </div>
      </footer>
    </div>
  );
}