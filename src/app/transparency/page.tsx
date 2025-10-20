'use client';

import { useRouter } from 'next/navigation';
import { TransparencyPage as TransparencyView } from '@/components/transparency/TransparencyPage';

export default function TransparencyPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (!view) {
      return;
    }

    if (view.startsWith('/')) {
      router.push(view);
      return;
    }

    switch (view) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      default:
        router.push(`/${view}`);
        break;
    }
  };

  return <TransparencyView onNavigate={handleNavigate} />;
}