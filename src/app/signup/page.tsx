// FILE: src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { signIn, supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
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
        {/* Logo - Text only following design system */}
        <div className="flex justify-center">
          <button 
            onClick={() => router.push('/')}
            className="text-2xl font-normal tracking-tight"
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
            <form className="space-y-6" onSubmit={handleSignup}>
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
                  className="w-full bg-[#F8F9FD] border border-[#E0E2E7] rounded-lg px-4 py-3 text-black placeholder-[#B2B5BE] focus:bg-white focus:border-[#2962FF] focus:outline-none focus:ring-3 focus:ring-[#2962FF]/10 transition-all text-sm"
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
                  disabled={isLoading || !email}
                  className="w-full py-3 px-8 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-base focus:outline-none focus:ring-3 focus:ring-[#2962FF]/20 transform hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
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