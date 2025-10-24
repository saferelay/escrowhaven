'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionRefreshProvider } from './SessionRefreshProvider';
import { polygon, polygonAmoy } from 'viem/chains';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

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
        // Configure default chain for smart wallets
        defaultChain: isProduction ? polygon : polygonAmoy,
        supportedChains: isProduction ? [polygon] : [polygonAmoy],
      }}
    >
      {/* Smart Wallets Provider - enables gasless transactions */}
      <SmartWalletsProvider>
        <AuthProvider>
          <SessionRefreshProvider>
            {children}
          </SessionRefreshProvider>
        </AuthProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}