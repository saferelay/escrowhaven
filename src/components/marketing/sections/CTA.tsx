'use client';

import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export function CTA() {
  const router = useRouter();
  const { login, authenticated } = usePrivy();

  const handleSignup = () => {
    if (authenticated) {
      router.push('/dashboard');
    } else {
      login();
    }
  };

  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-normal text-black mb-8">
          The fastest, fairest way to pay and get paid online.
        </h2>
        <button 
          onClick={handleSignup}
          className="px-8 py-3 bg-[#2962FF] text-white rounded-lg font-medium hover:bg-[#1E53E5] transition-colors text-base"
        >
          Create a Vault
        </button>
      </div>
    </div>
  );
}