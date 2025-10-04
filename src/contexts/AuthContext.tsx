// src/contexts/AuthContext.tsx
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
  signOut: () => Promise<void>;
  supabase: SupabaseClient<any, "public", any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  supabase: null as any,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const supabase = createClientComponentClient();

  // Non-blocking wallet creation - runs in background
  const ensureWalletExists = (userEmail: string) => {
    // Don't await - let it run in background
    setTimeout(async () => {
      try {
        // Check if wallet already exists
        const { data: existingWallet } = await supabase
          .from('user_wallets')
          .select('wallet_address')
          .eq('email', userEmail.toLowerCase())
          .single();

        if (existingWallet?.wallet_address) {
          console.log('Wallet exists for', userEmail);
          return;
        }

        // No wallet found - create one via Magic
        console.log('Creating Magic wallet for:', userEmail);
        const { connectMagicWallet } = await import('@/lib/magic');
        const result = await connectMagicWallet(userEmail);
        
        // Save to database
        const response = await fetch('/api/user/save-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            wallet: result.wallet,
            issuer: result.issuer,
            provider: 'magic'
          })
        });

        if (!response.ok) {
          const data = await response.json();
          if (!data.message?.includes('already')) {
            throw new Error('Failed to save wallet');
          }
        }

        console.log('Wallet created and saved:', result.wallet);
      } catch (err) {
        console.error('Failed to create wallet:', err);
        // Don't block user experience if wallet creation fails
      }
    }, 0);
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
          
          // Trigger wallet creation in background (non-blocking)
          if (currentSession.user.email) {
            ensureWalletExists(currentSession.user.email);
          }
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
          console.log('Token refreshed successfully');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setError(null);
        } else if (event === 'SIGNED_IN') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setError(null);
          
          // Trigger wallet creation in background (non-blocking)
          if (currentSession?.user.email) {
            ensureWalletExists(currentSession.user.email);
          }
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
    <AuthContext.Provider value={{ user, session, loading, error, signIn, signOut, supabase }}>
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