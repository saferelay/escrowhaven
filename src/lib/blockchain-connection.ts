import { ethers } from 'ethers';
import { getEnvConfig } from './environment';

let cachedProvider: ethers.providers.JsonRpcProvider | null = null;

export async function getBlockchainProvider(): Promise<ethers.providers.JsonRpcProvider> {
  if (cachedProvider) {
    try {
      // Test if the cached provider is still working
      await cachedProvider.getNetwork();
      return cachedProvider;
    } catch (error) {
      console.log('Cached provider failed, creating new one');
      cachedProvider = null;
    }
  }

  const config = getEnvConfig();
  const rpcUrl = config.rpcUrl;
  
  console.log('Creating new provider with URL:', rpcUrl);
  
  // Create provider with explicit network configuration
  const provider = new ethers.providers.JsonRpcProvider({
    url: rpcUrl,
    timeout: 30000,
  });
  
  // Wait for the provider to be ready
  try {
    await provider.ready;
    const network = await provider.getNetwork();
    console.log('Provider ready, network:', network.chainId);
    cachedProvider = provider;
    return provider;
  } catch (error) {
    console.error('Provider initialization failed:', error);
    throw error;
  }
}

export async function getBlockchainSigner(): Promise<ethers.Wallet> {
  const provider = await getBlockchainProvider();
  return new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
}