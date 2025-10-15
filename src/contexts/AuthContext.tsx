// FILE: src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const supabase = createClientComponentClient();

  // Call this when user needs a wallet (creating/accepting escrow)
  const ensureWallet = async (): Promise<string | null> => {
    if (!user?.email) {
      throw new Error('User not authenticated');
    }
  
    try {
      // Check if wallet exists
      const { data: existingWallet, error: fetchError } = await supabase
        .from('user_wallets')
        .select('wallet_address')
        .eq('email', user.email.toLowerCase())
        .maybeSingle();
  
      if (fetchError) {
        console.error('Database error checking wallet:', fetchError);
        throw new Error('Failed to check existing wallet');
      }
  
      if (existingWallet?.wallet_address) {
        console.log('Found existing wallet:', existingWallet.wallet_address);
        return existingWallet.wallet_address;
      }
  
      // No wallet exists - create via Magic
      console.log('No wallet found. Creating Magic wallet for:', user.email);
      
      const { connectMagicWallet } = await import('@/lib/magic');
      const result = await connectMagicWallet(user.email);
      
      console.log('Magic wallet created:', result.wallet);
      
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
  
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(`Failed to save wallet: ${errorData.error || 'Unknown error'}`);
      }
  
      console.log('Wallet saved to database successfully');
      return result.wallet;
      
    } catch (err: any) {
      console.error('Wallet creation failed:', err);
      // Re-throw with clear message
      throw new Error(err.message || 'Wallet creation failed');
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          console.log('Session error:', sessionError.message);
          setError(sessionError.message);
        }
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setError(null);
        }
      } catch (err) {
        console.log('Session check failed:', err);
        setError('Session check failed');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event);
        
        if (event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setError(null);
        } else if (event === 'SIGNED_IN') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setError(null);
          router.push('/');
        } else if (event === 'USER_UPDATED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
        
        setLoading(false);
      }
    );

    const refreshInterval = setInterval(async () => {
      if (session) {
        try {
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Failed to refresh session:', refreshError);
            if (refreshError.message?.includes('refresh_token') || 
                refreshError.message?.includes('invalid')) {
              await signOut();
            }
          } else if (refreshedSession) {
            setSession(refreshedSession);
            setUser(refreshedSession.user);
          }
        } catch (err) {
          console.error('Refresh error:', err);
        }
      }
    }, 10 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [supabase, router, session]);

  const signIn = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      }
      return { error };
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      
      // Get the current origin (works for both localhost and production)
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        setError(error.message);
      }
      return { error };
    } catch (err: any) {
      console.error('Google sign in failed:', err);
      setError(err.message || 'Google sign in failed');
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Sign out failed');
    } finally {
      setSession(null);
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signIn, signInWithGoogle, signOut, ensureWallet, supabase }}>
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