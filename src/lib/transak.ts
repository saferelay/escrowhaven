// src/lib/transak.ts
import { getEnvConfig } from './environment';

interface TransakWidgetConfig {
  email: string;
  escrowId: string;
  amount: number; // in USD
  vaultAddress: string;
  isTestMode: boolean;
}

export function createTransakWidget(config: TransakWidgetConfig): string {
  const envConfig = getEnvConfig();
  
  // Use the same API key for both staging and production
  // Transak will determine the environment based on the network parameter
  const baseUrl = 'https://global.transak.com';
  
  const queryParams = new URLSearchParams({
    apiKey: envConfig.transakApiKey, // Same key for both environments
    email: config.email,
    
    // BUY USDC with fiat
    productsAvailed: 'BUY',
    cryptoCurrencyCode: 'USDC',
    defaultCryptoCurrency: 'USDC',
    fiatAmount: config.amount.toString(),
    network: config.isTestMode ? 'polygon_amoy' : 'polygon',
    
    // Send directly to vault address that already exists
    walletAddress: config.vaultAddress,
    disableWalletAddressForm: 'true',
    
    // Fiat settings
    fiatCurrency: 'USD',
    defaultFiatCurrency: 'USD',
    defaultPaymentMethod: 'credit_debit_card',
    paymentMethod: 'credit_debit_card,bank_transfer',
    
    // Styling
    backgroundColor: 'FFFFFF',
    themeColor: '2962FF',
    widgetBackgroundColor: 'FFFFFF',
    
    // Widget settings
    isFeeCalculationHidden: 'false',
    hideMenu: 'true',
    widgetHeight: '650px',
    partnerOrderId: `escrow-${config.escrowId}`,
    
    // Redirect after completion
    redirectURL: `${window.location.origin}/dashboard`,
  });
  
  return `${baseUrl}?${queryParams.toString()}`;
}