// src/hooks/useVaultSummary.ts
import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export type VaultFolder = 'all' | 'needs' | 'sent' | 'received' | 'active' | 'completed';

interface VaultCounts {
  all: number;
  needs: number;
  sent: number;
  received: number;
  active: number;
  completed: number;
}

interface UseVaultSummaryProps {
  supabase: SupabaseClient | null;
  userEmail: string | null;
  environment: 'production' | 'development';
}

export function useVaultSummary({ supabase, userEmail, environment }: UseVaultSummaryProps) {
  const [counts, setCounts] = useState<VaultCounts>({
    all: 0,
    needs: 0,
    sent: 0,
    received: 0,
    active: 0,
    completed: 0,
  });

  const fetchCounts = useCallback(async () => {
    if (!supabase || !userEmail) {
      console.warn('Skipping fetchCounts: supabase or userEmail missing');
      return;
    }
    
    try {
      console.log('Fetching folder counts for:', userEmail, 'env:', environment);
      const { data, error } = await supabase
        .rpc('get_folder_counts_cached', {
          user_email: userEmail,
          env: environment
        });
      
      if (error) {
        console.error('Error fetching folder counts:', error?.message || error?.code || 'Unknown error');
        setCounts({
          all: 0,
          needs: 0,
          sent: 0,
          received: 0,
          active: 0,
          completed: 0,
        });
        return;
      }
      
      if (data && data.length > 0) {
        const result = data[0];
        console.log('Folder counts response:', result);
        setCounts({
          all: Number(result.all_count || 0),
          needs: Number(result.needs_count || 0),
          sent: Number(result.sent_count || 0),
          received: Number(result.received_count || 0),
          active: Number(result.active_count || 0),
          completed: Number(result.completed_count || 0),
        });
      } else {
        console.warn('No data returned from get_folder_counts_cached');
      }
    } catch (err: any) {
      console.error('Error in fetchCounts:', err?.message || err);
      setCounts({
        all: 0,
        needs: 0,
        sent: 0,
        received: 0,
        active: 0,
        completed: 0,
      });
    }
  }, [supabase, userEmail, environment]);

  // Fetch whenever userEmail becomes available
  useEffect(() => {
    if (!userEmail) {
      console.debug('Waiting for userEmail...');
      return;
    }
    fetchCounts();
  }, [userEmail, fetchCounts]); // ✅ Added userEmail to deps

  return {
    counts,
    refresh: fetchCounts,
  };
}