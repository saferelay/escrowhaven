import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  console.log('Testing deployment capability...');
  
  try {
    // Test 1: Basic RPC connection
    console.log('1. Testing RPC connection...');
    const provider = new ethers.providers.StaticJsonRpcProvider(
      'https://rpc-amoy.polygon.technology',
      {
        name: 'polygon-amoy',
        chainId: 80002
      }
    );
    
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Connected! Block:', blockNumber);
    
    // Test 2: Wallet connection
    console.log('2. Testing wallet...');
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('No private key');
    }
    
    const signer = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(signer.address);
    console.log('✅ Wallet balance:', ethers.utils.formatEther(balance), 'MATIC');
    
    // Test 3: Factory contract
    console.log('3. Testing factory contract...');
    const factoryAddress = process.env.SAFERELAY_FACTORY_ADDRESS_MOCK || '0x66807A3fa2C628BD3f52D543F2225bFbf13ea293';
    const FACTORY_ABI = ["function saferelayBackend() view returns (address)"];
    
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
    const backend = await factory.saferelayBackend();
    console.log('✅ Factory backend:', backend);
    
    return NextResponse.json({
      success: true,
      blockNumber,
      signerAddress: signer.address,
      balance: ethers.utils.formatEther(balance),
      factoryAddress,
      backend
    });
    
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
