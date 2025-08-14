// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=auth_failed');
          return;
        }

        if (session) {
          // Session established, redirect to home (which shows dashboard when authenticated)
          router.push('/');
        } else {
          // No session, check URL for error
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          if (error) {
            console.error('Auth error:', error, errorDescription);
            router.push(`/login?error=${error}`);
          } else {
            // Try to exchange the code for a session
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
            
            if (!exchangeError) {
              router.push('/'); // Changed from '/dashboard' to '/'
            } else {
              console.error('Exchange error:', exchangeError);
              router.push('/login?error=exchange_failed');
            }
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        router.push('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}