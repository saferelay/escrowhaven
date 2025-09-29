// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TransparencyPage } from '@/components/transparency/TransparencyPage';
import MarketingPage from '@/components/marketing/MarketingPage';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

type ViewType = 'marketing' | 'dashboard' | 'transparency' | 'escrow' | 'login' | 'help';

export default function Page() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('marketing');
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  useEffect(() => {
    const checkAuthAndSetView = async () => {
      const hash = window.location.hash.slice(1);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Track page view with query params for Vercel Analytics
      const isAuthenticated = !!(session || user);
      const viewType = isAuthenticated ? 'dashboard' : 'landing';
      
      // Add tracking query param without affecting routing
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      
      if (!currentSearch.includes('view=')) {
        const newUrl = `${currentPath}?view=${viewType}${hash ? `#${hash}` : ''}`;
        router.replace(newUrl, { scroll: false });
      }
      
      // Set the actual view
      if (hash && ['dashboard', 'transparency', 'login', 'help'].includes(hash)) {
        setCurrentView(hash as ViewType);
      } else if (isAuthenticated) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('marketing');
      }
    };
    
    if (!loading) {
      checkAuthAndSetView();
    }
  }, [user, loading, supabase, router]);

  const navigateTo = (view: string) => {
    setCurrentView(view as ViewType);
    
    // Maintain the tracking param
    const isAuthenticated = !!user;
    const viewParam = isAuthenticated ? 'dashboard' : 'landing';
    const newUrl = view === 'marketing' 
      ? `/?view=${viewParam}` 
      : `/?view=${viewParam}#${view}`;
    
    window.history.pushState({}, '', newUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  switch (currentView) {
    case 'dashboard':
      return <Dashboard onNavigate={navigateTo} />;
    case 'transparency':
      return <TransparencyPage onNavigate={navigateTo} />;
    case 'marketing':
    default:
      return <MarketingPage />;
  }
}