// Create new file: src/app/api/escrow/check-auth/route.js
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const FACTORY_ABI = [
  "function authorizedExecutor() view returns (address)"
];

export async function GET() {
  const provider = new ethers.JsonRpcProvider("https://polygon-amoy.drpc.org");
  
  // Get backend wallet address
  const backendWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const backendAddress = backendWallet.address;
  
  // Check factory's authorized executor
  const factory = new ethers.Contract(
    process.env.ESCROWHAVEN_FACTORY_ADDRESS,
    FACTORY_ABI,
    provider
  );
  
  const authorizedExecutor = await factory.authorizedExecutor();
  
  return NextResponse.json({
    backendWallet: backendAddress,
    authorizedExecutor: authorizedExecutor,
    isAuthorized: backendAddress.toLowerCase() === authorizedExecutor.toLowerCase()
  });
}