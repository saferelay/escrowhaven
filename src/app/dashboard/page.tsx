'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <Dashboard onNavigate={(view) => {
    if (view === 'marketing') {
      router.push('/');
    } else if (view === 'transparency') {
      router.push('/transparency');
    } else if (view === 'help') {
      window.open('/help', '_blank');
    }
  }} />;
}