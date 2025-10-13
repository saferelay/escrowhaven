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
    
    // CRITICAL: Sort parameters alphabetically
    // MoonPay requires exact alphabetical order for signature validation
    const sortedKeys = Object.keys(params).sort();
    const queryParts: string[] = [];
    
    console.log('Parameters (sorted):', sortedKeys);
    
    for (const key of sortedKeys) {
      const value = params[key];
      // URL encode both key and value
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    
    const queryString = queryParts.join('&');
    
    console.log('Query string to sign:', queryString.substring(0, 120) + '...');
    console.log('Query string length:', queryString.length);
    
    // Create HMAC SHA256 signature - MoonPay expects base64
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated');
    console.log('Signature preview:', signature.substring(0, 20) + '...');
    
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('❌ Signing error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}