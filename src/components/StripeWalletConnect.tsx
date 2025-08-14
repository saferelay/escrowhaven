'use client';

import { useState } from 'react';

interface StripeWalletConnectProps {
  onWalletAddress: (address: string) => void;
  userEmail: string;
}

export default function StripeWalletConnect({ onWalletAddress, userEmail }: StripeWalletConnectProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConnectStripe = () => {
    setShowInstructions(true);
    // Open Stripe Crypto in new tab
    window.open('https://crypto.link.com', '_blank');
  };

  const handleAddressSubmit = () => {
    if (tempAddress && tempAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      onWalletAddress(tempAddress);
      setIsConfirmed(true);
    }
  };

  if (isConfirmed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-green-800 font-medium">Stripe Crypto wallet connected</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsConfirmed(false);
            setTempAddress('');
            onWalletAddress('');
          }}
          className="text-sm text-green-600 hover:text-green-700 mt-2"
        >
          Change wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showInstructions ? (
        <button
          type="button"
          onClick={handleConnectStripe}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Connect Stripe Crypto Wallet</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-3">
            <h4 className="font-medium text-blue-900">Get your Stripe Crypto wallet address:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
              <li>In the new tab, log in to your Stripe Crypto account</li>
              <li>Navigate to your wallet section</li>
              <li>Find your <strong>Polygon (MATIC)</strong> wallet address</li>
              <li>Copy the address and paste it below</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Paste your Stripe wallet address
            </label>
            <input
              type="text"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              placeholder="0x..."
              pattern="^0x[a-fA-F0-9]{40}$"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <button
              type="button"
              onClick={handleAddressSubmit}
              disabled={!tempAddress.match(/^0x[a-fA-F0-9]{40}$/)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Wallet Address
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> Use your Polygon wallet from Stripe Crypto. 
              This is where you'll receive USDC payments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
