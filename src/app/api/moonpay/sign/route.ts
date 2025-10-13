// src/app/api/moonpay/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('=== MoonPay Sign Request ===');
    
    const body = await req.json();
    console.log('Body keys:', Object.keys(body));
    
    // Get the URL to sign
    const urlToSign = body.url;
    
    if (!urlToSign) {
      console.error('❌ No URL provided in body');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('URL length:', urlToSign.length);
    console.log('URL preview:', urlToSign.substring(0, 150) + '...');
    
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
    
    // Parse URL and extract query string
    let url;
    try {
      url = new URL(urlToSign);
    } catch (err) {
      console.error('❌ Invalid URL format:', err);
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    const queryString = url.search.substring(1); // Remove the '?'
    
    console.log('Query string length:', queryString.length);
    console.log('Query string preview:', queryString.substring(0, 100) + '...');
    
    if (!queryString) {
      console.error('❌ No query string in URL');
      return NextResponse.json(
        { error: 'URL must contain query parameters' },
        { status: 400 }
      );
    }
    
    // Create HMAC SHA256 signature
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('base64');
    
    console.log('✅ Signature generated successfully');
    console.log('Signature length:', signature.length);
    
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