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
    
    console.log('Secret key present:', !!secretKey);
    console.log('Secret key length:', secretKey?.length);
    
    // ✅ CRITICAL FIX: Build query string using URLSearchParams (handles encoding correctly)
    // Sort keys alphabetically as MoonPay requires
    const sortedKeys = Object.keys(params).sort();
    const searchParams = new URLSearchParams();
    
    for (const key of sortedKeys) {
      const value = params[key];
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    
    const queryString = searchParams.toString();
    
    console.log('Parameters being signed (sorted):', sortedKeys);
    console.log('Query string:', queryString);
    console.log('Query string length:', queryString.length);
    
    // Create HMAC SHA256 signature - MoonPay expects base64
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated');
    console.log('Signature:', signature);
    
    // Return params with signature added
    const signedParams = {
      ...params,
      signature
    };
    
    console.log('✅ Returning signed params');
    
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