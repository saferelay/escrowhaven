// src/app/api/moonpay/sign/route.ts
// ✅ FIXED: Proper URL encoding and correct base URL for each flow
import { NextRequest, NextResponse } from 'next/server';
import { MoonPay } from '@moonpay/moonpay-node';

export async function POST(req: NextRequest) {
  try {
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const isProduction = moonPayMode === 'production';
    
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY_LIVE
      : process.env.MOONPAY_TEST_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ MoonPay secret key not configured');
      return NextResponse.json(
        { error: 'MoonPay secret key not configured' },
        { status: 500 }
      );
    }
    
    const body = await req.json();
    const { params, flow } = body;
    
    if (!flow || !['buy', 'sell'].includes(flow)) {
      return NextResponse.json(
        { error: 'Flow must be either "buy" or "sell"' },
        { status: 400 }
      );
    }
    
    console.log('🔐 Signing MoonPay URL');
    console.log('Flow:', flow);
    console.log('Environment:', isProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('Params received:', Object.keys(params));
    
    // Get API key from environment
    const apiKey = isProduction
      ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
      : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'MoonPay API key not configured' },
        { status: 500 }
      );
    }
    
    // CRITICAL: Add apiKey to params before signing
    const paramsWithApiKey = {
      apiKey,
      ...params
    };
    
    // Choose correct base URL based on flow
    const baseUrl = flow === 'sell'
      ? (isProduction ? 'https://sell.moonpay.com/' : 'https://sell-sandbox.moonpay.com/')
      : (isProduction ? 'https://buy.moonpay.com/' : 'https://buy-sandbox.moonpay.com/');
    
    console.log('Base URL:', baseUrl);
    
    // CRITICAL: URL-encode ALL parameters before signing (MoonPay requirement)
    const queryString = new URLSearchParams(
      Object.entries(paramsWithApiKey).map(([key, value]) => [
        key,
        String(value)
      ])
    ).toString();
    
    const fullUrl = `${baseUrl}?${queryString}`;
    console.log('Full URL (before signature):', fullUrl);
    
    // Use official MoonPay SDK to generate signature
    const moonPay = new MoonPay(secretKey);
    const signature = moonPay.url.generateSignature(fullUrl);
    
    console.log('✅ Signature generated successfully');
    console.log('Signature (first 20 chars):', signature.substring(0, 20) + '...');
    
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('❌ Signing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}