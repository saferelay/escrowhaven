// src/app/api/test/verify-predicted/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json();
    
    // Direct check - skip factory call entirely
    const provider = new ethers.providers.JsonRpcProvider(
      'https://rpc-amoy.polygon.technology/'
    );
    
    const MOCK_USDC = "0x8B0180f2101c8260d49339abfEe87927412494B4";
    
    // The address where you sent funds
    const predictedAddress = "0x907861Ae534FB437c4aeb45Bb406DAB63889a9De";
    
    const usdcContract = new ethers.Contract(
      MOCK_USDC,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );
    
    const balance = await usdcContract.balanceOf(predictedAddress);
    
    return NextResponse.json({
      escrowId,
      predictedAddress,
      balance: ethers.utils.formatUnits(balance, 6),
      hasBalance: balance.gt(0)
    });
    
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}