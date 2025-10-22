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
  const [walletInitialized, setWalletInitialized] = useState(false);
  const router = useRouter();
  
  const supabase = createClientComponentClient();

  const getEmailFromPrivyUser = (privyUser: any): string | null => {
    if (privyUser?.email?.address) {
      return privyUser.email.address;
    }
    if (privyUser?.google?.email) {
      return privyUser.google.email;
    }
    return null;
  };

  // Properly wait for wallet after linking
  const ensureWallet = async (): Promise<string | null> => {
    if (!authenticated || !privyUser) {
      throw new Error('User not authenticated');
    }

    const email = getEmailFromPrivyUser(privyUser);
    if (!email) {
      throw new Error('User email not found');
    }
  
    try {
      let walletAddress: string | null = null;

      // Check if user already has linked wallets
      if (wallets && wallets.length > 0) {
        walletAddress = wallets[0].address;
        console.log('[ensureWallet] Existing wallet found:', walletAddress);
      }

      // If no wallet, link one
      if (!walletAddress) {
        console.log('[ensureWallet] No wallet found, triggering link...');
        try {
          await linkWallet();
          
          // Poll for up to 5 seconds for the wallet to appear
          let attempts = 0;
          const maxAttempts = 50;
          
          while (attempts < maxAttempts) {
            if (wallets && wallets.length > 0) {
              walletAddress = wallets[0].address;
              console.log('[ensureWallet] Wallet linked successfully:', walletAddress);
              break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!walletAddress) {
            throw new Error('Wallet linking failed - wallet did not appear after link');
          }
        } catch (linkErr: any) {
          console.error('[ensureWallet] Wallet linking error:', linkErr);
          throw new Error(linkErr?.message || 'Wallet linking cancelled or failed');
        }
      }

      if (!walletAddress) {
        throw new Error('Unable to create or retrieve wallet');
      }

      // Save to database
      const { data: existingWallet } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingWallet?.wallet_address) {
        // Update if changed (migration case)
        if (existingWallet.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
          await supabase
            .from('user_wallets')
            .update({ 
              wallet_address: walletAddress,
              provider: 'privy',
              updated_at: new Date().toISOString(),
            })
            .eq('email', email.toLowerCase());
          
          console.log('[ensureWallet] Wallet updated in database:', walletAddress);
        }
        
        return walletAddress;
      }

      // No existing wallet - create new entry
      const saveResponse = await fetch('/api/user/save-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          wallet: walletAddress,
          issuer: privyUser.id,
          provider: 'privy'
        })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(`Failed to save wallet: ${errorData.error || 'Unknown error'}`);
      }

      console.log('[ensureWallet] Wallet saved to database:', walletAddress);
      return walletAddress;
      
    } catch (err: any) {
      console.error('[ensureWallet] Wallet retrieval failed:', err);
      throw new Error(err.message || 'Wallet retrieval failed');
    }
  };

  // Sync Privy auth with local state AND initialize wallet
  useEffect(() => {
    if (!ready) return;

    const syncAuth = async () => {
      if (authenticated && privyUser) {
        const email = getEmailFromPrivyUser(privyUser);
        
        if (email) {
          const pseudoUser: User = {
            id: privyUser.id,
            email: email,
            app_metadata: {},
            user_metadata: {
              privy_id: privyUser.id,
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User;

          setUser(pseudoUser);
          setSession({ user: pseudoUser } as Session);

          // Initialize wallet on login (silent, non-blocking)
          if (!walletInitialized) {
            try {
              await ensureWallet();
              setWalletInitialized(true);
              console.log('[Auth] ✅ Wallet initialized on login');
            } catch (err) {
              console.warn('[Auth] Wallet initialization failed (non-critical):', err);
              // Continue anyway - wallet will be created on first escrow creation
            }
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
        setWalletInitialized(false);
      }
      setLoading(false);
    };

    syncAuth();
  }, [ready, authenticated, privyUser, walletInitialized]);

  const signIn = async (email: string) => {
    try {
      setError(null);
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
      console.log('[Auth] 🔴 Sign out starting...');
      setError(null);
      
      console.log('[Auth] 🔴 Calling Privy logout()...');
      await logout();
      console.log('[Auth] 🔴 Privy logout() complete');
      
      try {
        console.log('[Auth] 🔴 Calling Supabase auth.signOut()...');
        await supabase.auth.signOut({ scope: 'local' });
        console.log('[Auth] 🔴 Supabase signOut() complete');
      } catch (supabaseErr) {
        console.warn('[Auth] 🔴 Supabase sign out failed (non-critical):', supabaseErr);
      }

      console.log('[Auth] 🔴 Clearing local state...');
      setSession(null);
      setUser(null);
      setWalletInitialized(false);
      
      console.log('[Auth] 🔴 Redirecting to /...');
      router.push('/');
      console.log('[Auth] 🔴 Router push called');
    } catch (err: any) {
      console.error('[Auth] 🔴 ERROR:', err);
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