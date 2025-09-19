import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API routes are working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  const body = await request.json();
  return NextResponse.json({ 
    message: 'POST is working!',
    received: body,
    timestamp: new Date().toISOString()
  });
}
