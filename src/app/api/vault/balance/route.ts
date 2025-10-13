// src/app/api/vault/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Minimal ERC20 ABI - just need balanceOf
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)'
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vaultAddress } = body;

    if (!vaultAddress || !ethers.utils.isAddress(vaultAddress)) {
      return NextResponse.json(
        { error: 'Valid vault address is required' },
        { status: 400 }
      );
    }

    console.log('Checking balance for vault:', vaultAddress);

    // Get RPC URL from environment
    const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
    
    if (!rpcUrl) {
      console.error('No RPC URL configured');
      return NextResponse.json(
        { error: 'RPC configuration missing' },
        { status: 500 }
      );
    }

    // Create provider (ethers v5)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // USDC contract address on Polygon Mainnet
    const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

    // Create contract instance
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ERC20_ABI,
      provider
    );

    // Get balance
    const balanceWei = await usdcContract.balanceOf(vaultAddress);
    
    // USDC has 6 decimals
    const balance = Number(ethers.utils.formatUnits(balanceWei, 6));

    console.log('Vault balance:', balance, 'USDC');

    return NextResponse.json({
      balance,
      balanceWei: balanceWei.toString(),
      vaultAddress
    });

  } catch (error: any) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check balance' },
      { status: 500 }
    );
  }
}

// Also support GET for direct queries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vaultAddress = searchParams.get('vaultAddress');

    if (!vaultAddress || !ethers.utils.isAddress(vaultAddress)) {
      return NextResponse.json(
        { error: 'Valid vault address is required' },
        { status: 400 }
      );
    }

    const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
    
    if (!rpcUrl) {
      return NextResponse.json(
        { error: 'RPC configuration missing' },
        { status: 500 }
      );
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ERC20_ABI,
      provider
    );

    const balanceWei = await usdcContract.balanceOf(vaultAddress);
    const balance = Number(ethers.utils.formatUnits(balanceWei, 6));

    return NextResponse.json({
      balance,
      balanceWei: balanceWei.toString(),
      vaultAddress
    });

  } catch (error: any) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check balance' },
      { status: 500 }
    );
  }
}