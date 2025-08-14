'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardSidebar({ userEmail }: { userEmail: string }) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [hasWallet, setHasWallet] = useState(false);
  
  useEffect(() => {
    checkUserWallet();
  }, [userEmail]);
  
  const checkUserWallet = async () => {
    const { data } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', userEmail)
      .single();
      
    setHasWallet(!!data?.wallet_address);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold text-gray-900">SafeRelay</span>
        </Link>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600 truncate">{userEmail}</div>
        <div className="mt-2">
          {hasWallet ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              ✓ Magic Wallet Connected
            </span>
          ) : (
            <button
              onClick={() => router.push('/connect-wallet')}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium hover:bg-red-200 transition-colors cursor-pointer"
            >
              🔗 Connect Magic Wallet
            </button>
          )}
        </div>
      </div>

      <nav className="space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
          <span>📊</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/new" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
          <span>➕</span>
          <span>New Escrow</span>
        </Link>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 opacity-50 cursor-not-allowed">
          <span>📝</span>
          <span>Templates</span>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-auto">Soon</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 opacity-50 cursor-not-allowed">
          <span>👥</span>
          <span>Contacts</span>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-auto">Soon</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
          <span>⚙️</span>
          <span>Settings</span>
        </a>
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}