// FILE: src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    // Mark as new user for onboarding
    localStorage.setItem('saferelay_is_new_user', 'true');
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        setError('An account with this email already exists. Please log in instead.');
        setIsLoading(false);
        return;
      }

      // Mark as new user for onboarding
      localStorage.setItem('saferelay_is_new_user', 'true');

      // Send OTP
      const { error } = await signIn(email);

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <button 
            onClick={() => router.push('/')}
            className="text-xl md:text-2xl font-medium tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-black">escrowhaven</span>
            <span className="text-[#2962FF]">.io</span>
          </button>
        </div>
        
        <h2 className="mt-8 text-center text-3xl font-normal text-black">
          Create your account
        </h2>
        <p className="mt-3 text-center text-sm text-[#787B86]">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="font-medium text-[#2962FF] hover:text-[#1E53E5]"
          >
            Log in
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E0E2E7] rounded-xl sm:px-10">
          {!isSuccess ? (
            <div className="space-y-6">
              {/* Google Sign Up - PRIMARY CTA IN BLUE */}
              <button
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-8 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-base focus:outline-none focus:ring-3 focus:ring-[#2962FF]/20 transform hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.5891C15.35 13.3 14.6045 14.3591 13.4909 15.0682V17.5773H16.7818C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="white"/>
                  <path d="M10.2 20C12.9 20 15.1718 19.1045 16.7818 17.5773L13.4909 15.0682C12.5409 15.6682 11.3409 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.54091 11.9H1.14545V14.4909C2.74545 17.6591 6.20455 20 10.2 20Z" fill="white"/>
                  <path d="M4.54091 11.9C4.34091 11.3 4.22727 10.6591 4.22727 10C4.22727 9.34091 4.34091 8.7 4.54091 8.1V5.50909H1.14545C0.477273 6.84091 0.0909091 8.37727 0.0909091 10C0.0909091 11.6227 0.477273 13.1591 1.14545 14.4909L4.54091 11.9Z" fill="white"/>
                  <path d="M10.2 3.97727C11.4591 3.97727 12.5909 4.38182 13.4864 5.23636L16.4182 2.30455C15.1673 1.13636 12.8955 0.363636 10.2 0.363636C6.20455 0.363636 2.74545 2.70455 1.14545 5.50909L4.54091 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="white"/>
                </svg>
                <span>
                  {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E0E2E7]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#787B86]">Or continue with email</span>
                </div>
              </div>

              {/* Email Form - SECONDARY */}
              <form className="space-y-6" onSubmit={handleEmailSignup}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isGoogleLoading}
                    className="w-full bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg px-4 py-3 text-black placeholder-[#B2B5BE] focus:bg-white focus:border-[#2962FF] focus:outline-none focus:ring-3 focus:ring-[#2962FF]/10 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-[#EF5350]/10 border border-[#EF5350]/20 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-[#EF5350]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-[#EF5350]">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading || !email}
                    className="w-full py-3 px-8 bg-white border-2 border-[#E0E2E7] text-black rounded-lg hover:border-[#787B86] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-base focus:outline-none focus:ring-3 focus:ring-[#2962FF]/10"
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </button>
                </div>

                <div className="text-xs text-[#787B86] text-center">
                  By creating an account, you agree to our{' '}
                  <a href="/terms" className="text-[#2962FF] hover:text-[#1E53E5]">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-[#2962FF] hover:text-[#1E53E5]">
                    Privacy Policy
                  </a>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#26A69A]/10 border-2 border-[#26A69A]">
                <svg className="h-6 w-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-black">Check your email!</h3>
              <p className="mt-2 text-sm text-[#787B86]">
                We sent a magic link to <strong className="text-black">{email}</strong>
              </p>
              <div className="mt-4 text-sm text-[#787B86]">
                <p>Click the link to complete your account setup.</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="mt-6 text-sm text-[#2962FF] hover:text-[#1E53E5] font-medium"
              >
                Go back to home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}