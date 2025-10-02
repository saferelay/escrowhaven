// src/app/learn/how-escrow-protects-you/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HowEscrowProtectsYou() {
  const router = useRouter();
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky CTA Bar - Mobile */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E2E7] py-3 px-4 z-50 transition-transform duration-300 lg:hidden ${
        showStickyBar ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <button
          onClick={() => router.push('/signup')}
          className="w-full py-3 px-6 bg-[#2962FF] text-white rounded-[8px] font-medium text-[14px] hover:bg-[#1E53E5] transition-all"
        >
          Start Protected Transaction →
        </button>
      </div>

      {/* Desktop Sticky CTA */}
      <div className={`hidden lg:block fixed bottom-8 right-8 z-50 transition-all duration-300 ${
        showStickyBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>
        <button
          onClick={() => router.push('/signup')}
          className="px-8 py-4 bg-[#2962FF] text-white rounded-[12px] font-medium text-[16px] hover:bg-[#1E53E5] transition-all shadow-lg hover:shadow-xl transform hover:translate-y-[-2px]"
        >
          Start Protected Transaction →
        </button>
      </div>

      {/* Hero Section */}
      <section className="border-b border-[#E0E2E7] py-12 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button 
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-[14px] text-[#787B86] hover:text-[#2962FF] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
          
          <div className="max-w-3xl">
            <h1 className="text-[32px] sm:text-[40px] lg:text-[56px] font-normal text-[#000000] mb-4 leading-[1.1]">
              How Escrow Protects Your Money
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#787B86] leading-[1.6]">
              Learn how escrow creates a safe space for online transactions, protecting both buyers and sellers from fraud.
            </p>
          </div>
        </div>
      </section>

      {/* What is Escrow - Educational Section */}
      <section className="py-12 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-normal text-[#000000] mb-6 leading-[1.2]">
              What is Escrow?
            </h2>
            
            <div className="space-y-4 mb-12">
              <p className="text-[16px] text-[#787B86] leading-[1.6]">
                Imagine you're buying something expensive from someone online you've never met. You don't want to send money first because they might not deliver. They don't want to deliver first because you might not pay.
              </p>
              <p className="text-[16px] text-[#787B86] leading-[1.6]">
                <strong className="text-[#000000]">Escrow solves this problem.</strong> It's like having a trusted friend hold the money while the transaction happens. The seller knows the money exists and is waiting for them. The buyer knows their money is safe until they receive what they paid for.
              </p>
              <p className="text-[16px] text-[#787B86] leading-[1.6]">
                EscrowHaven takes this concept and makes it even better by using blockchain technology—meaning no single person or company controls your money. It's locked by code that can't be changed.
              </p>
            </div>
          </div>

          {/* Simple Visual Comparison */}
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 mt-12">
            {/* Without Escrow */}
            <div className="bg-white border border-[#EF5350]/30 rounded-[12px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#EF5350]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#EF5350]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-medium text-[#000000]">Without Escrow</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-[#EF5350] mt-1">×</span>
                  <p className="text-[14px] text-[#787B86]">Send money directly to stranger</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF5350] mt-1">×</span>
                  <p className="text-[14px] text-[#787B86]">Hope they deliver as promised</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF5350] mt-1">×</span>
                  <p className="text-[14px] text-[#787B86]">No recourse if something goes wrong</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#EF5350] mt-1">×</span>
                  <p className="text-[14px] text-[#787B86]">Risk of chargebacks for sellers</p>
                </div>
              </div>
            </div>

            {/* With Escrow */}
            <div className="bg-white border border-[#26A69A]/30 rounded-[12px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#26A69A]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-medium text-[#000000]">With EscrowHaven</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-[#26A69A] mt-1">✓</span>
                  <p className="text-[14px] text-[#787B86]">Money held in secure vault</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#26A69A] mt-1">✓</span>
                  <p className="text-[14px] text-[#787B86]">Seller delivers knowing payment is secured</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#26A69A] mt-1">✓</span>
                  <p className="text-[14px] text-[#787B86]">Options to resolve disputes fairly</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#26A69A] mt-1">✓</span>
                  <p className="text-[14px] text-[#787B86]">No chargebacks once released</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Consistent with Marketing Page */}
      <section className="py-12 lg:py-24 bg-[#F8F9FD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-normal text-[#000000] mb-4 leading-[1.2]">
              How EscrowHaven Works
            </h2>
            <p className="text-[16px] text-[#787B86] max-w-2xl mx-auto">
              Four simple steps to complete a protected transaction
            </p>
          </div>

          {/* Steps Grid - Mobile */}
          <div className="block sm:hidden space-y-6">
            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#2962FF] text-white flex items-center justify-center flex-shrink-0">
                  <span className="font-medium">1</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-[#000000] mb-2">Create Transaction</h3>
                  <p className="text-[14px] text-[#787B86] leading-[1.5]">
                    Set up your agreement with payment amount and description. Both parties receive a unique link to the transaction.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#2962FF] text-white flex items-center justify-center flex-shrink-0">
                  <span className="font-medium">2</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-[#000000] mb-2">Accept Terms</h3>
                  <p className="text-[14px] text-[#787B86] leading-[1.5]">
                    Both parties review and digitally accept the terms. This creates your secure vault on the blockchain.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#2962FF] text-white flex items-center justify-center flex-shrink-0">
                  <span className="font-medium">3</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-[#000000] mb-2">Fund Vault</h3>
                  <p className="text-[14px] text-[#787B86] leading-[1.5]">
                    Buyer sends payment to the secure vault using card, bank, or Apple/Google Pay. Money is locked safely.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#26A69A] text-white flex items-center justify-center flex-shrink-0">
                  <span className="font-medium">4</span>
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-[#000000] mb-2">Release Payment</h3>
                  <p className="text-[14px] text-[#787B86] leading-[1.5]">
                    After delivery, buyer releases funds to seller. Or negotiate a fair settlement if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Steps Grid - Desktop */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6 hover:border-[#2962FF] transition-all">
              <div className="w-12 h-12 rounded-full bg-[#2962FF] text-white flex items-center justify-center mb-4">
                <span className="text-[18px] font-medium">1</span>
              </div>
              <h3 className="text-[16px] font-medium text-[#000000] mb-2">Create Transaction</h3>
              <p className="text-[14px] text-[#787B86] leading-[1.5]">
                Set up your agreement with payment amount and description
              </p>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6 hover:border-[#2962FF] transition-all">
              <div className="w-12 h-12 rounded-full bg-[#2962FF] text-white flex items-center justify-center mb-4">
                <span className="text-[18px] font-medium">2</span>
              </div>
              <h3 className="text-[16px] font-medium text-[#000000] mb-2">Accept Terms</h3>
              <p className="text-[14px] text-[#787B86] leading-[1.5]">
                Both parties review and accept the transaction terms
              </p>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6 hover:border-[#2962FF] transition-all">
              <div className="w-12 h-12 rounded-full bg-[#2962FF] text-white flex items-center justify-center mb-4">
                <span className="text-[18px] font-medium">3</span>
              </div>
              <h3 className="text-[16px] font-medium text-[#000000] mb-2">Fund Vault</h3>
              <p className="text-[14px] text-[#787B86] leading-[1.5]">
                Buyer sends payment to the secure blockchain vault
              </p>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E0E2E7] p-6 hover:border-[#26A69A] transition-all">
              <div className="w-12 h-12 rounded-full bg-[#26A69A] text-white flex items-center justify-center mb-4">
                <span className="text-[18px] font-medium">4</span>
              </div>
              <h3 className="text-[16px] font-medium text-[#000000] mb-2">Release Payment</h3>
              <p className="text-[14px] text-[#787B86] leading-[1.5]">
                After delivery, funds are released to the seller
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Vault Concept */}
      <section className="py-12 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-normal text-[#000000] mb-6 leading-[1.2]">
                Your Money in a Digital Vault
              </h2>
              <div className="space-y-4">
                <p className="text-[16px] text-[#787B86] leading-[1.6]">
                  When you fund a transaction, your money goes into what we call a "vault"—a smart contract on the blockchain that acts like a digital safe.
                </p>
                <p className="text-[16px] text-[#787B86] leading-[1.6]">
                  Think of it like a locked box where:
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#2962FF] text-[12px]">•</span>
                    </div>
                    <p className="text-[15px] text-[#787B86]">
                      <strong className="text-[#000000]">Both parties have a key</strong> - Neither can open it alone
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#2962FF] text-[12px]">•</span>
                    </div>
                    <p className="text-[15px] text-[#787B86]">
                      <strong className="text-[#000000]">The rules are unchangeable</strong> - Set in blockchain code
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#2962FF] text-[12px]">•</span>
                    </div>
                    <p className="text-[15px] text-[#787B86]">
                      <strong className="text-[#000000]">We can't touch it</strong> - EscrowHaven has no access
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2962FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#2962FF] text-[12px]">•</span>
                    </div>
                    <p className="text-[15px] text-[#787B86]">
                      <strong className="text-[#000000]">It's transparent</strong> - View balance on the blockchain
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Vault Visualization */}
            <div className="bg-[#F8F9FD] rounded-[16px] border border-[#E0E2E7] p-8">
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-white rounded-[16px] border-4 border-[#2962FF] flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#2962FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  {/* Keys */}
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 text-center">
                    <div className="w-10 h-10 mx-auto bg-white rounded-full border-2 border-[#787B86] flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-[#787B86]">Buyer's Key</p>
                  </div>
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 text-center">
                    <div className="w-10 h-10 mx-auto bg-white rounded-full border-2 border-[#787B86] flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-[#787B86]">Seller's Key</p>
                  </div>
                </div>
                <p className="text-center text-[14px] text-[#787B86]">
                  Both keys needed to open the vault
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resolution Options */}
      <section className="py-12 lg:py-24 bg-[#F8F9FD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-normal text-[#000000] mb-4 leading-[1.2]">
              Multiple Ways to Complete
            </h2>
            <p className="text-[16px] text-[#787B86] max-w-2xl mx-auto">
              Flexibility to handle any situation that might come up
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E0E2E7] rounded-[12px] p-6">
              <div className="w-12 h-12 rounded-lg bg-[#26A69A]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-medium text-[#000000] mb-2">Full Release</h3>
              <p className="text-[14px] text-[#787B86] mb-3">
                Everything went perfectly? Buyer releases full payment to seller instantly.
              </p>
              <p className="text-[12px] text-[#B2B5BE]">
                Most common outcome
              </p>
            </div>

            <div className="bg-white border border-[#E0E2E7] rounded-[12px] p-6">
              <div className="w-12 h-12 rounded-lg bg-[#F7931A]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#F7931A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-medium text-[#000000] mb-2">Partial Settlement</h3>
              <p className="text-[14px] text-[#787B86] mb-3">
                Partial delivery? Agree on a fair split. Both must approve the new terms.
              </p>
              <p className="text-[12px] text-[#B2B5BE]">
                Flexible resolution
              </p>
            </div>

            <div className="bg-white border border-[#E0E2E7] rounded-[12px] p-6">
              <div className="w-12 h-12 rounded-lg bg-[#787B86]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <h3 className="text-[18px] font-medium text-[#000000] mb-2">Full Refund</h3>
              <p className="text-[14px] text-[#787B86] mb-3">
                Can't complete the work? Seller can refund 100% back to buyer.
              </p>
              <p className="text-[12px] text-[#B2B5BE]">
                Clean cancellation
              </p>
            </div>
          </div>

          {/* Coming Soon - Arbitration */}
          <div className="mt-8 bg-[#FFF9F0] border border-[#F7931A] rounded-[12px] p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#F7931A]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#F7931A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-medium text-[#000000] mb-2">
                  Arbitration Coming Soon
                </h3>
                <p className="text-[14px] text-[#787B86] mb-3">
                  Can't agree? Soon you'll be able to request neutral arbitration. Independent reviewers will examine evidence and make a fair decision.
                </p>
                <p className="text-[12px] text-[#B2B5BE]">
                  Powered by Kleros decentralized arbitration
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-12 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-normal text-[#000000] mb-4 leading-[1.2]">
              Why This Matters for You
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div>
              <h3 className="text-[20px] font-medium text-[#000000] mb-4 flex items-center gap-2">
                <span className="text-[#2962FF]">For Buyers</span>
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">Pay safely without risk of losing money</p>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">Seller motivated to deliver as promised</p>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">Control when payment is released</p>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">Options if something goes wrong</p>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[20px] font-medium text-[#000000] mb-4 flex items-center gap-2">
                <span className="text-[#26A69A]">For Sellers</span>
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">Know payment is guaranteed</p>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">No chargebacks after delivery</p>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">Instant payment when released</p>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#26A69A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-[14px] text-[#787B86]">Build trust with new clients</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 border-t border-[#E0E2E7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[28px] sm:text-[32px] lg:text-[40px] font-normal text-[#000000] mb-4 leading-[1.2]">
              Ready to Try Protected Payments?
            </h2>
            <p className="text-[16px] text-[#787B86] mb-8">
              Create your first escrow transaction in minutes. Free to start, only pay 1.99% on successful transactions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-4 bg-[#2962FF] text-white rounded-[8px] font-medium text-[16px] hover:bg-[#1E53E5] transition-all transform hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
              >
                Start Free Account
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-white text-[#787B86] border border-[#E0E2E7] rounded-[8px] font-medium text-[16px] hover:border-[#787B86] hover:text-[#000000] transition-all"
              >
                Learn More
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-[14px] text-[#787B86]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Start in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add padding at bottom for mobile sticky CTA */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
}