// src/services/escrow-state-machine.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type EscrowStatus = 
  | 'INITIATED' 
  | 'ACCEPTED' 
  | 'FUNDED' 
  | 'PENDING_RELEASE'
  | 'RELEASED'
  | 'RELEASE_FAILED'
  | 'DECLINED'
  | 'REFUNDED';

export class EscrowStateMachine {
  private static validTransitions: Record<EscrowStatus, EscrowStatus[]> = {
    'INITIATED': ['ACCEPTED', 'DECLINED'],
    'ACCEPTED': ['FUNDED', 'DECLINED'],
    'FUNDED': ['PENDING_RELEASE', 'REFUNDED'],
    'PENDING_RELEASE': ['RELEASED', 'RELEASE_FAILED'],
    'RELEASE_FAILED': ['PENDING_RELEASE', 'FUNDED'],
    'RELEASED': [],
    'DECLINED': [],
    'REFUNDED': []
  };

  static async transition(
    escrowId: string, 
    newStatus: EscrowStatus,
    metadata?: any
  ): Promise<void> {
    // Get current status
    const { data: escrow } = await supabase
      .from('escrows')
      .select('status')
      .eq('id', escrowId)
      .single();
    
    if (!escrow) {
      throw new Error('Escrow not found');
    }
    
    const currentStatus = escrow.status as EscrowStatus;
    
    // Check if transition is valid
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid transition: ${currentStatus} -> ${newStatus}`
      );
    }
    
    // Log the transition
    await supabase
      .from('escrow_status_history')
      .insert({
        escrow_id: escrowId,
        from_status: currentStatus,
        to_status: newStatus,
        metadata,
        created_at: new Date().toISOString()
      });
    
    // Update escrow
    await supabase
      .from('escrows')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', escrowId);
  }
}