// src/app/api/moonpay/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MoonPay } from '@moonpay/moonpay-node';

export async function POST(req: NextRequest) {
  try {
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
    
    const body = await req.json();
    const { params } = body;
    
    // Build full URL from params
    const baseUrl = isProduction 
      ? 'https://buy.moonpay.com/'
      : 'https://buy-sandbox.moonpay.com/';
    
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${baseUrl}?${queryString}`;
    
    // Use official MoonPay SDK to sign
    const moonPay = new MoonPay(secretKey);
    const signature = moonPay.url.generateSignature(fullUrl);
    
    return NextResponse.json({ signature });
    
  } catch (error: any) {
    console.error('Signing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}