// src/lib/constants/blockchain.ts
export async function getWorkingProvider(isTestMode: boolean) {
    const { ethers } = await import('ethers');
    
    const endpoints = [];
    
    if (isTestMode) {
      // Polygon Amoy - Updated working endpoints
      if (process.env.ALCHEMY_API_KEY) {
        endpoints.push(`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
      }
      endpoints.push(
        'https://rpc-amoy.polygon.technology/',
        'https://polygon-amoy.drpc.org',
        'https://polygon-amoy-bor-rpc.publicnode.com'
      );
    } else {
      // Polygon Mainnet
      if (process.env.ALCHEMY_API_KEY) {
        endpoints.push(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
      }
      endpoints.push(
        'https://polygon-rpc.com',
        'https://rpc-mainnet.matic.network'
      );
    }
    
    const errors = [];
    
    for (const rpc of endpoints) {
      try {
        console.log('Trying RPC:', rpc.split('/v2/')[0]);
        
        // Use StaticJsonRpcProvider with explicit network config
        const provider = new ethers.providers.StaticJsonRpcProvider(
          {
            url: rpc,
            skipFetchSetup: true // Skip the network detection
          },
          {
            chainId: isTestMode ? 80002 : 137,
            name: isTestMode ? 'polygon-amoy' : 'polygon',
            ensAddress: undefined
          }
        );
        
        // Reduce timeout for faster failover
        provider.pollingInterval = 5000;
        provider._maxInternalBlockNumber = -1024;
        
        // Simple test that should work
        const network = await provider.getNetwork();
        console.log(`✅ Connected to ${network.name} (chainId: ${network.chainId})`);
        return provider;
        
      } catch (e: any) {
        errors.push(`${rpc.split('/')[2]}: ${e.message}`);
        continue;
      }
    }
    
    throw new Error(`All RPC endpoints failed: ${errors.join('; ')}`);
  }

export function getUSDCAddress(isTestMode: boolean): string {
    if (isTestMode) {
      // Mock USDC on Polygon Amoy testnet
      return '0x8B0180f2101c8260d49339abfEe87927412494B4';
    } else {
      // USDC on Polygon mainnet 
      return '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
    }
  }