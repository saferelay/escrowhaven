import { ethers } from 'ethers';

export class FixedStaticJsonRpcProvider extends ethers.providers.StaticJsonRpcProvider {
  constructor(url: string, network?: ethers.providers.Networkish) {
    super(url, network);
  }

  async send(method: string, params: Array<any>): Promise<any> {
    const request = {
      method: method,
      params: params,
      id: this._nextId++,
      jsonrpc: "2.0"
    };

    // Use native fetch instead of ethers.utils.fetchJson
    const response = await fetch(this.connection.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();

    if (result.error) {
      const error = new Error(result.error.message || 'RPC Error');
      (error as any).code = result.error.code;
      (error as any).data = result.error.data;
      throw error;
    }

    return result.result;
  }
}

export async function getSigner() {
  const rpcUrl = process.env.ALCHEMY_API_KEY 
    ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    : 'https://rpc-amoy.polygon.technology/';
    
  console.log('Creating FixedStaticJsonRpcProvider with URL:', rpcUrl);
  
  const provider = new FixedStaticJsonRpcProvider(rpcUrl, {
    chainId: 80002,
    name: 'polygon-amoy'
  });

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  return signer;
}