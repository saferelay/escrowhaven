// app/faq/page.tsx
import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      question: "What is escrow?",
      answer: "Escrow is a financial arrangement where funds are held by a neutral third party (in our case, a smart contract) until both parties fulfill their obligations. The money is locked and only released when both the payer and recipient agree."
    },
    {
      question: "Who pays the 1.99% fee?",
      answer: "The recipient does. When funds are released, the recipient receives 98.01% of the total amount, and escrowhaven takes 1.99% as a platform fee."
    },
    {
      question: "How long do card payments take?",
      answer: "Typically minutes after approval. Once both parties approve the release, the smart contract automatically sends funds to the recipient's wallet, which can then be withdrawn to their bank account."
    },
    {
      question: "What happens if there's a dispute?",
      answer: "Funds stay locked in the escrow vault until both parties agree. Arbitration features are coming soon to help resolve disputes fairly when parties can't reach an agreement."
    },
    {
      question: "Do I need a crypto wallet?",
      answer: "No! We handle all the blockchain complexity for you. You can pay with your credit card and receive funds to your bank account."
    },
    {
      question: "Which countries are supported?",
      answer: "We support instant payouts to over 100 countries through our partner Transak. Contact us to check if your country is supported."
    },
    {
      question: "Is escrowhaven secure?",
      answer: "Yes. All funds are held in audited smart contracts on the blockchain. We never have access to your money - only you and your counterparty can release funds through mutual agreement."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, bank transfers, Apple Pay, Google Pay, and SEPA transfers through our payment partner Transak."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {faq.question}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-700 mb-4">
            We're here to help. Contact our support team for personalized assistance.
          </p>
          <a 
            href="mailto:support@escrowhaven.io" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}