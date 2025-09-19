'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/icons/Logo';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleDashboard = () => {
    // For hash navigation, set the hash directly
    window.location.hash = 'dashboard';
  };

  const handleStartEscrow = () => {
    // If logged in, go to dashboard, otherwise go to signup
    if (user) {
      window.location.hash = 'dashboard';
    } else {
      router.push('/signup');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
      isScrolled 
        ? 'bg-white border-b border-[#E0E2E7]' 
        : 'bg-white'
    }`}>
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - far left */}
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Logo size={56} color="#000000" />
              <span className="text-lg font-semibold text-black">escrowhaven</span>
            </button>
          </div>
          
          {/* Centered menu */}
          <div className="hidden lg:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
            <a href="#how-it-works" className="text-sm text-[#787B86] hover:text-black transition-colors">How It Works</a>
            <a href="#use-cases" className="text-sm text-[#787B86] hover:text-black transition-colors">Use Cases</a>
            <a href="#resources" className="text-sm text-[#787B86] hover:text-black transition-colors">Resources</a>
            <a href="#about" className="text-sm text-[#787B86] hover:text-black transition-colors">About</a>
            <a href="#pricing" className="text-sm text-[#787B86] hover:text-black transition-colors">Pricing</a>
          </div>
          
          {/* Right side - changes based on auth state */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#E0E2E7] border-t-[#2962FF]"></div>
            ) : user ? (
              <>
                <button 
                  onClick={handleDashboard}
                  className="text-sm text-[#787B86] hover:text-black transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleStartEscrow}
                  className="px-5 py-2 bg-[#2962FF] text-white text-sm rounded-lg hover:bg-[#1E53E5] transition-colors font-medium"
                >
                  Create Escrow
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLogin}
                  className="text-sm text-[#787B86] hover:text-black transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={handleSignup}
                  className="px-5 py-2 bg-[#2962FF] text-white text-sm rounded-lg hover:bg-[#1E53E5] transition-colors font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}