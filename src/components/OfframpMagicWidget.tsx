'use client';

import { useState } from 'react';
import { getCurrentMagicUser, getMagicWalletConnectURI } from '@/lib/magic';
import { createOfframpWidget } from '@/lib/offramp';

interface OfframpMagicWidgetProps {
  withdrawalId: string;
  usdcAmount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function OfframpMagicWidget({
  withdrawalId,
  usdcAmount,
  onSuccess,
  onError
}: OfframpMagicWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [wcUri, setWcUri] = useState('');

  const handleOfframp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Get Magic user
      const magicUser = await getCurrentMagicUser();
      if (!magicUser?.publicAddress || !magicUser?.email) {
        throw new Error('Please connect your wallet first');
      }

      // 2. Generate WalletConnect URI for Magic wallet
      const walletConnectUri = await getMagicWalletConnectURI();
      setWcUri(walletConnectUri);

      // 3. Create offramp URL
      const offrampUrl = createOfframpWidget({
        email: magicUser.email,
        usdcAmount,
        withdrawalId,
        userWalletAddress: magicUser.publicAddress,
        isTestMode: process.env.NEXT_PUBLIC_MOONPAY_MODE !== 'production'
      });

      // 4. Open offramp in new window
      const offrampWindow = window.open(offrampUrl, '_blank');

      if (!offrampWindow) {
        throw new Error('Please allow popups to continue');
      }

      // 5. Show instructions to user
      alert(
        'When Onramp asks you to connect your wallet:\n\n' +
        '1. Select "WalletConnect"\n' +
        '2. Scan the QR code OR paste this URI:\n' +
        `${walletConnectUri.slice(0, 50)}...\n\n` +
        'Your Magic wallet will automatically connect.'
      );

    } catch (err: any) {
      console.error('Offramp error:', err);
      const errorMessage = err.message || 'Failed to open offramp';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleOfframp}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:bg-gray-400 transition-all"
      >
        {isLoading ? 'Opening Offramp...' : 'Withdraw to Bank'}
      </button>

      {wcUri && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 font-medium mb-2">
            WalletConnect URI (copy if needed):
          </p>
          <code className="text-xs break-all text-blue-600">
            {wcUri}
          </code>
        </div>
      )}
    </div>
  );
}