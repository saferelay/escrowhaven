import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function ensureUserHasWallet(email: string): Promise<string | null> {
  try {
    // Check if user already has a wallet
    const { data: existingWallet } = await supabase
      .from('user_wallets')
      .select('wallet_address')
      .eq('email', email.toLowerCase())
      .single();

    if (existingWallet?.wallet_address) {
      return existingWallet.wallet_address;
    }

    // Generate a deterministic wallet address for the user
    // This is just for SafeRelay internal use - not a real wallet
    const walletSeed = `saferelay-${email.toLowerCase()}-${Date.now()}`;
    const wallet = ethers.Wallet.createRandom();
    
    // Save to database
    const { data: newWallet, error } = await supabase
      .from('user_wallets')
      .insert({
        email: email.toLowerCase(),
        wallet_address: wallet.address,
        provider: 'saferelay-auto',
        created_at: new Date().toISOString()
      })
      .select('wallet_address')
      .single();

    if (error) {
      console.error('Failed to create wallet:', error);
      return null;
    }

    return newWallet.wallet_address;
  } catch (error) {
    console.error('Error ensuring wallet:', error);
    return null;
  }
}
