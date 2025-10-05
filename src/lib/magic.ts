// src/lib/magic.ts
import { Magic } from 'magic-sdk';

let magic: Magic | null = null;

// Initialize Magic instance
if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
  
  if (!key || key.includes('YOUR_MAGIC_KEY')) {
    console.error('CRITICAL: NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY not configured');
  } else {
    magic = new Magic(key, {
      network: 'mainnet'
    });
  }
}

export async function connectMagicWallet(email: string): Promise<{ wallet: string; issuer: string }> {
  // CRITICAL: No mock fallback - fail fast if Magic not configured
  if (!magic) {
    throw new Error('Magic wallet not configured. Please set NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY');
  }

  try {
    // Check if already logged in
    const isLoggedIn = await magic.user.isLoggedIn();
    
    if (isLoggedIn) {
      const userInfo = await magic.user.getInfo();
      console.log('Currently logged in as:', userInfo.email);
      
      // Same user - return existing wallet
      if (userInfo.email && userInfo.email.toLowerCase() === email.toLowerCase()) {
        console.log('Returning existing wallet:', userInfo.publicAddress);
        return {
          wallet: userInfo.publicAddress!,
          issuer: userInfo.issuer || email
        };
      } else {
        // Different user - logout first
        console.log('Logging out previous user');
        await magic.user.logout();
      }
    }
    
    // Login with Magic Link - this shows popup to user
    console.log('Starting Magic login for:', email);
    await magic.auth.loginWithMagicLink({ 
      email,
      showUI: true 
    });
    
    // Get user info
    const userInfo = await magic.user.getInfo();
    const wallet = userInfo.publicAddress;
    
    if (!wallet) {
      throw new Error('Magic did not return wallet address');
    }
    
    console.log(`Wallet created for ${email}: ${wallet}`);
    
    return {
      wallet: wallet,
      issuer: userInfo.issuer || email
    };
  } catch (error: any) {
    console.error('Magic wallet error:', error);
    throw new Error(`Wallet creation failed: ${error.message || 'Unknown error'}`);
  }
}

export async function disconnectMagic() {
  if (magic && await magic.user.isLoggedIn()) {
    await magic.user.logout();
  }
}

export async function getCurrentMagicUser() {
  if (!magic) return null;
  
  try {
    const isLoggedIn = await magic.user.isLoggedIn();
    if (!isLoggedIn) return null;
    
    return await magic.user.getInfo();
  } catch (error) {
    return null;
  }
}

export function getMagicInstance() {
  return magic;
}