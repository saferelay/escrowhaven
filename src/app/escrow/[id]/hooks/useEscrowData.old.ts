import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EscrowData {
  // Combined data from pending_escrows and escrows tables
  id: string;
  amount_cents: number;
  client_email: string;
  freelancer_email: string;
  initiator_email?: string;
  initiator_role?: 'payer' | 'recipient';
  status: 'INITIATED' | 'ACCEPTED' | 'DECLINED' | 'FUNDED' | 'RELEASED';
  recipient_wallet_address?: string;
  recipient_transak_user_id?: string;
  escrow_id?: string;
  vault_address?: string;
  splitter_address?: string;
  funding_tx_hash?: string;
  release_tx_hash?: string;
  client_approved?: boolean;
  freelancer_approved?: boolean;
  funded_at?: string;
  released_at?: string;
}

export function useEscrowData(id: string) {
  const [escrow, setEscrow] = useState<EscrowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // First check pending_escrows
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_escrows')
          .select('*')
          .eq('id', id)
          .single();

        if (pendingData) {
          // If there's an escrow_id, fetch main escrow data
          if (pendingData.escrow_id) {
            const { data: escrowData } = await supabase
              .from('escrows')
              .select('*')
              .eq('id', pendingData.escrow_id)
              .single();

            setEscrow({
              ...pendingData,
              vault_address: escrowData?.vault_address,
              splitter_address: escrowData?.splitter_address,
              funding_tx_hash: escrowData?.funding_tx_hash,
              release_tx_hash: escrowData?.release_tx_hash,
              client_approved: escrowData?.client_approved,
              freelancer_approved: escrowData?.freelancer_approved,
              funded_at: escrowData?.funded_at,
              released_at: escrowData?.released_at,
              status: escrowData?.status === 'RELEASED' ? 'RELEASED' : 
                      escrowData?.status === 'FUNDED' ? 'FUNDED' : 
                      pendingData.status
            });
          } else {
            setEscrow(pendingData);
          }
        } else {
          // Try main escrows table
          const { data: escrowData } = await supabase
            .from('escrows')
            .select('*')
            .eq('id', id)
            .single();

          if (escrowData) {
            setEscrow({
              id: escrowData.id,
              amount_cents: escrowData.amount_cents,
              client_email: escrowData.client_email || escrowData.payer_email,
              freelancer_email: escrowData.freelancer_email || escrowData.recipient_email,
              status: escrowData.status === 'RELEASED' ? 'RELEASED' : 'FUNDED',
              vault_address: escrowData.vault_address,
              splitter_address: escrowData.splitter_address,
              funding_tx_hash: escrowData.funding_tx_hash,
              release_tx_hash: escrowData.release_tx_hash,
              client_approved: escrowData.client_approved,
              freelancer_approved: escrowData.freelancer_approved,
              funded_at: escrowData.funded_at,
              released_at: escrowData.released_at
            });
          } else {
            setError('Escrow not found');
          }
        }
      } catch (err) {
        setError('Failed to fetch escrow data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel(`escrow-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pending_escrows',
        filter: `id=eq.${id}`
      }, () => {
        fetchData(); // Refetch on changes
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'escrows',
        filter: `pending_escrow_id=eq.${id}`
      }, () => {
        fetchData(); // Refetch on changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { escrow, loading, error };
}