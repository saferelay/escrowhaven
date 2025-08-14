// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't need authentication
const publicRoutes = [
  '/api/escrow/create-transparent',
  '/api/escrow/approve',
  '/api/stripe/onrampWebhook',
  '/api/public',
  '/',
  '/new',
  '/escrow'
];

// Define static assets and system routes to always allow
const alwaysAllow = [
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/.well-known'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Always allow static assets and system routes
  if (alwaysAllow.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers to ALL responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add Strict-Transport-Security for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Allow public routes without authentication
  if (isPublicRoute) {
    // Add CORS headers for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return response;
  }
  
  // For protected routes, check if user is authenticated
  // This is where Vercel's authentication would normally kick in
  // Since we want to disable it for API routes, we'll just allow them
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};