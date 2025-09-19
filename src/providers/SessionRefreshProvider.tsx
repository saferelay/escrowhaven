// src/providers/SessionRefreshProvider.tsx
'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export function SessionRefreshProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;

    const setupRefreshTimer = (expiresAt: number) => {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      // Refresh 5 minutes before expiry
      const refreshIn = Math.max((timeUntilExpiry - 300) * 1000, 10000); // Min 10 seconds
      
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(async () => {
        console.log('Auto-refreshing session...');
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Failed to refresh session:', error);
        }
      }, refreshIn);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.expires_at) {
        setupRefreshTimer(session.expires_at);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.expires_at) {
          setupRefreshTimer(session.expires_at);
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          router.refresh(); // Refresh server components
        }
        
        if (event === 'SIGNED_OUT') {
          clearTimeout(refreshTimer);
        }
      }
    );

    // Refresh on focus
    const handleFocus = async () => {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        router.refresh();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(refreshTimer);
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [supabase, router]);

  return <>{children}</>;
}