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
    if (!supabase || !userEmail) return;
    
    try {
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
        const counts = data[0];
        setCounts({
          all: Number(counts.all_count || 0),
          needs: Number(counts.needs_count || 0),
          sent: Number(counts.sent_count || 0),
          received: Number(counts.received_count || 0),
          active: Number(counts.active_count || 0),
          completed: Number(counts.completed_count || 0),
        });
      }
    } catch (err: any) {
      console.error('Error in fetchCounts:', err?.message || 'Failed to fetch folder counts');
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

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    refresh: fetchCounts,
  };
}