// src/components/layout/UnifiedLayout.tsx - PREMIUM HEADER VERSION
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  showCTA?: boolean; // Show CTA on landing page
}

export function UnifiedLayout({ children, showCTA = false }: UnifiedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const { user, loading, signOut, signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      await signIn(email);
      setShowLoginModal(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const openWizard = () => {
    if (user) {
      setWizardOpen(true);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header - Fixed position with backdrop blur */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Premium feel */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-trust-blue/20 blur-xl"></div>
                <svg className="relative h-8 w-8" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="6" fill="#2563EB"/>
                  <path d="M12 20L16 16L20 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M12 12L16 16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-semibold text-slate-900">escrowhaven</span>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                How it Works
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </Link>
              <Link href="/security" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Security
              </Link>
              {user && (
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Right Section - Auth & CTA */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse bg-slate-200 h-9 w-24 rounded-lg"></div>
              ) : user ? (
                <>
                  <span className="hidden lg:inline text-sm text-slate-500">{user.email}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={openWizard}
                    className="px-5 py-2 bg-trust-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                  >
                    Start Escrow
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={openWizard}
                    className="px-5 py-2 bg-trust-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                  >
                    Start Escrow →
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Premium slide-in */}
      <div className={`md:hidden fixed inset-0 z-50 ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-slate-900/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className={`fixed right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl transition-transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4 space-y-1">
            <Link href="/how-it-works" className="block px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              How it Works
            </Link>
            <Link href="/pricing" className="block px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Pricing
            </Link>
            <Link href="/security" className="block px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Security
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                Sign In
              </button>
            )}
            <div className="pt-4">
              <button
                onClick={openWizard}
                className="w-full px-4 py-3 bg-trust-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Start Escrow
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content - Add padding for fixed header */}
      <main className="pt-16">
        <div className="max-w-container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {/* Login Modal - Premium styling */}
      {showLoginModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={() => setShowLoginModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-trust-blue/10 rounded-xl mb-4">
                <svg className="w-6 h-6 text-trust-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-500 mt-1">Sign in to your escrowhaven account</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-trust-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending magic link...
                  </span>
                ) : (
                  'Continue with Magic Link'
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">
                We'll email you a secure link to sign in. No password needed.
              </p>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                New to escrowhaven?{' '}
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    openWizard();
                  }}
                  className="text-trust-blue hover:text-blue-700 font-medium"
                >
                  Create your first escrow
                </button>
              </p>
            </div>
          </div>
        </>
      )}

      {/* Import CreateEscrowWizard if needed */}
      {wizardOpen && (
        <div>
          {/* CreateEscrowWizard component would go here */}
          {/* <CreateEscrowWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} /> */}
        </div>
      )}
    </div>
  );
}