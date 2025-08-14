import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Use dynamic import to avoid webpack issues
    const { ethers } = await import('ethers');
    
    const rpcUrl = 'https://polygon-amoy.g.alchemy.com/v2/lVidP_InCDhLrnXRLOz1f';
    console.log('Testing RPC:', rpcUrl);
    
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // Set a timeout
    const blockNumberPromise = provider.getBlockNumber();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );
    
    const blockNumber = await Promise.race([blockNumberPromise, timeoutPromise]);
    const network = await provider.getNetwork();
    
    return NextResponse.json({
      success: true,
      blockNumber,
      network: network.chainId,
      rpcUrl
    });
    
  } catch (error: any) {
    console.error('Blockchain test error:', error);
    return NextResponse.json({ 
      error: error.message,
      code: error.code,
      details: error
    }, { status: 500 });
  }
}