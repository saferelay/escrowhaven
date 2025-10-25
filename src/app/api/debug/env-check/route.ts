// app/api/debug/env-check/route.ts
// TEMPORARY DEBUG ENDPOINT - Remove after testing!
import { NextResponse } from 'next/server';

export async function GET() {
  // Only show non-sensitive public environment variables
  const publicEnvVars = {
    // Check if our critical env vars are loaded
    NEXT_PUBLIC_BACKEND_SIGNER_ADDRESS: process.env.NEXT_PUBLIC_BACKEND_SIGNER_ADDRESS || 'NOT_SET',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
    
    // Check if private keys are loaded (just show if they exist, not the values)
    PRIVATE_KEY: process.env.PRIVATE_KEY ? 'SET' : 'NOT_SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET',
    
    // Node environment
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    
    // Vercel environment
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET',
  };

  return NextResponse.json({
    message: 'Environment variables check',
    timestamp: new Date().toISOString(),
    envVars: publicEnvVars,
    warning: 'This is a debug endpoint. Remove it after testing!'
  });
}