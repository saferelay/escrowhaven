// src/app/api/moonpay/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { params } = await req.json();
    
    if (!params || typeof params !== 'object') {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }
    
    // Get secret key based on environment
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY_LIVE!
      : process.env.MOONPAY_SECRET_KEY_TEST!;
    
    if (!secretKey) {
      console.error('MoonPay secret key not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // CRITICAL: Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    
    // Build query string with sorted keys
    const queryParts: string[] = [];
    for (const key of sortedKeys) {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        // URL encode both key and value
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    
    const queryString = queryParts.join('&');
    
    console.log('Signing query string:', queryString);
    
    // Generate signature
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('Generated signature');
    
    return NextResponse.json({ 
      signature,
      signedParams: {
        ...params,
        signature
      }
    });
    
  } catch (error: any) {
    console.error('MoonPay signing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign parameters' },
      { status: 500 }
    );
  }
}