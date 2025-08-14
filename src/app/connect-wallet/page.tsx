'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { connectMagicWallet } from '@/lib/magic';

import Link from 'next/link';

export default function ConnectMagicWalletPage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingWallet, setExistingWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirectTo=/connect-wallet');
      return;
    }
    checkExistingWallet();
  }, [user, router]);

  const checkExistingWallet = async () => {
    if (!user?.email) return;
    
    const { data } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', user.email)
      .single();
    
    if (data?.wallet_address) {
      setExistingWallet(data.wallet_address);
    }
  };

  const handleConnect = async () => {
    if (!user?.email) {
      setError('Please log in to continue');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Connect Magic wallet
      const result = await connectMagicWallet(user.email);
      
      // Save to database
      const saveResponse = await fetch('/api/user/save-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          wallet: result.wallet,
          issuer: result.issuer,
          provider: 'magic'
        })
      });

      const saveData = await saveResponse.json();
      
      if (!saveResponse.ok && !saveData.message?.includes('already')) {
        throw new Error(saveData.error || 'Failed to save wallet');
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirectTo');
        router.push(redirect || '/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (existingWallet && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Wallet Already Connected!</h1>
            <p className="text-gray-600 mb-6">
              Your Magic wallet is already connected to your account.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Wallet Address:</p>
              <p className="font-mono text-sm mt-1">
                {existingWallet.slice(0, 6)}...{existingWallet.slice(-4)}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Wallet Connected Successfully!</h1>
            <p className="text-gray-600">
              Your Magic wallet is now connected. Redirecting you...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔮</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Connect Your Magic Wallet</h1>
            <p className="text-gray-600">
              Set up your secure wallet to receive payments
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What is a Magic Wallet?</h3>
              <p className="text-sm text-blue-800">
                A Magic wallet is a secure, email-based cryptocurrency wallet that lets you receive payments without dealing with complex passwords or seed phrases.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Simple & Secure</h4>
                  <p className="text-sm text-gray-600">No passwords or seed phrases to remember</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Email-Based Access</h4>
                  <p className="text-sm text-gray-600">Access your wallet anytime using just your email</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Instant Payments</h4>
                  <p className="text-sm text-gray-600">Receive escrow payments directly to your wallet</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Connecting...
                </span>
              ) : (
                'Connect Magic Wallet'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By connecting, you'll receive a secure login link via email. No password required.
            </p>

            <Link
              href="/dashboard"
              className="block text-center text-gray-600 hover:text-gray-800 text-sm"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}