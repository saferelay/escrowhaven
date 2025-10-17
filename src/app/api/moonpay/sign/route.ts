// src/app/api/moonpay/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('=== MoonPay Sign Request ===');
    
    const body = await req.json();
    const params = body.params;
    
    if (!params || typeof params !== 'object') {
      console.error('❌ No params object provided');
      return NextResponse.json(
        { error: 'Parameters object is required' },
        { status: 400 }
      );
    }

    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const isProduction = moonPayMode === 'production';
    
    console.log('Environment:', moonPayMode);
    
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY_LIVE
      : process.env.MOONPAY_TEST_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ Secret key not found');
      return NextResponse.json(
        { error: `MoonPay secret key not configured for ${moonPayMode}` },
        { status: 500 }
      );
    }
    
    console.log('✅ Secret key found');
    
    // ✅ Build query string exactly as MoonPay expects
    // Create a proper URL object to get the search params
    const baseUrl = isProduction 
      ? 'https://sell.moonpay.com'
      : 'https://sell-sandbox.moonpay.com';
    
    const url = new URL(baseUrl);
    
    // Add params in alphabetical order
    const sortedKeys = Object.keys(params).sort();
    for (const key of sortedKeys) {
      const value = params[key];
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
    
    // Get the search string (this is what we sign)
    const queryString = url.search.substring(1); // Remove the leading '?'
    
    console.log('Query string to sign:', queryString);
    console.log('Query string length:', queryString.length);
    
    // Create signature exactly as MoonPay docs specify
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated:', signature);
    
    // Return ONLY the signature (not the full params)
    // The SDK will add it to the params
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('❌ Signing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}