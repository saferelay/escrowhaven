// src/app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error('App error:', error);
  }, [error]);

  // If it's an auth error, offer to refresh
  if (error.message.includes('Failed to fetch') || error.message.includes('auth')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-medium text-[#000000] mb-4">Session Expired</h2>
          <p className="text-[#787B86] mb-6">Your session has expired. Please refresh the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-medium text-[#000000] mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}