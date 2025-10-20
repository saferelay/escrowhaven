'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function MagicLinkLogin({ 
  redirectTo = '/dashboard',
  prompt = "Sign in to continue" 
}: { 
  redirectTo?: string;
  prompt?: string;
}) {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-4xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">You're signed in!</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700 text-center">{prompt}</p>
      
      <button
        onClick={login}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Sign In
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 Secure email or social login. No passwords needed.
      </p>
    </div>
  );
}