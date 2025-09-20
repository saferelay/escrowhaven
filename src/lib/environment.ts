// src/lib/environment.ts
// Environment configuration for escrowhaven
// This manages different environments: development, staging, and production

export type Environment = 'development' | 'staging' | 'production';

export interface EnvConfig {
  name: Environment;
  displayName: string;
  
  // API Keys and URLs
  supabaseUrl: string;
  supabaseAnonKey: string;
  transakApiKey: string;           // Production & Transak One (same key)
  transakApiKeyStaging: string;    // Staging/Test environment
  magicPublishableKey: string;
  
  // Feature Flags
  isTestMode: boolean;        // Use test contracts and mock USDC
  showTestBadges: boolean;    // Show yellow TEST badges in UI
  allowTestFunding: boolean;  // Allow access to test funding page
  isRealMoney: boolean;       // Whether this uses real money
  
  // Blockchain Configuration
  network: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  factoryAddress: string;
  usdcAddress: string;        // Mock USDC in test, real USDC in prod
  
  // Optional
  mockUsdcAddress?: string;   // Only for test environments
}

// Get environment from multiple sources
export function getEnvironment(): Environment {
  // 1. Check explicit environment variable
  if (process.env.NEXT_PUBLIC_ENVIRONMENT) {
    return process.env.NEXT_PUBLIC_ENVIRONMENT as Environment;
  }
  
  // 2. Check domain-based detection (for production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test') || hostname.includes('demo')) {
      return 'staging';
    } else {
      return 'production';
    }
  }
  
  // 3. Default based on NODE_ENV
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

// Environment configurations
const configs: Record<Environment, EnvConfig> = {
  development: {
    name: 'development',
    displayName: 'escrowhaven Dev',
    
    // APIs
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    transakApiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION || '',  // Production key (also for Transak One)
    transakApiKeyStaging: process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING || 'c1dfcf5c-8bc2-419c-bf7e-29f1e1831605',
    magicPublishableKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!,
    
    // Features
    isTestMode: true,
    showTestBadges: true,
    allowTestFunding: true,
    isRealMoney: false,
    
    // Blockchain - Polygon Amoy Testnet
    network: 'polygon_amoy',
    chainId: 80002,
    rpcUrl: process.env.ALCHEMY_API_KEY 
      ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://www.oklink.com/amoy',
    factoryAddress: process.env.ESCROWHAVEN_FACTORY_ADDRESS || process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000',
    usdcAddress: '0x8B0180f2101c8260d49339abfEe87927412494B4',
    mockUsdcAddress: '0x8B0180f2101c8260d49339abfEe87927412494B4',
  },
  
  staging: {
    name: 'staging',
    displayName: 'escrowhaven',
    
    // APIs
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    transakApiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION || '',  // Production key (also for Transak One)
    transakApiKeyStaging: process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING || 'c1dfcf5c-8bc2-419c-bf7e-29f1e1831605',
    magicPublishableKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!,
    
    // Features - Test mode but looks like production
    isTestMode: true,
    showTestBadges: false,
    allowTestFunding: true,
    isRealMoney: false,
    
    // Blockchain - Still using Polygon Amoy Testnet
    network: 'polygon_amoy',
    chainId: 80002,
    rpcUrl: process.env.ALCHEMY_API_KEY 
      ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://www.oklink.com/amoy',
    factoryAddress: process.env.ESCROWHAVEN_FACTORY_ADDRESS || process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000',
    usdcAddress: '0x8B0180f2101c8260d49339abfEe87927412494B4',
    mockUsdcAddress: '0x8B0180f2101c8260d49339abfEe87927412494B4',
  },
  
  production: {
    name: 'production',
    displayName: 'EscrowHaven',
    
    // APIs - Production keys
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    transakApiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION!,  // Same key works for Transak One
    transakApiKeyStaging: '',  // Not used in production
    magicPublishableKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!,
    
    // Features - Real money mode
    isTestMode: false,
    showTestBadges: false,
    allowTestFunding: false,
    isRealMoney: true,
    
    // Blockchain - Polygon Mainnet
    network: 'polygon',
    chainId: 137,
    rpcUrl: process.env.ALCHEMY_API_KEY 
      ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    factoryAddress: process.env.ESCROWHAVEN_FACTORY_ADDRESS_MAINNET || process.env.NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Real USDC on Polygon
    mockUsdcAddress: undefined,
  }
};

// Get current environment config
export function getEnvConfig(): EnvConfig {
  const env = getEnvironment();
  return configs[env];
}

// Check if current environment uses real money
export function isRealMoneyEnvironment(): boolean {
  return getEnvConfig().isRealMoney;
}

// Check if should show test UI elements
export function shouldShowTestUI(): boolean {
  return getEnvConfig().showTestBadges;
}

// Admin access control
const ADMIN_EMAILS = [
  'hello@escrowhaven.com',
  // Add other admin emails here
];

export function isAdminUser(email?: string): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

// Check if user can access test features (admin panel, test funding, etc.)
export function canAccessTestFeatures(email?: string): boolean {
  const config = getEnvConfig();
  
  // In dev/staging, everyone can access test features
  if (config.name !== 'production') {
    return true;
  }
  
  // In production, only admins
  return isAdminUser(email);
}

// Get display-friendly environment info
export function getEnvironmentInfo() {
  const config = getEnvConfig();
  return {
    name: config.displayName,
    network: config.network.replace('_', ' '),
    isTestnet: !config.isRealMoney,
    chainId: config.chainId,
    usingMockUSDC: !!config.mockUsdcAddress,
  };
}

// Get the appropriate Transak API key based on environment
export function getTransakApiKey(): string {
  const config = getEnvConfig();
  // Use staging key for test mode, production key for real money
  return config.isTestMode ? config.transakApiKeyStaging : config.transakApiKey;
}

// Check if Transak One (atomic deployment) is available
export function isTransakOneAvailable(): boolean {
  const config = getEnvConfig();
  // Transak One only available in production with the production API key
  return !config.isTestMode && !!config.transakApiKey;
}

// Export for use in components
export default {
  getEnvironment,
  getEnvConfig,
  isRealMoneyEnvironment,
  shouldShowTestUI,
  isAdminUser,
  canAccessTestFeatures,
  getEnvironmentInfo,
  getTransakApiKey,
  isTransakOneAvailable,
};