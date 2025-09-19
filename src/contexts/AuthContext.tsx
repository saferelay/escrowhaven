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
  supabase: SupabaseClient<any, "public", any>; // Fixed type to match createClientComponentClient
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
  
  // Create client without options (auth-helpers-nextjs handles this differently)
  const supabase = createClientComponentClient();

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

    // Listen for auth changes with better error handling
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

    // Set up periodic session refresh to prevent expiration
    const refreshInterval = setInterval(async () => {
      if (session) {
        try {
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Failed to refresh session:', refreshError);
            // Only sign out if it's an actual auth error, not a network error
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
          // Don't sign out on network errors
        }
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [supabase, router, session]); // Added session to dependencies

  // Add the signIn function for magic link
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