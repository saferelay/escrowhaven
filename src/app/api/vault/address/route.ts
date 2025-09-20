// src/app/api/vault/address/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEnvConfig } from '@/lib/environment';
import { ethers } from 'ethers';

export async function POST(req: NextRequest) {
  try {
    const { salt, clientAddress, freelancerAddress } = await req.json();
    
    const config = getEnvConfig();
    
    // Import the factory contract ABI (you should have this from your contracts)
    const factoryABI = [
      {
        "inputs": [
          { "internalType": "bytes32", "name": "salt", "type": "bytes32" },
          { "internalType": "address", "name": "client", "type": "address" },
          { "internalType": "address", "name": "freelancer", "type": "address" }
        ],
        "name": "getVaultAddress",
        "outputs": [
          { "internalType": "address", "name": "vault", "type": "address" },
          { "internalType": "address", "name": "splitter", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    // Create provider using ethers v5 syntax
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    // Create contract instance
    const factoryContract = new ethers.Contract(
      config.factoryAddress,
      factoryABI,
      provider
    );
    
    // Call the contract method to get vault address
    const [vaultAddress, splitterAddress] = await factoryContract.getVaultAddress(
      salt,
      clientAddress,
      freelancerAddress
    );
    
    return NextResponse.json({ 
      vaultAddress,
      splitterAddress 
    });
  } catch (error) {
    console.error('Error getting vault address:', error);
    return NextResponse.json(
      { error: 'Failed to get vault address' },
      { status: 500 }
    );
  }
}