// FILE: src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TransparencyPage } from '@/components/transparency/TransparencyPage';
import MarketingPage from '@/components/marketing/MarketingPage';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type ViewType = 'marketing' | 'dashboard' | 'transparency' | 'escrow' | 'login' | 'help';

export default function Page() {
  const { user, loading, session } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClientComponentClient();
  
  // Check auth state on mount and after auth state changes
  useEffect(() => {
    const checkAndSetView = async () => {
      // Get the latest session directly
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const hash = window.location.hash.slice(1);
      
      console.log('Auth state check:', {
        hasUser: !!user,
        hasSession: !!session,
        hasCurrentSession: !!currentSession,
        userEmail: user?.email || currentSession?.user?.email,
        hash,
        loading
      });
      
      // If still loading, wait
      if (loading) {
        return;
      }
      
      // Check for specific hash routes first
      if (hash && ['dashboard', 'transparency', 'escrow', 'login', 'help'].includes(hash)) {
        setCurrentView(hash as ViewType);
      } else {
        // Use either context user or direct session check
        if (user || currentSession?.user) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('marketing');
        }
      }
      
      setIsInitialized(true);
    };
    
    checkAndSetView();
  }, [user, session, loading, supabase]);
  
  // Handle hash changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      
      if (hash && ['dashboard', 'transparency', 'escrow', 'login', 'help'].includes(hash)) {
        setCurrentView(hash as ViewType);
      } else if (hash === '') {
        // When hash is removed, check auth to determine view
        if (user) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('marketing');
        }
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, isInitialized]);
  
  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        // User just signed in, show dashboard
        setCurrentView('dashboard');
      } else if (event === 'SIGNED_OUT') {
        // User signed out, show marketing
        setCurrentView('marketing');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Global navigation function
  const navigateTo = (view: string) => {
    setCurrentView(view as ViewType);
    window.history.pushState({}, '', view === 'marketing' ? '/' : `#${view}`);
  };

  // Show loading state only during initial load
  if (!isInitialized || currentView === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#E0E2E7] border-t-[#2962FF] mx-auto"></div>
          <p className="mt-4 text-[#787B86]">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate component based on currentView
  switch (currentView) {
    case 'dashboard':
      // Double-check auth for dashboard (but don't redirect if session exists)
      return <Dashboard onNavigate={navigateTo} />;
      
    case 'transparency':
      return <TransparencyPage onNavigate={navigateTo} />;
      
    case 'marketing':
      return <MarketingPage />;
      
    default:
      return <MarketingPage />;
  }
}