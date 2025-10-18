// src/app/api/moonpay/sign/route.ts
// ✅ Correct MoonPay signature generation per official docs
// https://dev.moonpay.com/docs/on-ramp-enhance-security-using-signed-urls

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('=== MoonPay Signature Generation ===');
    
    const body = await req.json();
    const params = body.params;
    
    if (!params || typeof params !== 'object') {
      console.error('❌ No params object provided');
      return NextResponse.json(
        { error: 'Parameters object is required' },
        { status: 400 }
      );
    }

    // Determine environment and get secret key
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const isProduction = moonPayMode === 'production';
    
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY_LIVE
      : process.env.MOONPAY_TEST_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ Secret key not configured');
      return NextResponse.json(
        { error: 'MoonPay secret key not configured' },
        { status: 500 }
      );
    }
    
    console.log('Environment:', moonPayMode);
    console.log('Params keys:', Object.keys(params).sort());

    // ✅ CRITICAL: Build query string per MoonPay spec
    // 1. Filter out undefined/null values
    // 2. Sort keys alphabetically
    // 3. URL-encode each key=value pair
    // 4. Join with &
    
    const sortedKeys = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .sort(); // Alphabetical order

    console.log('Sorted keys:', sortedKeys);
    
    // Build query string with proper encoding
    const queryParts: string[] = [];
    
    for (const key of sortedKeys) {
      const value = params[key];
      // Encode both key and value properly
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value));
      queryParts.push(`${encodedKey}=${encodedValue}`);
    }
    
    const queryString = queryParts.join('&');
    
    console.log('Query string to sign:', queryString.substring(0, 100) + '...');
    
    // ✅ Generate HMAC-SHA256 signature
    // Per MoonPay docs: signature = base64(hmac-sha256(secret_key, query_string))
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated:', signature.substring(0, 20) + '...');
    
    // ✅ Return signature only (NOT URL-encoded for SDK)
    // SDK will handle URL encoding when building the widget
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('❌ Signature generation error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}