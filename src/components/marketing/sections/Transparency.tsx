// src/components/marketing/sections/Transparency.tsx
'use client';

import { useState, useEffect } from 'react';

export function Transparency() {
  const [recentEscrows, setRecentEscrows] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalEscrows: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [escrowsRes, statsRes] = await Promise.all([
          fetch('/api/public/recent-escrows'),
          fetch('/api/public/stats')
        ]);
        
        if (escrowsRes.ok) {
          const escrowsData = await escrowsRes.json();
          setRecentEscrows(escrowsData.slice(0, 5));
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch transparency data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: any) => {
    // Check if amount is undefined, null, or NaN
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0';
    }
    
    // If amount is already in dollars (not cents), use it directly
    // Otherwise divide by 100 for cents to dollars conversion
    const dollarAmount = amount > 1000 ? amount / 100 : amount;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(dollarAmount);
  };

  const getRelativeTime = (date: string) => {
    if (!date) return 'recently';
    
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="py-24 bg-white border-t border-[#E0E2E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-black mb-6">
            Every payment, on-chain
          </h2>
          <p className="text-xl text-[#787B86] max-w-3xl mx-auto">
            All escrows are recorded on the blockchain. Complete transparency, always.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="bg-white border border-[#E0E2E7] rounded-xl p-6 text-center">
            <div className="text-3xl font-normal text-black mb-2">
              ${loading ? '---' : (stats.totalVolume / 100 || 0).toLocaleString()}
            </div>
            <p className="text-sm text-[#787B86]">Total Volume</p>
          </div>
          <div className="bg-white border border-[#E0E2E7] rounded-xl p-6 text-center">
            <div className="text-3xl font-normal text-black mb-2">
              {loading ? '---' : (stats.totalEscrows || 0).toLocaleString()}
            </div>
            <p className="text-sm text-[#787B86]">Escrows Completed</p>
          </div>
          <div className="bg-white border border-[#E0E2E7] rounded-xl p-6 text-center">
            <div className="text-3xl font-normal text-black mb-2">
              {loading ? '---' : `${stats.successRate || 0}%`}
            </div>
            <p className="text-sm text-[#787B86]">Success Rate</p>
          </div>
        </div>

        {/* Live Activity */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-black">Recent Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#26A69A] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#787B86]">Live</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E0E2E7] overflow-hidden">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#E0E2E7] border-t-[#2962FF]"></div>
                <p className="text-sm text-[#787B86] mt-4">Loading activity...</p>
              </div>
            ) : recentEscrows.length > 0 ? (
              <div>
                <div className="px-6 py-3 bg-[#F8F9FD] border-b border-[#E0E2E7]">
                  <div className="grid grid-cols-12 gap-4 text-xs text-[#787B86] font-medium">
                    <div className="col-span-2">ID</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-right">Time</div>
                  </div>
                </div>
                <div className="divide-y divide-[#E0E2E7]">
                  {recentEscrows.map((escrow, index) => {
                    // Try different property names for amount
                    const amount = escrow.amount_cents || escrow.amount || escrow.value || 0;
                    
                    return (
                      <div key={escrow.id || index} className="px-6 py-4 hover:bg-[#F8F9FD] transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-2">
                            <span className="text-xs text-[#787B86] font-mono">
                              {escrow.id?.substring(0, 8) || `ESC-${1000 + index}`}
                            </span>
                          </div>
                          <div className="col-span-5">
                            <span className="text-sm text-black truncate block">
                              {escrow.description || 'Freelance Project'}
                            </span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-sm font-medium text-black">
                              {formatAmount(amount)}
                            </span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className={`inline-flex text-xs px-2 py-1 rounded-full ${
                              escrow.status === 'RELEASED' || escrow.status === 'COMPLETED' 
                                ? 'bg-[#26A69A]/10 text-[#26A69A]' :
                              escrow.status === 'FUNDED' 
                                ? 'bg-[#2962FF]/10 text-[#2962FF]' :
                              'bg-[#787B86]/10 text-[#787B86]'
                            }`}>
                              {escrow.status?.toLowerCase() || 'pending'}
                            </span>
                          </div>
                          <div className="col-span-1 text-right">
                            <span className="text-xs text-[#787B86]">
                              {getRelativeTime(escrow.created_at || escrow.updated_at || escrow.created)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-[#F8F9FD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-[#787B86]">📊</span>
                </div>
                <p className="text-[#787B86]">No escrows yet</p>
                <p className="text-sm text-[#787B86] mt-2">Be the first to use escrowhaven</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-6">
            <a href="/transparency" className="text-sm text-[#2962FF] hover:text-[#1E53E5]">
              View full transparency dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}