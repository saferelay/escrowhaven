'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { connectMagicWallet } from '@/lib/magic';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MagicWalletConnectProps {
  onSuccess: (wallet: string) => void;
  onError?: (error: string) => void;
  userEmail?: string;
}

export function MagicWalletConnect({ onSuccess, onError, userEmail }: MagicWalletConnectProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingWallet, setExistingWallet] = useState<string | null>(null);
  const email = userEmail || user?.email;

  // Check for existing wallet on mount
  useEffect(() => {
    async function checkExistingWallet() {
      if (email) {
        const { data } = await supabase
          .from('user_wallets')
          .select('wallet_address')
          .eq('email', email.toLowerCase())
          .single();
        
        if (data?.wallet_address) {
          setExistingWallet(data.wallet_address);
        }
      }
    }
    checkExistingWallet();
  }, [email]);

  const handleConnect = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // If existing wallet, use it
      if (existingWallet) {
        onSuccess(existingWallet);
        return;
      }

      // Connect to Magic
      const result = await connectMagicWallet(email);
      
      // Save wallet to database
      const saveResponse = await fetch('/api/user/save-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          wallet: result.wallet,
          issuer: result.issuer,
          provider: 'magic'
        })
      });

      const saveData = await saveResponse.json();
      
      if (!saveResponse.ok && !saveData.message?.includes('already')) {
        throw new Error(saveData.error || 'Failed to save wallet');
      }

      onSuccess(result.wallet);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Set Up Your Wallet</h3>
        <p className="text-sm text-gray-600">
          {existingWallet 
            ? "You already have a Magic wallet connected. Click below to continue."
            : "To create escrows, you need a wallet. We'll create one for you using your email."}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          value={email || ''}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
        />
        {existingWallet && (
          <p className="text-xs text-green-600 mt-2">
            ✓ Wallet connected: {existingWallet.slice(0, 6)}...{existingWallet.slice(-4)}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? 'Connecting...' : existingWallet ? 'Use Existing Wallet' : 'Connect Wallet'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Secured by Magic.link • No passwords or seed phrases
      </p>
    </div>
  );
}