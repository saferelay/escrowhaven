// src/app/providers.tsx
'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { SessionRefreshProvider } from "../providers/SessionRefreshProvider";
import dynamic from 'next/dynamic';

// Dynamically import MoonPayProvider to prevent SSR issues
const MoonPayProvider = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
  const apiKey = moonPayMode === 'production'
    ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
    : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;

  console.log('🔧 Providers initializing...');
  console.log('MoonPay Mode:', moonPayMode);
  console.log('API Key exists:', !!apiKey);

  return (
    <MoonPayProvider
      apiKey={apiKey || ''}
      debug={moonPayMode !== 'production'}
    >
      <AuthProvider>
        <SessionRefreshProvider>
          {children}
        </SessionRefreshProvider>
      </AuthProvider>
    </MoonPayProvider>
  );
}