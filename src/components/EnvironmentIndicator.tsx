'use client';

import { useEffect, useState } from 'react';
import { getEnvConfig, getEnvironmentInfo } from '@/lib/environment';

export function EnvironmentIndicator() {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [info, setInfo] = useState<any>(null);
  
  useEffect(() => {
    setMounted(true);
    const cfg = getEnvConfig();
    const inf = getEnvironmentInfo();
    setConfig(cfg);
    setInfo(inf);
  }, []);
  
  if (!mounted || !config || !info) return null;
  
  // Don't show in production or staging unless showTestBadges is true
  if (!config.showTestBadges && (config.name === 'production' || config.name === 'staging')) {
    return null;
  }
  
  const barColors = {
    development: 'bg-yellow-500',
    staging: 'bg-purple-500',
    production: 'bg-red-500'
  };
  
  const badgeStyles = {
    development: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    staging: 'bg-purple-100 border-purple-300 text-purple-800',
    production: 'bg-red-100 border-red-300 text-red-800'
  };
  
  return (
    <>
      {/* Thin bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
        <div className={`h-1 ${barColors[config.name] || 'bg-gray-500'}`} />
      </div>
      
      {/* Environment info badge */}
      <div className="fixed bottom-4 left-4 z-[100] pointer-events-none">
        <div className={`border rounded-lg shadow-lg px-3 py-2 ${badgeStyles[config.name] || 'bg-gray-100 border-gray-300 text-gray-800'}`}>
          <div className="text-xs font-semibold uppercase">{config.name}</div>
          <div className="text-[10px] opacity-75">
            {info.network} • {info.usingMockUSDC ? 'Mock USDC' : 'Real USDC'}
          </div>
        </div>
      </div>
    </>
  );
}

// Export a simple test badge for inline use
export function TestModeBadge({ className = '' }: { className?: string }) {
  const [showBadge, setShowBadge] = useState(false);
  
  useEffect(() => {
    const config = getEnvConfig();
    setShowBadge(config.showTestBadges);
  }, []);
  
  if (!showBadge) return null;
  
  return (
    <span className={`text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium ${className}`}>
      TEST
    </span>
  );
}