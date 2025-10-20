'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  ensureWallet: () => Promise<string | null>;
  supabase: SupabaseClient<any, "public", any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  ensureWallet: async () => null,
  supabase: null as any,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const supabase = createClientComponentClient();

  // Sync Privy auth with Supabase
  useEffect(() => {
    if (!ready) return;

    const syncAuth = async () => {
      if (authenticated && privyUser?.email) {
        // Create a pseudo-session for compatibility
        const pseudoUser: User = {
          id: privyUser.id,
          email: privyUser.email.address,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;

        setUser(pseudoUser);
        setSession({ user: pseudoUser } as Session);
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    };

    syncAuth();
  }, [ready, authenticated, privyUser]);

  // Get wallet address from Privy's embedded wallet
  const ensureWallet = async (): Promise<string | null> => {
    if (!authenticated || !privyUser?.email) {
      throw new Error('User not authenticated');
    }
  
    try {
      // Get Privy wallet address
      const wallet = privyUser.wallet;
      
      if (!wallet?.address) {
        throw new Error('Wallet not found. Please try logging in again.');
      }
  
      const walletAddress = wallet.address;
  
      // Check database for existing wallet
      const { data: existingWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', privyUser.email.address.toLowerCase())
        .maybeSingle();
  
      if (existingWallet?.wallet_address) {
        // If wallet changed, update it (Magic → Privy migration)
        if (existingWallet.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
          await supabase
            .from('user_wallets')
            .update({ 
              wallet_address: walletAddress,
              provider: 'privy'
            })
            .eq('email', privyUser.email.address.toLowerCase());
        }
        
        return walletAddress;
      }
  
      // No existing wallet - create new entry
      const saveResponse = await fetch('/api/user/save-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: privyUser.email.address,
          wallet: walletAddress,
          issuer: privyUser.id,
          provider: 'privy'
        })
      });
  
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(`Failed to save wallet: ${errorData.error || 'Unknown error'}`);
      }
  
      return walletAddress;
      
    } catch (err: any) {
      console.error('Wallet retrieval failed:', err);
      throw new Error(err.message || 'Wallet retrieval failed');
    }
  };

  const signIn = async (email: string) => {
    try {
      setError(null);
      await login();
      return { error: null };
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await login();
      return { error: null };
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await logout();
      setSession(null);
      setUser(null);
      router.push('/');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Sign out failed');
    }
  };

 // useEffect(() => {
 //   if (ready && authenticated && privyUser) {
 //     const currentPath = window.location.pathname;
      // If on login/signup/home pages, redirect to dashboard
 //     if (currentPath === '/' || currentPath === '/login' || currentPath === '/signup') {
 //       router.push('/dashboard');
 //     }
 //   }
//  }, [ready, authenticated, privyUser, router]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading: loading || !ready, 
      error, 
      signIn, 
      signInWithGoogle, 
      signOut, 
      ensureWallet, 
      supabase 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};