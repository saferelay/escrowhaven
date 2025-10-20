// src/providers/SessionRefreshProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

/**
 * SessionRefreshProvider
 * 
 * Handles keeping the Privy session alive and valid.
 * Privy manages its own session internally, but we listen for 
 * important auth events to trigger route refreshes when needed.
 */
export function SessionRefreshProvider({ children }: { children: React.ReactNode }) {
  const { ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    // Refresh server components on window focus
    // This ensures server-side auth checks stay current
    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener('focus', handleFocus);

    // Optional: Refresh periodically to keep server state fresh (e.g., every 5 minutes)
    const refreshInterval = setInterval(() => {
      router.refresh();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, [ready, router]);

  return <>{children}</>;
}