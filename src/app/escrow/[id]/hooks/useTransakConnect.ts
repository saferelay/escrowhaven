import { useState } from 'react';
import { config } from '@/lib/config';

interface TransakUserData {
  walletAddress: string;
  userId: string;
  email?: string;
}

export function useTransakConnect() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectTransak = async (): Promise<TransakUserData | null> => {
    setConnecting(true);
    setError(null);

    try {
      // Initialize Transak widget for wallet connection
      const transakParams = {
        apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY,
        environment: config.isTestMode ? 'STAGING' : 'PRODUCTION',
        widgetFor: 'wallet',
        network: config.isTestMode ? 'polygon_amoy' : 'polygon',
        cryptoCurrencyCode: 'USDC'
      };

      return new Promise((resolve, reject) => {
        const transak = new (window as any).TransakSDK(transakParams);
        
        transak.on(transak.TRANSAK_WIDGET_CLOSE, () => {
          setConnecting(false);
          reject(new Error('User closed widget'));
        });

        transak.on(transak.TRANSAK_ORDER_CREATED, (data: any) => {
          // Extract wallet and user info
          const userData: TransakUserData = {
            walletAddress: data.walletAddress,
            userId: data.userId || data.userEmail,
            email: data.userEmail
          };
          
          setConnecting(false);
          resolve(userData);
        });

        transak.init();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Transak');
      setConnecting(false);
      return null;
    }
  };

  return {
    connectTransak,
    connecting,
    error
  };
}