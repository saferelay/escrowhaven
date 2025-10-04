// src/components/escrow/TransactionSuccessModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Note: You'll need to install canvas-confetti: npm install canvas-confetti
// import confetti from 'canvas-confetti';

interface TransactionSuccessModalProps {
  escrow: any;
  role: 'payer' | 'recipient' | null;
  onClose: () => void;
}

export default function TransactionSuccessModal({ escrow, role, onClose }: TransactionSuccessModalProps) {
  const { supabase, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareOption, setShareOption] = useState<'reddit' | 'twitter' | 'link' | null>(null);
  
  const amount = escrow.amount_cents / 100;
  const verificationLink = `${window.location.origin}/verify/${escrow.id}`;
  
  // Fire confetti on mount
  useEffect(() => {
    // Temporarily disable confetti if not installed
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
        ? `Just received $${amount} payment through EscrowHaven - instant & protected`
        : `Successfully sent $${amount} payment through EscrowHaven - zero issues`,
      // Reddit combines title + URL, text is optional
      url: verificationLink,
      // For subreddits that support text posts
      text: role === 'recipient' 
        ? `The escrow protection worked perfectly. Got paid instantly after delivery. Great for freelance work and online trading where you need payment protection.`
        : `Seller delivered as promised, funds released smoothly. Great for freelance work and online trading where you need payment protection.`
    },
    twitter: {
      text: role === 'recipient'
        ? `Just received $${amount} through @EscrowHaven ✅\n\nInstant payment, zero chargebacks, fully protected.\n\nProof: ${verificationLink}`
        : `Successfully sent $${amount} through @EscrowHaven ✅\n\nSeller delivered, payment released. Smooth transaction.\n\nProof: ${verificationLink}`
    }
  };

  const handleRedditShare = () => {
    // Reddit's submit URL format:
    // - 'url' parameter: The link to share (shows as the post URL)
    // - 'title' parameter: The post title
    // Note: Reddit doesn't support pre-filling text for link posts
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareTemplates.reddit.url)}&title=${encodeURIComponent(shareTemplates.reddit.title)}`;
    window.open(redditUrl, '_blank', 'width=900,height=650');
    trackShare('reddit');
    
    // Show a tip to the user
    setTimeout(() => {
      alert('Tip: After posting, add a comment with your experience to help others!');
    }, 1000);
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTemplates.twitter.text)}`;
    window.open(url, '_blank', 'width=550,height=420');
    trackShare('twitter');
  };

  const handleCopyLink = async () => {
    // Create a more viral-friendly message
    const text = role === 'recipient'
      ? `🎉 Just received $${amount} through EscrowHaven!\n\n✅ Payment protected by smart contracts\n✅ No chargebacks possible\n✅ Instant release on delivery\n\nProof: ${verificationLink}\n\n#FreelancePayments #CryptoEscrow`
      : `✅ Successfully sent $${amount} through EscrowHaven!\n\nSmooth transaction with full protection for both parties.\n\nProof: ${verificationLink}\n\n#SecurePayments #EscrowProtection`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare('copy');
  };

  const trackShare = async (platform: string) => {
    try {
      // Track sharing for analytics
      await supabase
        .from('share_events')
        .insert({
          escrow_id: escrow.id,
          platform,
          user_role: role,
          shared_by_email: user?.email
        })
        .then(({ error }) => {
          if (error) console.error('Failed to track share:', error);
        });
    } catch (err) {
      console.error('Share tracking error:', err);
    }
  };

  // Add keyboard escape handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg max-w-md w-full"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}
      >
        {/* Success Header */}
        <div className="relative px-6 pt-6 pb-4 text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(38, 166, 154, 0.1)' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="#26A69A" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-normal text-black mb-2">
            {role === 'recipient' ? 'Payment Received!' : 'Payment Sent!'}
          </h2>
          
          <p style={{ color: '#787B86' }}>
            {role === 'recipient' 
              ? `You received $${(amount * 0.9801).toFixed(2)} (after 1.99% fee)`
              : `$${amount.toFixed(2)} sent to ${escrow.freelancer_email}`
            }
          </p>
        </div>

        {/* Viral Share Section - Emphasized */}
        <div className="px-6 pb-4">
          <div 
            className="rounded-lg p-4"
            style={{ 
              backgroundColor: '#F8F9FD',
              borderRadius: '8px'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-black">
                Share your success story
              </p>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                +10 karma
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleRedditShare}
                className="w-full py-2.5 px-4 bg-white rounded-lg flex items-center justify-between group transition-all duration-200 hover:shadow-sm"
                style={{ 
                  border: '1px solid #E0E2E7',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FD'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 69, 0, 0.1)' }}
                  >
                    <span className="font-bold text-sm" style={{ color: '#FF4500' }}>R</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-black block">Share on Reddit</span>
                    <span className="text-xs text-gray-500">r/freelance, r/cryptocurrency</span>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="#787B86" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleTwitterShare}
                className="w-full py-2.5 px-4 bg-white rounded-lg flex items-center justify-between group transition-all duration-200 hover:shadow-sm"
                style={{ 
                  border: '1px solid #E0E2E7',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FD'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(29, 161, 242, 0.1)' }}
                  >
                    <span className="font-bold text-sm" style={{ color: '#1DA1F2' }}>X</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-black block">Share on X/Twitter</span>
                    <span className="text-xs text-gray-500">#FreelanceLife #GetPaid</span>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="#787B86" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-white rounded-lg flex items-center justify-between group transition-all duration-200 hover:shadow-sm"
                style={{ 
                  border: '1px solid #E0E2E7',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FD'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: copied ? 'rgba(38, 166, 154, 0.1)' : 'rgba(41, 98, 255, 0.1)' }}
                  >
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="#26A69A" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="#2962FF" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-black block">
                      {copied ? 'Copied!' : 'Copy success message'}
                    </span>
                    <span className="text-xs text-gray-500">Share anywhere</span>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="#787B86" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div 
              className="mt-3 pt-3"
              style={{ borderTop: '1px solid #E0E2E7' }}
            >
              <p className="text-xs text-center" style={{ color: '#787B86' }}>
                Your review helps others trust secure payments
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-white text-sm font-medium transition-all duration-200"
            style={{ 
              backgroundColor: '#2962FF',
              borderRadius: '8px',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1E53E5';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(41, 98, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2962FF';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}