'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionRefreshProvider } from './SessionRefreshProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#2962FF',
          logo: '/logo.svg',
        },
        loginMethods: ['email', 'google'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets', // Auto-create wallet when users sign up
          },
        },
      }}
    >
      <AuthProvider>
        <SessionRefreshProvider>
          {children}
        </SessionRefreshProvider>
      </AuthProvider>
    </PrivyProvider>
  );
}