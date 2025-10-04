// src/components/escrow/TransactionSuccessModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionSuccessModalProps {
  escrow: any;
  role: 'payer' | 'recipient' | null;
  onClose: () => void;
}

export default function TransactionSuccessModal({ escrow, role, onClose }: TransactionSuccessModalProps) {
  const { supabase, user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const amount = escrow.amount_cents / 100;
  const verificationLink = `${window.location.origin}/verify/${escrow.id}`;
  
  // Fire confetti on mount
  useEffect(() => {
    const fireConfetti = async () => {
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (error) {
        console.log('Confetti not installed');
      }
    };
    
    setTimeout(fireConfetti, 100);
  }, []);

  const shareTemplates = {
    reddit: {
      title: role === 'recipient' 
        ? `Received $${amount} payment through escrowhaven - protected & instant`
        : `Sent $${amount} through escrowhaven - smooth transaction`,
      url: verificationLink
    },
    twitter: {
      text: role === 'recipient'
        ? `Just received $${amount} through escrowhaven ✅\n\nProtected payment, zero chargebacks, instant release.\n\nVerify: ${verificationLink}`
        : `Sent $${amount} through escrowhaven ✅\n\nProtected for both parties, released instantly.\n\nVerify: ${verificationLink}`
    }
  };

  const handleRedditShare = () => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareTemplates.reddit.url)}&title=${encodeURIComponent(shareTemplates.reddit.title)}`;
    window.open(redditUrl, '_blank', 'width=900,height=650');
    trackShare('reddit');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTemplates.twitter.text)}`;
    window.open(url, '_blank', 'width=550,height=420');
    trackShare('twitter');
  };

  const handleCopyLink = async () => {
    const text = role === 'recipient'
      ? `✅ Just received $${amount} through escrowhaven\n\nProtected by smart contracts, no chargebacks possible, instant release on delivery.\n\nProof: ${verificationLink}`
      : `✅ Sent $${amount} through escrowhaven\n\nSmooth transaction with protection for both parties.\n\nProof: ${verificationLink}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare('copy');
  };

  const trackShare = async (platform: string) => {
    try {
      await supabase
        .from('share_events')
        .insert({
          escrow_id: escrow.id,
          platform,
          user_role: role,
          shared_by_email: user?.email
        });
    } catch (err) {
      console.error('Share tracking error:', err);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-lg">
        {/* Success Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50">
            <svg className="w-8 h-8" fill="none" stroke="#26A69A" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-normal text-black mb-2">
            {role === 'recipient' ? 'Payment Received!' : 'Payment Sent!'}
          </h2>
          
          <p className="text-[#787B86]">
            {role === 'recipient' 
              ? `You received $${(amount * 0.9801).toFixed(2)} (after 1.99% fee)`
              : `$${amount.toFixed(2)} sent successfully`
            }
          </p>
        </div>

        {/* Share Section */}
        <div className="px-6 pb-4">
          <div className="bg-[#F8F9FD] rounded-lg p-4 border border-[#E0E2E7]">
            <p className="text-sm font-medium text-black mb-3">
              Share your success story
            </p>
            
            <div className="space-y-2">
              <button
                onClick={handleRedditShare}
                className="w-full py-2.5 px-4 bg-white rounded-lg flex items-center justify-between border border-[#E0E2E7] hover:bg-[#F8F9FD] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50">
                    <span className="font-bold text-sm text-orange-600">R</span>
                  </div>
                  <span className="text-sm text-black">Share on Reddit</span>
                </div>
                <svg className="w-4 h-4 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleTwitterShare}
                className="w-full py-2.5 px-4 bg-white rounded-lg flex items-center justify-between border border-[#E0E2E7] hover:bg-[#F8F9FD] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                    <span className="font-bold text-sm text-blue-600">X</span>
                  </div>
                  <span className="text-sm text-black">Share on X/Twitter</span>
                </div>
                <svg className="w-4 h-4 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-white rounded-lg flex items-center justify-between border border-[#E0E2E7] hover:bg-[#F8F9FD] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${copied ? 'bg-green-50' : 'bg-blue-50'}`}>
                    {copied ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-black">
                    {copied ? 'Copied to clipboard!' : 'Copy message'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-[#787B86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-center text-[#787B86] mt-3 pt-3 border-t border-[#E0E2E7]">
              Help others discover secure payments
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#2962FF] text-white text-sm font-medium rounded-lg hover:bg-[#1E53E5] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}