// src/components/marketing/sections/Transparency.tsx
'use client';

import { useState, useEffect } from 'react';

export function Transparency() {
  const [recentEscrows, setRecentEscrows] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProtected: 0,
    activeEscrows: 0,
    avgCompletionTime: "0hr"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats from the public stats endpoint
        const statsResponse = await fetch('/api/public/stats');
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats({
            totalProtected: data.totalVolume || 0,
            activeEscrows: data.activeEscrows || 0,
            avgCompletionTime: data.averageEscrowSize ? "24hr" : "24hr" // Calculate from your data
          });
        }

        // Fetch recent escrows from the public endpoint
        const recentResponse = await fetch('/api/public/recent-escrows');
        if (recentResponse.ok) {
          const data = await recentResponse.json();
          if (Array.isArray(data)) {
            setRecentEscrows(data.slice(0, 5).map(escrow => ({
              id: escrow.id,
              amount_cents: escrow.amount * 100, // Convert to cents if needed
              amount: escrow.amount,
              status: escrow.status,
              created_at: escrow.created,
              network: escrow.network || 'polygon',
              is_test_mode: escrow.network === 'polygon-amoy',
              fullAddress: escrow.fullAddress
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching transparency data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-[#000000] mb-4">
            Real-time transparency
          </h2>
          <p className="text-lg text-[#787B86] max-w-2xl mx-auto">
            Every transaction protected. Every payment secured. Live stats you can trust.
          </p>
        </div>

        {/* Live Stats Grid - Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-[#E0E2E7] p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#26A69A] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#787B86] uppercase">Total Protected</span>
            </div>
            <p className="text-2xl font-normal text-[#000000]">
              {loading ? (
                <span className="inline-block h-7 w-20 bg-[#F8F9FD] rounded animate-pulse"></span>
              ) : (
                `${stats.totalProtected >= 1000000 
                  ? (stats.totalProtected / 1000000).toFixed(1) + 'M'
                  : stats.totalProtected >= 1000 
                  ? (stats.totalProtected / 1000).toFixed(1) + 'K'
                  : stats.totalProtected.toFixed(0)}`
              )}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E0E2E7] p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#2962FF] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#787B86] uppercase">Active Now</span>
            </div>
            <p className="text-2xl font-normal text-[#000000]">
              {loading ? (
                <span className="inline-block h-7 w-16 bg-[#F8F9FD] rounded animate-pulse"></span>
              ) : (
                stats.activeEscrows
              )}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E0E2E7] p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#787B86] rounded-full"></div>
              <span className="text-xs text-[#787B86] uppercase">Avg Time</span>
            </div>
            <p className="text-2xl font-normal text-[#000000]">
              {loading ? (
                <span className="inline-block h-7 w-14 bg-[#F8F9FD] rounded animate-pulse"></span>
              ) : (
                stats.avgCompletionTime
              )}
            </p>
          </div>
        </div>

        {/* Recent Activity Feed - Dashboard Table Style */}
        <div className="bg-white rounded-xl border border-[#E0E2E7] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E0E2E7] bg-[#F8F9FD]">
            <h3 className="text-sm font-medium text-[#000000]">Live Activity</h3>
          </div>
          
          <div className="divide-y divide-[#E0E2E7]">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#E0E2E7] animate-pulse"></div>
                    <div>
                      <div className="h-4 w-32 bg-[#F8F9FD] rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-24 bg-[#F8F9FD] rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentEscrows.length > 0 ? (
              recentEscrows.map((escrow, idx) => (
                <div key={escrow.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FD] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      escrow.status === 'FUNDED' ? 'bg-[#2962FF]' :
                      escrow.status === 'RELEASED' || escrow.status === 'COMPLETED' ? 'bg-[#26A69A]' :
                      escrow.status === 'SETTLED' ? 'bg-[#26A69A]' :
                      escrow.status === 'REFUNDED' ? 'bg-[#F7931A]' :
                      escrow.status === 'ACCEPTED' ? 'bg-[#787B86]' :
                      'bg-[#E0E2E7]'
                    }`}></div>
                    <div>
                      <p className="text-sm text-[#000000]">
                        ${((escrow.amount_cents || escrow.amount * 100 || 0) / 100).toFixed(2)} 
                        <span className="text-[#787B86] ml-2">
                          {escrow.status?.toLowerCase() || 'pending'}
                        </span>
                      </p>
                      <p className="text-xs text-[#787B86]">
                        {escrow.created_at || escrow.created
                          ? new Date(escrow.created_at || escrow.created).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })
                          : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {escrow.fullAddress && (
                      <a 
                        href={`${escrow.network === 'polygon-amoy' ? 'https://amoy.polygonscan.com' : 'https://polygonscan.com'}/address/${escrow.fullAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2962FF] hover:underline"
                      >
                        View →
                      </a>
                    )}
                    {!escrow.fullAddress && (
                      <p className="text-xs text-[#787B86]">
                        {escrow.network === 'polygon' ? 'Polygon' : 
                         escrow.network === 'polygon-amoy' ? 'Testnet' :
                         escrow.is_test_mode ? 'Test' : 'Live'}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // No data state
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-[#787B86]">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8F9FD] rounded-lg border border-[#E0E2E7]">
            <svg className="w-4 h-4 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-[#787B86]">All Vaults secured by smart contracts</span>
          </div>
        </div>
      </div>
    </section>
  );
}