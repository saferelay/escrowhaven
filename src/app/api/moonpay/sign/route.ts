// src/app/api/moonpay/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('=== MoonPay Sign Request ===');
    
    const body = await req.json();
    
    // Accept either queryString directly or extract from url
    let queryString = body.queryString;
    
    if (!queryString && body.url) {
      // Legacy: extract from URL
      const url = new URL(body.url);
      queryString = url.search.substring(1);
    }
    
    if (!queryString) {
      console.error('❌ No query string provided');
      return NextResponse.json(
        { error: 'Query string is required' },
        { status: 400 }
      );
    }

    console.log('Query string to sign:', queryString.substring(0, 150) + '...');
    
    // Get secret key based on environment
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const isProduction = moonPayMode === 'production';
    
    console.log('Environment:', moonPayMode);
    console.log('Is Production:', isProduction);
    
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY_LIVE
      : process.env.MOONPAY_TEST_SECRET_KEY;
    
    console.log('Secret key exists:', !!secretKey);
    console.log('Secret key prefix:', secretKey?.substring(0, 10));
    
    if (!secretKey) {
      console.error('❌ Secret key not found');
      console.error('Looking for:', isProduction ? 'MOONPAY_SECRET_KEY_LIVE' : 'MOONPAY_TEST_SECRET_KEY');
      return NextResponse.json(
        { error: `Secret key not configured for ${moonPayMode}` },
        { status: 500 }
      );
    }
    
    console.log('Query string length:', queryString.length);
    
    // Create HMAC SHA256 signature - MoonPay expects base64
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated successfully');
    console.log('Signature preview:', signature.substring(0, 20) + '...');
    
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('❌ Signing error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to sign URL' },
      { status: 500 }
    );
  }
}