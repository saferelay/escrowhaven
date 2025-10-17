// src/app/api/moonpay/sign-official/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MoonPay } from '@moonpay/moonpay-node';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = body.params;
    
    if (!params || typeof params !== 'object') {
      return NextResponse.json(
        { error: 'Parameters object is required' },
        { status: 400 }
      );
    }

    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const isProduction = moonPayMode === 'production';
    
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY_LIVE
      : process.env.MOONPAY_TEST_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { error: `MoonPay secret key not configured` },
        { status: 500 }
      );
    }
    
    // Use MoonPay's official SDK to generate signature
    const moonPay = new MoonPay(secretKey);
    
    // Build the URL with params
    const baseUrl = isProduction 
      ? 'https://sell.moonpay.com'
      : 'https://sell-sandbox.moonpay.com';
    
    const searchParams = new URLSearchParams();
    const sortedKeys = Object.keys(params).sort();
    for (const key of sortedKeys) {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, String(params[key]));
      }
    }
    
    const fullUrl = `${baseUrl}?${searchParams.toString()}`;
    
    console.log('🔐 [Official SDK] Signing URL:', fullUrl);
    
    // Use official SDK's signature generation
    const signature = moonPay.url.generateSignature(fullUrl);
    
    console.log('✅ [Official SDK] Signature generated:', signature);
    
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('❌ [Official SDK] Signing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}