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

    // Get secret key based on environment
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const isProduction = moonPayMode === 'production';
    
    console.log('Environment:', moonPayMode);
    
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY_LIVE
      : process.env.MOONPAY_TEST_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ Secret key not found');
      console.error('Looking for:', isProduction ? 'MOONPAY_SECRET_KEY_LIVE' : 'MOONPAY_TEST_SECRET_KEY');
      return NextResponse.json(
        { error: `MoonPay secret key not configured for ${moonPayMode}` },
        { status: 500 }
      );
    }
    
    console.log('✅ Secret key found');
    console.log('Secret key length:', secretKey.length);
    
    // ✅ Build query string using URLSearchParams (automatically handles URL encoding)
    // Sort alphabetically as required by MoonPay
    const sortedEntries = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    const searchParams = new URLSearchParams();
    for (const [key, value] of sortedEntries) {
      searchParams.append(key, String(value));
    }
    
    // This creates the query string in the format: key1=value1&key2=value2
    const queryString = searchParams.toString();
    
    console.log('Parameters (sorted):', sortedEntries.map(([k]) => k));
    console.log('Query string:', queryString);
    console.log('Query string length:', queryString.length);
    
    // Create HMAC SHA256 signature - MoonPay expects base64
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated');
    console.log('Signature (full):', signature);
    
    // Return params with signature added
    const signedParams = {
      ...params,
      signature
    };
    
    console.log('✅ Returning signed params');
    console.log('Signed params keys:', Object.keys(signedParams));
    
    return NextResponse.json({ signedParams });
    
  } catch (error: any) {
    console.error('❌ Signing error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}