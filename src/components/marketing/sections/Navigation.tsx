'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { user, authenticated, ready, login } = usePrivy();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    login(); // Opens Privy modal directly
  };

  const handleSignup = () => {
    login(); // Same modal - Privy handles new users automatically
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleStartEscrow = () => {
    if (authenticated) {
      router.push('/dashboard');
    } else {
      login();
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          {/* Logo with icon */}
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/logo.svg" 
                alt="EscrowHaven Logo" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl md:text-2xl font-medium tracking-tight text-black">
                escrowhaven<span className="text-[#2962FF]">.io</span>
              </span>
            </button>
          </div>
          
          {/* Centered menu with smooth scrolling */}
          <div className="hidden lg:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
            <a 
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="text-sm text-[#787B86] hover:text-black transition-colors"
            >
              How It Works
            </a>
            <a 
              href="/about" 
              className="text-sm text-[#787B86] hover:text-black transition-colors"
            >
              About
            </a>
            <a 
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="text-sm text-[#787B86] hover:text-black transition-colors"
            >
              Pricing
            </a>
          </div>
          
          {/* Right side - auth state dependent */}
          <div className="flex items-center gap-4">
            {!ready ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#E0E2E7] border-t-[#2962FF]"></div>
            ) : authenticated ? (
              <button 
              onClick={handleDashboard}
              className="px-5 py-2 bg-[#2962FF] text-white text-sm rounded-lg hover:bg-[#1E53E5] transition-colors font-medium"
            >
              Go to Dashboard
            </button>
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