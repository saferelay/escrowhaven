'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
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
  const { ready, authenticated, user: privyUser, login, logout, linkWallet } = usePrivy();
  const { wallets } = useWallets();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const supabase = createClientComponentClient();

  // Sync Privy auth with local state
  useEffect(() => {
    console.log('AuthContext syncAuth - ready:', ready, 'authenticated:', authenticated, 'privyUser:', privyUser);
    
    if (!ready) {
      console.log('Privy not ready yet');
      return;
    }
  
    if (authenticated && privyUser) {
      console.log('Full privyUser object:', JSON.stringify(privyUser, null, 2));
      console.log('privyUser keys:', Object.keys(privyUser));
      console.log('privyUser.email:', privyUser.email);
      console.log('privyUser.google:', privyUser.google);
    }
  
    const syncAuth = async () => {
      if (authenticated && privyUser?.email) {
        const pseudoUser: User = {
          id: privyUser.id,
          email: privyUser.email.address,
          app_metadata: {},
          user_metadata: {
            privy_id: privyUser.id,
          },
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
  // Get wallet address from Privy
  const ensureWallet = async (): Promise<string | null> => {
    if (!authenticated || !privyUser?.email) {
      throw new Error('User not authenticated');
    }
  
    try {
      // Get first available wallet from Privy
      let walletAddress: string | null = null;

      // Check if user has linked wallets
      if (wallets && wallets.length > 0) {
        walletAddress = wallets[0].address;
      }

      // If no wallet, prompt to create/link one
      if (!walletAddress) {
        try {
          await linkWallet();
          // After linking, wallets should be updated via useWallets hook
          // For now, we'll need to refetch
          if (wallets && wallets.length > 0) {
            walletAddress = wallets[0].address;
          }
        } catch (linkErr: any) {
          // User cancelled or linking failed
          throw new Error('Wallet linking cancelled or failed');
        }
      }

      if (!walletAddress) {
        throw new Error('Unable to create or retrieve wallet');
      }

      // Check database for existing wallet
      const { data: existingWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', privyUser.email.address.toLowerCase())
        .maybeSingle();

      if (existingWallet?.wallet_address) {
        // If wallet changed, update it (migration case)
        if (existingWallet.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
          await supabase
            .from('user_wallets')
            .update({ 
              wallet_address: walletAddress,
              provider: 'privy',
              updated_at: new Date().toISOString(),
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
      // Privy's login method handles email auth automatically
      await login();
      return { error: null };
    } catch (err: any) {
      const errorMsg = err.message || 'Sign in failed';
      setError(errorMsg);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      // Privy's login method includes Google as an option
      await login();
      return { error: null };
    } catch (err: any) {
      const errorMsg = err.message || 'Google sign in failed';
      setError(errorMsg);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('signOut called');
      setError(null);
      
      // Sign out from Privy
      console.log('Calling Privy logout...');
      await logout();
      console.log('Privy logout successful');
      
      // Also sign out from Supabase for cleanup
      try {
        console.log('Signing out from Supabase...');
        await supabase.auth.signOut({ scope: 'local' });
        console.log('Supabase signout successful');
      } catch (supabaseErr) {
        console.warn('Supabase sign out failed (non-critical):', supabaseErr);
      }
  
      setSession(null);
      setUser(null);
      console.log('Redirecting to home...');
      router.push('/');
    } catch (err: any) {
      console.error('Sign out error:', err);
      const errorMsg = err.message || 'Sign out failed';
      setError(errorMsg);
      throw err;
    }
  };

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (ready && authenticated && privyUser) {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/login' || currentPath === '/signup') {
        router.push('/dashboard');
      }
    }
  }, [ready, authenticated, privyUser, router]);

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