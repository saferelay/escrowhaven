import { useEffect, useState } from 'react';
import { config } from '@/lib/config';

export function useV2Monitoring(escrow: any) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  useEffect(() => {
    // Only monitor V2 contracts that aren't funded yet
    if (!escrow || escrow.contract_version !== 'v2') return;
    if (!escrow.vault_address || ['FUNDED', 'RELEASED', 'REFUNDED'].includes(escrow.status)) return;
    
    // In production with TransakOne, rely on webhooks
    if (!config.isTestMode && escrow.funding_method === 'transak') {
      console.log('Production mode - waiting for TransakOne webhook');
      return;
    }
    
    // In test mode or manual funding, actively monitor
    const monitorFunding = async () => {
      if (isMonitoring) return;
      
      setIsMonitoring(true);
      try {
        const response = await fetch('/api/escrow/monitor-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escrowId: escrow.id })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('V2 Monitor result:', result);
          
          if (result.funded) {
            // The Supabase subscription will auto-refresh the page
            console.log('✅ Escrow funded via', result.mode, 'mode');
          }
        }
      } catch (error) {
        console.error('V2 monitoring error:', error);
      } finally {
        setIsMonitoring(false);
      }
    };
    
    // Initial check
    monitorFunding();
    
    // For test mode, check every 10 seconds
    let interval: NodeJS.Timeout;
    if (config.isTestMode) {
      interval = setInterval(monitorFunding, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [escrow, isMonitoring]);
  
  return { isMonitoring };
}