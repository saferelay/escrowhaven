'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import MarketingPage from '@/components/marketing/MarketingPage';

export default function Page() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return; // Wait until Privy is initialized

    if (authenticated) {
      router.replace('/dashboard');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (authenticated) {
    // Just in case the useEffect hasn’t redirected yet
    return null;
  }

  return <MarketingPage />;
}
