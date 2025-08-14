'use client';

import { useState, useEffect } from 'react';
import { Icon } from './icons';

export function WalletOnboarding() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    window.addEventListener('show-wallet-onboarding', handleShow);
    return () => window.removeEventListener('show-wallet-onboarding', handleShow);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="wallet" className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Signing Wallet is Ready!</h2>
          <p className="text-gray-600">
            Securely sign contracts and receive instant payouts
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="check" className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Secure Contract Signing</p>
              <p className="text-xs text-gray-500">Sign all SafeRelay contracts with your email</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="check" className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Instant Payments</p>
              <p className="text-xs text-gray-500">Receive funds immediately when released</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="check" className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Cash Out Anywhere</p>
              <p className="text-xs text-gray-500">Transfer to your bank or preferred payment method</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="check" className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">No Crypto Knowledge Required</p>
              <p className="text-xs text-gray-500">We handle all the technical details for you</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex space-x-2">
            <Icon name="shield" className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-800 font-medium mb-1">Bank-Grade Security</p>
              <p className="text-xs text-blue-700">
                Your Signing Wallet is secured by Magic.link and protected by your email authentication. 
                No passwords or complex keys to manage.
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Got it, Continue
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Powered by Magic.link • Learn more in Settings
        </p>
      </div>
    </div>
  );
}