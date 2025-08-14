'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function FundEscrowPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, supabase } = useAuth();
  const escrowId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [escrow, setEscrow] = useState<any>(null);
  const [creatingSession, setCreatingSession] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirectTo=/escrow/${escrowId}/fund`);
    } else if (user) {
      fetchEscrow();
    }
  }, [user, authLoading, escrowId, router]);

  const fetchEscrow = async () => {
    try {
      const { data, error } = await supabase
        .from('escrows')
        .select('*')
        .eq('id', escrowId)
        .single();

      if (error) throw error;
      
      // Verify user is the payer
      if (data.client_email !== user?.email) {
        throw new Error('Only the payer can fund this escrow');
      }

      if (data.status !== 'PENDING') {
        throw new Error('This escrow has already been funded');
      }

      setEscrow(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load escrow');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setCreatingSession(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create onramp session
      const response = await fetch('/api/stripe/create-onramp-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ escrowId })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // For redirect approach, we get a URL to redirect to
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (data.clientSecret) {
        // If using embedded widget (future implementation)
        console.error('Embedded widget not implemented yet');
        throw new Error('Payment method not configured properly');
      }

    } catch (err: any) {
      setError(err.message);
      setCreatingSession(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !escrow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push(`/escrow/${escrowId}`)}
              className="text-blue-600 hover:underline"
            >
              Back to Escrow
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!escrow) return null;

  const amountUsd = (escrow.amount_cents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/escrow/${escrowId}`)}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
          >
            ← Back to Escrow
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Fund Escrow</h1>
        </div>

        {/* Amount Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Escrow Amount</p>
            <p className="text-5xl font-bold text-gray-900">${amountUsd}</p>
            <p className="text-sm text-gray-500 mt-2">
              Sending to: {escrow.freelancer_email}
            </p>
          </div>

          {/* How it Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Pay with your card through Stripe</li>
              <li>Stripe converts your payment to USDC stablecoin</li>
              <li>Funds are locked in the escrow smart contract</li>
              <li>Released only when both parties approve</li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleStripePayment}
            disabled={creatingSession}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {creatingSession ? 'Redirecting to Stripe...' : `Pay $${amountUsd} with Stripe`}
          </button>

          {creatingSession && (
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                You'll be redirected to Stripe to complete your payment securely.
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>🔒 Your payment is processed securely by Stripe</p>
          <p className="mt-1">Funds are held in a smart contract until both parties approve</p>
        </div>
      </div>
    </div>
  );
}