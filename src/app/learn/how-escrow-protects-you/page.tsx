// src/app/learn/how-escrow-protects-you/page.tsx
export default function HowEscrowProtectsYou() {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="border-b border-[#E0E2E7] py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="mb-6">
              <a href="/" className="inline-flex items-center gap-2 text-[14px] text-[#787B86] hover:text-[#2962FF]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </a>
            </div>
            <h1 className="text-[40px] lg:text-[56px] font-normal text-[#000000] mb-4 leading-[1.1]">
              How Escrow Protects You
            </h1>
            <p className="text-[18px] text-[#787B86] leading-[1.6]">
              Understanding blockchain-secured transactions and how EscrowHaven keeps your money safe
            </p>
          </div>
        </section>
  
        {/* What is Escrow */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-[30px] lg:text-[40px] font-normal text-[#000000] mb-6 leading-[1.2]">
              What is Escrow?
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-[16px] text-[#787B86] leading-[1.6] mb-4">
                Escrow is a financial arrangement where a third party holds and regulates payment between two parties in a transaction. It helps protect both buyer and seller by ensuring that funds are only released when all conditions of the agreement are met.
              </p>
              <p className="text-[16px] text-[#787B86] leading-[1.6] mb-6">
                Think of it as a neutral middleman: the client sends money to a secure vault, the freelancer completes the work, and then the client releases payment from the vault. Neither party can access the funds without mutual agreement.
              </p>
            </div>
  
            {/* Visual Diagram */}
            <div className="bg-[#F8F9FD] rounded-[12px] border border-[#E0E2E7] p-8 my-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white border border-[#E0E2E7] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium text-[#000000]">Client</p>
                  <p className="text-[12px] text-[#787B86]">Sends payment</p>
                </div>
  
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-[12px] bg-white border-2 border-[#2962FF] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium text-[#2962FF]">Escrow Vault</p>
                  <p className="text-[12px] text-[#787B86]">Holds funds securely</p>
                </div>
  
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white border border-[#E0E2E7] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium text-[#000000]">Freelancer</p>
                  <p className="text-[12px] text-[#787B86]">Receives payment</p>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* How EscrowHaven Works */}
        <section className="py-16 lg:py-24 bg-[#F8F9FD]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-[30px] lg:text-[40px] font-normal text-[#000000] mb-8 leading-[1.2]">
              How EscrowHaven Works
            </h2>
  
            {/* Technical Flow */}
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Transaction Created",
                  description: "When you start an escrow, we generate a unique smart contract vault on Polygon blockchain. This vault has a specific address where funds will be held.",
                  tech: "Your vault address is computed using CREATE2, ensuring predictable deployment and transparency."
                },
                {
                  step: "2",
                  title: "Terms Agreement",
                  description: "Both parties review the terms (amount, description, parties) and digitally accept. No funds move until both sides agree.",
                  tech: "Acceptance is recorded in our database with timestamps. The blockchain vault awaits funding."
                },
                {
                  step: "3",
                  title: "Secure Funding",
                  description: "The client pays using credit card, bank transfer, Apple Pay, or Google Pay. Transak converts this to USDC and sends it directly to your vault address on Polygon.",
                  tech: "Payment arrives as USDC stablecoin (1 USDC = $1 USD). The smart contract is deployed and funds are locked at the vault address."
                },
                {
                  step: "4",
                  title: "Work Delivery",
                  description: "The freelancer completes work knowing payment is secured. The client can't withdraw or cancel. The vault is locked until both parties take action.",
                  tech: "Smart contract enforces custody. Only release, refund, or settlement functions can move funds."
                },
                {
                  step: "5",
                  title: "Release Options",
                  description: "Multiple ways to complete the transaction:",
                  options: [
                    "Full Release: Client approves → Freelancer receives 98.01% (1.99% fee)",
                    "Partial Settlement: Both parties agree on custom split",
                    "Full Refund: Freelancer returns 100% to client",
                    "Arbitration: Third-party resolution (coming soon)"
                  ]
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-[12px] border border-[#E0E2E7] p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full border-2 border-[#2962FF] bg-white flex items-center justify-center">
                        <span className="text-[16px] font-medium text-[#2962FF]">{item.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[20px] font-medium text-[#000000] mb-2">{item.title}</h3>
                      <p className="text-[16px] text-[#787B86] leading-[1.6] mb-3">
                        {item.description}
                      </p>
                      {item.options && (
                        <ul className="space-y-2 mb-3">
                          {item.options.map((option, i) => (
                            <li key={i} className="flex gap-2 text-[14px] text-[#787B86]">
                              <span className="text-[#2962FF]">•</span>
                              <span>{option}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.tech && (
                        <div className="bg-[#F8F9FD] rounded-[8px] p-3 mt-3">
                          <p className="text-[12px] text-[#787B86] font-mono">{item.tech}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Settlement Actions */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-[30px] lg:text-[40px] font-normal text-[#000000] mb-6 leading-[1.2]">
              Settlement Actions
            </h2>
            <p className="text-[16px] text-[#787B86] leading-[1.6] mb-8">
              When your transaction vault is funded, you have multiple options to complete the transaction:
            </p>
  
            <div className="grid gap-6">
              <div className="border border-[#E0E2E7] rounded-[12px] p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#26A69A]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-medium text-[#000000] mb-2">Full Release</h3>
                    <p className="text-[14px] text-[#787B86] leading-[1.5] mb-2">
                      Client clicks "Release Payment" and signs a digital authorization. Funds move instantly to freelancer's wallet.
                    </p>
                    <p className="text-[12px] text-[#787B86]">
                      <span className="font-medium">Freelancer receives:</span> 98.01% of vault balance (1.99% platform fee)
                    </p>
                  </div>
                </div>
              </div>
  
              <div className="border border-[#E0E2E7] rounded-[12px] p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F7931A]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#F7931A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-medium text-[#000000] mb-2">Partial Settlement</h3>
                    <p className="text-[14px] text-[#787B86] leading-[1.5] mb-2">
                      Either party can propose a custom split. For example: Client gets 40% back, Freelancer receives 60%. Both must approve the proposal.
                    </p>
                    <p className="text-[12px] text-[#787B86]">
                      <span className="font-medium">Use case:</span> Partial delivery, scope changes, or mutual agreement on adjusted terms
                    </p>
                  </div>
                </div>
              </div>
  
              <div className="border border-[#E0E2E7] rounded-[12px] p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#787B86]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-medium text-[#000000] mb-2">Full Refund</h3>
                    <p className="text-[14px] text-[#787B86] leading-[1.5] mb-2">
                      Freelancer can initiate a refund to return 100% of funds to the client. Useful if you can't complete the work or cancel the project.
                    </p>
                    <p className="text-[12px] text-[#787B86]">
                      <span className="font-medium">Client receives:</span> 100% of vault balance back to their wallet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Arbitration Section */}
        <section className="py-16 lg:py-24 bg-[#F8F9FD]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="border border-[#F7931A] rounded-[12px] p-8 bg-[#FFF9F0]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#F7931A]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#F7931A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[20px] font-medium text-[#000000] mb-2">Arbitration (Coming Soon)</h3>
                  <p className="text-[16px] text-[#787B86] leading-[1.6] mb-4">
                    If you can't agree on a settlement, you'll be able to escalate to decentralized arbitration through Kleros Protocol. Independent jurors review evidence and vote on the outcome.
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2 text-[14px] text-[#787B86]">
                      <span className="text-[#F7931A]">•</span>
                      <span>Submit evidence and arguments</span>
                    </div>
                    <div className="flex gap-2 text-[14px] text-[#787B86]">
                      <span className="text-[#F7931A]">•</span>
                      <span>Decentralized jurors review the case</span>
                    </div>
                    <div className="flex gap-2 text-[14px] text-[#787B86]">
                      <span className="text-[#F7931A]">•</span>
                      <span>Majority vote determines fund distribution</span>
                    </div>
                    <div className="flex gap-2 text-[14px] text-[#787B86]">
                      <span className="text-[#F7931A]">•</span>
                      <span>Smart contract executes the decision automatically</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Security Features */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-[30px] lg:text-[40px] font-normal text-[#000000] mb-8 leading-[1.2]">
              Why Blockchain Security Matters
            </h2>
  
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border border-[#E0E2E7] rounded-[12px] p-6">
                <h3 className="text-[18px] font-medium text-[#000000] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Non-Custodial
                </h3>
                <p className="text-[14px] text-[#787B86] leading-[1.5]">
                  EscrowHaven never holds your money. Funds go directly to a smart contract vault controlled by you and the other party. We can't access, freeze, or seize your funds.
                </p>
              </div>
  
              <div className="border border-[#E0E2E7] rounded-[12px] p-6">
                <h3 className="text-[18px] font-medium text-[#000000] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Immutable
                </h3>
                <p className="text-[14px] text-[#787B86] leading-[1.5]">
                  Smart contracts execute exactly as programmed with no possibility of downtime, censorship, fraud, or third-party interference. The rules are locked in code.
                </p>
              </div>
  
              <div className="border border-[#E0E2E7] rounded-[12px] p-6">
                <h3 className="text-[18px] font-medium text-[#000000] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Transparent
                </h3>
                <p className="text-[14px] text-[#787B86] leading-[1.5]">
                  Every transaction is recorded on Polygon's public blockchain. You can verify your vault address, check the balance, and see transaction history at any time on PolygonScan.
                </p>
              </div>
  
              <div className="border border-[#E0E2E7] rounded-[12px] p-6">
                <h3 className="text-[18px] font-medium text-[#000000] mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  No Chargebacks
                </h3>
                <p className="text-[14px] text-[#787B86] leading-[1.5]">
                  Blockchain transactions are final. Freelancers never face payment reversals after delivering work. Once funds are released, they're yours permanently.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Technical Details */}
        <section className="py-16 lg:py-24 bg-[#F8F9FD]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-[30px] lg:text-[40px] font-normal text-[#000000] mb-6 leading-[1.2]">
              Technical Details
            </h2>
            
            <div className="space-y-4">
              <details className="bg-white border border-[#E0E2E7] rounded-[12px] overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer hover:bg-[#F8F9FD] font-medium text-[#000000] flex items-center justify-between">
                  What blockchain do you use?
                  <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-[14px] text-[#787B86] leading-[1.6]">
                  <p>We use Polygon (formerly Matic), an Ethereum Layer 2 scaling solution. Polygon offers fast transactions (2-second confirmations), low fees (fractions of a cent), and full Ethereum security. Your funds are stored as USDC (USD Coin), a stablecoin pegged 1:1 to the US dollar.</p>
                </div>
              </details>
  
              <details className="bg-white border border-[#E0E2E7] rounded-[12px] overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer hover:bg-[#F8F9FD] font-medium text-[#000000] flex items-center justify-between">
                  How are smart contracts deployed?
                  <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-[14px] text-[#787B86] leading-[1.6]">
                  <p>When funding is initiated, we deploy your escrow vault using the CREATE2 opcode. This generates a deterministic address based on your unique transaction parameters (parties, salt). The vault is deployed only when needed, saving gas costs. You can view the deployment transaction and vault address on PolygonScan.</p>
                </div>
              </details>
  
              <details className="bg-white border border-[#E0E2E7] rounded-[12px] overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer hover:bg-[#F8F9FD] font-medium text-[#000000] flex items-center justify-between">
                  Who pays gas fees?
                  <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-[14px] text-[#787B86] leading-[1.6]">
                  <p>EscrowHaven pays all blockchain gas fees. You sign transactions with your Magic wallet (gasless signatures), and we submit them to the blockchain. This keeps the experience simple—you never need to own crypto or worry about transaction costs. Our 1.99% platform fee covers all gas costs.</p>
                </div>
              </details>
  
              <details className="bg-white border border-[#E0E2E7] rounded-[12px] overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer hover:bg-[#F8F9FD] font-medium text-[#000000] flex items-center justify-between">
                  What is USDC and why do you use it?
                  <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-[14px] text-[#787B86] leading-[1.6]">
                  <p>USDC (USD Coin) is a stablecoin—a cryptocurrency pegged to the US dollar at a 1:1 ratio. It's issued by Circle and backed by fully reserved assets. We use USDC because it eliminates price volatility: $100 USDC always equals $100 USD. When you cash out, Transak converts USDC back to dollars and sends it to your bank.</p>
                </div>
              </details>
  
              <details className="bg-white border border-[#E0E2E7] rounded-[12px] overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer hover:bg-[#F8F9FD] font-medium text-[#000000] flex items-center justify-between">
                  Can EscrowHaven access my funds?
                  <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-[14px] text-[#787B86] leading-[1.6]">
                  <p>No. Your funds are locked in a smart contract that only you and the other party control. The contract has no admin functions, no owner privileges, and no backdoors. EscrowHaven cannot freeze, seize, or access your funds under any circumstances. The code is immutable and publicly verifiable.</p>
                </div>
              </details>
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-16 lg:py-24 border-t border-[#E0E2E7]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-[30px] lg:text-[40px] font-normal text-[#000000] mb-4 leading-[1.2]">
              Ready to get started?
            </h2>
            <p className="text-[16px] text-[#787B86] mb-8">
              Create your first secure transaction in under 2 minutes
            </p>
            <button
              onClick={() => window.location.href = '/signup'}
              className="px-[32px] py-[12px] bg-[#2962FF] text-white rounded-[8px] font-medium text-[16px] hover:bg-[#1E53E5] transition-all duration-200"
            >
              Start Your First Transaction
            </button>
          </div>
        </section>
      </div>
    );
  }