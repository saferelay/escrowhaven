import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'payer' | 'recipient' | 'observer';

export function useUserRole(escrow: any): {
  role: UserRole;
  isPayer: boolean;
  isRecipient: boolean;
  isInitiator: boolean;
  isParticipant: boolean;
} {
  const { user } = useAuth();
  
  if (!user || !escrow) {
    return {
      role: 'observer',
      isPayer: false,
      isRecipient: false,
      isInitiator: false,
      isParticipant: false
    };
  }
  
  const userEmail = user.email?.toLowerCase().trim();
  const clientEmail = escrow.client_email?.toLowerCase().trim();
  const freelancerEmail = escrow.freelancer_email?.toLowerCase().trim();
  const initiatorEmail = escrow.initiator_email?.toLowerCase().trim();
  
  const isPayer = userEmail === clientEmail;
  const isRecipient = userEmail === freelancerEmail;
  const isInitiator = userEmail === initiatorEmail;
  const isParticipant = isPayer || isRecipient;
  
  let role: UserRole = 'observer';
  if (isPayer) role = 'payer';
  else if (isRecipient) role = 'recipient';
  
  return {
    role,
    isPayer,
    isRecipient,
    isInitiator,
    isParticipant
  };
}