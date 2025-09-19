import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      
      // Session is now established
      console.log('Session established via callback');
      
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }
  }
  
  // Redirect to root - the page.tsx will now properly detect auth and show dashboard
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
