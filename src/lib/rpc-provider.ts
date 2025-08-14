import { ethers } from 'ethers';
import { getEnvConfig } from './environment';

// For ethers v5, we use providers.JsonRpcProvider
export function getRpcProvider() {
  const config = getEnvConfig();
  console.log('getRpcProvider - Using RPC URL:', config.rpcUrl);
  
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    console.log('getRpcProvider - Provider created successfully');
    return provider;
  } catch (error) {
    console.error('getRpcProvider - Error creating provider:', error);
    throw error;
  }
}

// If you need a custom provider class later
export class NodeJsonRpcProvider extends ethers.providers.JsonRpcProvider {
  // Custom implementation if needed
}
