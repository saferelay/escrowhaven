// src/app/api/moonpay/sign/route.ts
// ✅ Exact MoonPay specification from official docs
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

    // ✅ Build query string per OFFICIAL MoonPay spec
    // 1. Filter out undefined/null/empty values
    // 2. Sort keys alphabetically
    // 3. URL-encode INDIVIDUAL values (not whole string)
    // 4. Build with ? prefix
    
    const sortedKeys = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .sort();

    console.log('Sorted keys:', sortedKeys);
    
    // Build query parts with proper encoding
    const queryParts: string[] = [];
    
    for (const key of sortedKeys) {
      const value = params[key];
      // Convert booleans to lowercase strings before encoding
      const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
      // URL-encode each value individually
      const encodedValue = encodeURIComponent(stringValue);
      queryParts.push(`${key}=${encodedValue}`);
    }
    
    // ✅ CRITICAL: Include the ? prefix as MoonPay expects
    const queryString = '?' + queryParts.join('&');
    
    console.log('Query string to sign (with ?):', queryString.substring(0, 100) + '...');
    console.log('Query string length:', queryString.length);
    
    // ✅ Generate HMAC-SHA256 signature exactly as MoonPay docs specify
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated successfully');
    console.log('Signature:', signature.substring(0, 30) + '...');
    
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}