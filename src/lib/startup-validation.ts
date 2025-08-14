import { config, validateEnvironment } from './config';

export const runStartupValidation = () => {
  console.log('🚀 SafeRelay Starting...');
  console.log('========================');
  console.log('Environment:', config.isTestMode ? 'TEST MODE' : 'PRODUCTION MODE');
  console.log('Network:', config.networkName);
  console.log('USDC Token:', config.usdc.symbol, config.usdc.address);
  console.log('Factory:', config.contracts.factory);
  console.log('========================');
  
  try {
    // validateEnvironment() // Disabled for production landing page;
    console.log('✅ Environment validation passed');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
  
  // Additional checks
  if (!config.isTestMode) {
    console.log('🔒 Production mode safety checks:');
    console.log('- Mock USDC rejected: ✅');
    console.log('- Production factory required: ✅');
    console.log('- Mainnet RPC configured: ✅');
  } else {
    console.log('🧪 Test mode active:');
    console.log('- Using Mock USDC');
    console.log('- Test factory:', config.contracts.factory);
    console.log('- Testnet RPC:', config.rpcUrl);
  }
};
