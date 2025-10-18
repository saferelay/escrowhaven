// src/app/api/moonpay/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('=== MoonPay Signature Generation ===');
    
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
        { error: 'MoonPay secret key not configured' },
        { status: 500 }
      );
    }
    
    const sortedKeys = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .sort();

    const queryParts: string[] = [];
    
    for (const key of sortedKeys) {
      const value = params[key];
      const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
      const encodedValue = encodeURIComponent(stringValue);
      queryParts.push(`${key}=${encodedValue}`);
    }
    
    const queryString = '?' + queryParts.join('&');
    
    // ✅ Log FULL query string without truncation
    console.log('FULL QUERY STRING:');
    console.log(queryString);
    console.log('END QUERY STRING');
    
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('Signature:', signature);
    
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
