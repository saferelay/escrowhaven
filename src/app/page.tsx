'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TransparencyPage } from '@/components/transparency/TransparencyPage';
import MarketingPage from '@/components/marketing/MarketingPage';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type ViewType = 'marketing' | 'dashboard' | 'transparency' | 'escrow' | 'login' | 'help';

export default function Page() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('marketing');
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const checkAuthAndSetView = async () => {
      const hash = window.location.hash.slice(1);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (hash && ['dashboard', 'transparency', 'login', 'help'].includes(hash)) {
        setCurrentView(hash as ViewType);
      } else if (session || user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('marketing');
      }
    };
    
    if (!loading) {
      checkAuthAndSetView();
    }
  }, [user, loading, supabase]);

  const navigateTo = (view: string) => {
    setCurrentView(view as ViewType);
    window.history.pushState({}, '', view === 'marketing' ? '/' : `#${view}`);
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
