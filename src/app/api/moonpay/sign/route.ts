// src/app/api/moonpay/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Support both URL signing (for React SDK) and params signing (legacy)
    const url = body.url;
    const params = body.params;
    
    if (!url && !params) {
      return NextResponse.json(
        { error: 'Either url or params is required' },
        { status: 400 }
      );
    }
    
    // Get secret key based on MoonPay mode
    const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
    const isProduction = moonPayMode === 'production';
    
    const secretKey = isProduction
      ? process.env.MOONPAY_SECRET_KEY
      : process.env.MOONPAY_TEST_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ MoonPay secret key not configured for', isProduction ? 'production' : 'sandbox');
      return NextResponse.json(
        { error: `MoonPay secret key not configured for ${isProduction ? 'production' : 'sandbox'}` },
        { status: 500 }
      );
    }
    
    let queryString = '';
    
    // URL signing (for React SDK with onUrlSignatureRequested)
    if (url) {
      const urlObj = new URL(url);
      queryString = urlObj.search.substring(1); // Remove the '?'
      
      console.log('🔐 Signing URL query string:', queryString.substring(0, 100) + '...');
      
      // Generate signature
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(queryString)
        .digest('base64');
      
      console.log('✅ URL signature generated');
      
      return NextResponse.json({ signature });
    }
    
    // Params signing (legacy approach)
    if (params && typeof params === 'object') {
      const queryParts: string[] = [];
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
        }
      }
      
      queryString = queryParts.join('&');
      
      console.log('🔐 Signing params query string:', queryString.substring(0, 100) + '...');
      
      // Generate signature
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(queryString)
        .digest('base64');
      
      console.log('✅ Params signature generated');
      
      // Return signed params with signature included
      const signedParams = {
        ...params,
        signature
      };
      
      return NextResponse.json({ 
        signature,
        signedParams 
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('❌ MoonPay signing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign' },
      { status: 500 }
    );
  }
}