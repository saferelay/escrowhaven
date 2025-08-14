import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useEscrowData(id: string) {
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Single table query - so simple!
        const { data, error } = await supabase
          .from('escrows')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Ensure escrow_id is set for compatibility
          setEscrow({
            ...data,
            escrow_id: data.escrow_id || data.id
          });
        } else {
          setError('Escrow not found');
        }
      } catch (err) {
        setError('Failed to fetch escrow data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscription - single table!
    const channel = supabase
      .channel(`escrow-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'escrows',
        filter: `id=eq.${id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { escrow, loading, error };
}
