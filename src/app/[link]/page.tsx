'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{ link: string }>;
}

export default function EscrowLinkPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [escrow, setEscrow] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isParticipant, setIsParticipant] = useState(false);
  
  // Unwrap params using React.use() for Next.js 15
  const { link } = use(params);

  useEffect(() => {
    checkLink();
  }, [link]);

  const checkLink = async () => {
    console.log('🔍 Checking link:', link);
    
    try {
      // Check if it's a premium link format
      if (link.startsWith('secure-payment-')) {
        console.log('✅ Detected premium link format');
        
        const { data, error } = await supabase
          .from('escrows')
          .select('*')
          .eq('premium_link', link)
          .single();

        console.log('📊 Supabase query result:', { 
          found: !!data, 
          error: error?.message,
          escrowId: data?.id 
        });

        if (error || !data) {
          console.error('❌ Failed to find escrow:', error);
          setError('Invalid or expired link');
          setLoading(false);
          return;
        }

        console.log('✅ Found escrow:', data.id);
        setEscrow(data);
        
        // Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Current user:', user?.email);
        
        if (user?.email) {
          const userEmail = user.email;
          if (userEmail === data.client_email || userEmail === data.freelancer_email) {
            console.log('✅ User is participant, redirecting to dashboard');
            router.push(`/dashboard?escrow=${data.id}`);
            return;
          } else {
            console.log('⚠️ User is logged in but not a participant');
          }
        } else {
          console.log('👤 No user logged in, showing email gate');
        }
      } else {
        // Not a premium link, maybe it's a direct escrow ID
        console.log('❓ Not a premium link format, checking as ID');
        const { data } = await supabase
          .from('escrows')
          .select('*')
          .eq('id', link)
          .single();
          
        if (data) {
          setEscrow(data);
        } else {
          setError('Escrow not found');
        }
      }
    } catch (err) {
      console.error('💥 Error in checkLink:', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Check if email matches a participant
    if (email === escrow.client_email || email === escrow.freelancer_email) {
      // Send magic link to email
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard?escrow=${escrow.id}`
        }
      });

      if (error) {
        setError('Failed to send login link');
        return;
      }

      setIsParticipant(true);
    } else {
      setError('You are not a participant in this escrow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading escrow details...</p>
        </div>
      </div>
    );
  }

  if (error && !escrow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <a 
              href="/dashboard" 
              className="block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
            <a href="/" className="block text-blue-600 hover:text-blue-700">
              Back to homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isParticipant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4 animate-bounce">📧</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">
            We've sent a secure login link to:
          </p>
          <p className="font-mono font-medium text-gray-900 mt-2 mb-4">
            {email}
          </p>
          <p className="text-sm text-gray-500">
            Click the link in your email to access the escrow. The link will expire in 1 hour.
          </p>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsParticipant(false);
                  setEmail('');
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!escrow) {
    return null;
  }

  // Calculate fee display
  const amount = escrow.amount_cents / 100;
  const fee = amount * 0.0199;
  const receiverAmount = amount * 0.9801;

  // Get status display
  const getStatusBadge = () => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'INITIATED': { text: 'Pending Acceptance', color: 'bg-yellow-100 text-yellow-800' },
      'ACCEPTED': { text: 'Ready to Fund', color: 'bg-blue-100 text-blue-800' },
      'FUNDED': { text: 'Active', color: 'bg-green-100 text-green-800' },
      'RELEASED': { text: 'Complete', color: 'bg-gray-100 text-gray-800' },
      'DECLINED': { text: 'Declined', color: 'bg-red-100 text-red-800' },
    };
    const status = statusMap[escrow.status] || { text: escrow.status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
        {status.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        {/* Escrow Preview */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Secure Escrow</h1>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ${amount.toFixed(2)}
          </div>
          <div className="mt-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Parties Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">From:</span>
            <span className="font-medium">{escrow.client_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To:</span>
            <span className="font-medium">{escrow.freelancer_email}</span>
          </div>
        </div>

        {/* Email Gate */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your email to continue
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Access Escrow
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            This escrow is secured by smart contracts on the Polygon blockchain.
            Only authorized participants can access and manage it.
          </p>
        </div>
      </div>
    </div>
  );
}