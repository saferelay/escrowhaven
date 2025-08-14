// src/components/MagicLinkLogin.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function MagicLinkLogin({ 
  redirectTo = '/dashboard',
  prompt = "Enter your email to continue" 
}: { 
  redirectTo?: string;
  prompt?: string;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-4xl mb-4">✉️</div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">Check your email!</h3>
        <p className="text-green-700 text-sm">
          We've sent a magic link to <strong>{email}</strong>
        </p>
        <p className="text-green-600 text-xs mt-2">
          Click the link in the email to sign in securely.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {prompt}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 We'll email you a secure sign-in link. No password needed.
      </p>
    </form>
  );
}