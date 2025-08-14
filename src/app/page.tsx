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
  const [hasPartnerAccess, setHasPartnerAccess] = useState(false);
  const supabase = createClientComponentClient();
  
  // Check for partner access FIRST
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const access = params.get('access');
    const preview = params.get('preview');
    
    if (ref === 'transak' || access === 'partner' || preview === 'true') {
      setHasPartnerAccess(true);
      sessionStorage.setItem('partner_access', 'true');
    } else if (sessionStorage.getItem('partner_access') === 'true') {
      setHasPartnerAccess(true);
    }
  }, []);
  
  // Set view to marketing immediately if not loading
  useEffect(() => {
    if (!loading) {
      setCurrentView('marketing');
      setIsInitialized(true);
    }
  }, [loading]);

  // Show loading state
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

  // COMING SOON PAGE - Show this for regular visitors
  if (!hasPartnerAccess && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-3xl">E</span>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              EscrowHaven
            </h1>
          </div>
          
          <p className="text-2xl text-gray-700 mb-8 font-light">
            Secure escrow payments for the modern web
          </p>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-8">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                LAUNCHING Q1 2025
              </span>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're building the future of secure online payments. 
              Lock funds in escrow until both parties agree. 
              No chargebacks. No delays. Just trust.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t border-gray-100">
              <div>
                <div className="text-3xl font-bold text-blue-600">1.99%</div>
                <div className="text-sm text-gray-500">Flat fee</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">150+</div>
                <div className="text-sm text-gray-500">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">Instant</div>
                <div className="text-sm text-gray-500">Payouts</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <a 
                href="mailto:hello@escrowhaven.io" 
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Early Access
              </a>
              <p className="text-xs text-gray-400">
                Join the waitlist for exclusive early access
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Powered by smart contracts on Polygon blockchain
          </div>
        </div>
      </div>
    );
  }

  // Show marketing page for partners/logged in users
  return <MarketingPage />;
}
