// src/lib/config.ts
import { getEnvConfig } from './environment';

export interface Config {
  environment: 'development' | 'staging' | 'production';
  isTestMode: boolean;
  showTestBadges: boolean;
  allowTestFunding: boolean;
  
  // Network and blockchain
  network: string;
  networkName: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  
  // Contracts
  contracts: {
    factory: string;
    factoryV2?: string;
  };
  
  // USDC configuration
  usdc: {
    address: string;
    symbol: string;
    decimals: number;
  };
  
  // Payment providers
  transak: {
    apiKey: string;
    environment: 'STAGING' | 'PRODUCTION';
    network: string;
  };
  
  stripe?: {
    onrampUrl?: string;
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  
  // Alchemy
  alchemy?: {
    apiKey?: string;
    url?: string;
  };
  
  // Legacy properties for backward compatibility
  TRANSAK_API_KEY?: string;
}

export function getConfig(): Config {
  const env = getEnvConfig();
  
  return {
    // Environment info
    environment: env.name,
    isTestMode: env.isTestMode,
    showTestBadges: env.showTestBadges,
    allowTestFunding: env.allowTestFunding,
    
    // Network configuration
    network: env.network,
    networkName: env.network.replace('_', ' ').replace('polygon amoy', 'Polygon Amoy (Testnet)').replace('polygon', 'Polygon'),
    chainId: env.chainId,
    rpcUrl: env.rpcUrl,
    explorerUrl: env.blockExplorer,
    
    // Contracts
    contracts: {
      factory: env.factoryAddress,
      
    },
    
    // USDC configuration
    usdc: {
      address: env.usdcAddress,
      symbol: env.isTestMode ? 'MockUSDC' : 'USDC',
      decimals: 6
    },
    
    // Transak configuration
    transak: {
      apiKey: env.transakApiKey,
      environment: env.isTestMode ? 'STAGING' : 'PRODUCTION',
      network: env.network,
    },
    
    // Stripe (if still needed)
    stripe: process.env.STRIPE_SECRET_KEY ? {
      onrampUrl: process.env.STRIPE_ONRAMP_LINK,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    } : undefined,
    
    // Alchemy
    alchemy: process.env.ALCHEMY_API_KEY ? {
      apiKey: process.env.ALCHEMY_API_KEY,
      url: env.rpcUrl.includes('alchemy') ? env.rpcUrl : undefined,
    } : undefined,
    
    // Legacy property for backward compatibility
    TRANSAK_API_KEY: env.transakApiKey,
  };
}

// Re-export the getConfig function in the old style for backward compatibility
export const config = getConfig();

// Re-export useful functions from environment
export { 
  isRealMoneyEnvironment,
  shouldShowTestUI,
  isAdminUser,
  canAccessTestFeatures,
  getEnvironmentInfo,
  getEnvironment
} from './environment';

// Environment validation
export const validateEnvironment = () => {
  const config = getConfig();
  
  if (config.environment === 'production' && !config.isTestMode) {
    // In production, we need real addresses
    if (config.contracts.factory === '0x0000000000000000000000000000000000000000') {
      console.warn('⚠️  Production factory address not set!');
      return false;
    }
  }
  
  console.log('✅ Environment validated:', {
    environment: config.environment,
    network: config.network,
    isTestMode: config.isTestMode
  });
  
  return true;
};
// Add this to your config
export const useTransakOne = false; // Set to true when ready for Transak One
