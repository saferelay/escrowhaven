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
    
    // Get secret key based on MoonPay mode
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    
    // In sandbox mode, secret key is not required
    if (moonPayMode === 'sandbox') {
      console.log('ℹ️ Sandbox mode - signature not required');
      return NextResponse.json({ 
        signature: null // No signature needed for sandbox
      });
    }
    
    const secretKey = process.env.MOONPAY_SECRET_KEY_LIVE;
    
    if (!secretKey) {
      console.error('❌ MoonPay live secret key not configured');
      return NextResponse.json(
        { error: 'MoonPay production secret key not configured' },
        { status: 500 }
      );
    }
    
    // Build query string - DO NOT SORT (order matters!)
    const queryParts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        // URL encode the value (not the key)
        queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
    
    const queryString = queryParts.join('&');
    
    console.log('Signing query string:', queryString);
    
    // Generate signature using HMAC SHA-256
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated successfully');
    
    return NextResponse.json({ 
      signature
    });
    
  } catch (error: any) {
    console.error('❌ MoonPay signing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign parameters' },
      { status: 500 }
    );
  }
}