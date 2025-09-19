// src/components/escrow/WithdrawalFlow.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEnvConfig } from '@/lib/environment';

interface WithdrawalFlowProps {
  maxAmount: number; // Maximum USDC available to withdraw
  walletAddress: string; // User's Magic wallet address
  onClose: () => void;
}

export function WithdrawalFlow({ maxAmount, walletAddress, onClose }: WithdrawalFlowProps) {
  const [amount, setAmount] = useState(maxAmount);
  const [showWidget, setShowWidget] = useState(false);
  const { user } = useAuth();
  
  const handleWithdraw = () => {
    const envConfig = getEnvConfig();
    const environment = envConfig.isTestMode ? 'STAGING' : 'PRODUCTION';
    const baseUrl = environment === 'STAGING'
      ? 'https://global-stg.transak.com'
      : 'https://global.transak.com';
    
    const queryParams = new URLSearchParams({
      apiKey: envConfig.transakApiKey,
      environment: environment,
      email: user?.email || '',
      
      // SELLING USDC for fiat
      productsAvailed: 'SELL',
      cryptoCurrencyCode: 'USDC',
      cryptoAmount: amount.toString(), // Amount of USDC to sell
      network: envConfig.isTestMode ? 'polygon_amoy' : 'polygon',
      
      walletAddress: walletAddress,
      disableWalletAddressForm: 'true',
      
      // Fiat settings
      fiatCurrency: 'USD',
      defaultFiatCurrency: 'USD',
      paymentMethod: 'credit_debit_card',
      
      // White theme
      backgroundColor: 'FFFFFF',
      themeColor: '000000',
      widgetBackgroundColor: 'FFFFFF',
      
      // Show fees
      isFeeCalculationHidden: 'false',
      isAmountEditable: 'true',
      
      hideMenu: 'true',
      widgetHeight: '650px',
      partnerOrderId: `withdraw-${Date.now()}`,
      redirectURL: window.location.href,
    });
    
    const widgetUrl = `${baseUrl}?${queryParams.toString()}`;
    window.open(widgetUrl, '_blank', 'width=500,height=700');
  };
  
  return (
    <div className="p-6 bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Withdraw USDC</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to withdraw (USDC)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.min(parseFloat(e.target.value) || 0, maxAmount))}
          max={maxAmount}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximum available: {maxAmount} USDC
        </p>
      </div>
      
      <button
        onClick={handleWithdraw}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Withdraw {amount} USDC
      </button>
    </div>
  );
}