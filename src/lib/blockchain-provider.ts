import { ethers } from 'ethers';

// Use StaticJsonRpcProvider to avoid the network detection issue
export function getProvider(): ethers.providers.StaticJsonRpcProvider {
  const rpcUrl = process.env.ALCHEMY_API_KEY 
    ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    : 'https://rpc-amoy.polygon.technology';
    
  console.log('Creating StaticJsonRpcProvider with URL:', rpcUrl);
  
  // StaticJsonRpcProvider doesn't try to detect the network
  const provider = new ethers.providers.StaticJsonRpcProvider(
    rpcUrl,
    {
      chainId: 80002,
      name: 'polygon-amoy'
    }
  );
  
  return provider;
}

export function getSigner(): ethers.Wallet {
  const provider = getProvider();
  return new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
}
