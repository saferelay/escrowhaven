// src/lib/magic.ts
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';

let magic: Magic | null = null;

// Initialize Magic instance
if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
  
  if (key && !key.includes('YOUR_MAGIC_KEY')) {
    magic = new Magic(key, {
      network: 'mainnet' // or your preferred network
    });
  }
}

export async function connectMagicWallet(email: string): Promise<{ wallet: string; issuer: string }> {
  if (!magic) {
    // Use mock if no Magic instance
    console.log('Using mock wallet - no Magic instance');
    const { connectMagicWallet: mockConnect } = await import('./magic-mock');
    return mockConnect(email);
  }

  try {
    // Check if already logged in
    const isLoggedIn = await magic.user.isLoggedIn();
    
    if (isLoggedIn) {
      // Get current user info
      const userInfo = await magic.user.getInfo();
      console.log('Currently logged in as:', userInfo.email);
      
      // IMPORTANT: Only logout if switching to a DIFFERENT email
      if (userInfo.email && userInfo.email.toLowerCase() === email.toLowerCase()) {
        // Same user - return existing wallet (THIS IS THE FIX!)
        console.log('Same user, returning existing wallet:', userInfo.publicAddress);
        return {
          wallet: userInfo.publicAddress!,
          issuer: userInfo.issuer || email
        };
      } else {
        // Different user - logout and login with new email
        console.log('Different user, logging out and switching to:', email);
        await magic.user.logout();
      }
    }
    
    // Login with the email - this will create/retrieve their unique wallet
    console.log('Logging in with Magic for:', email);
    await magic.auth.loginWithMagicLink({ 
      email,
      showUI: true 
    });
    console.log('Magic login successful');
    
    // Get user info - this will be unique to this email
    const userInfo = await magic.user.getInfo();
    console.log('User info:', userInfo);
    
    // Magic generates a unique wallet for each email
    const wallet = userInfo.publicAddress;
    
    if (!wallet) {
      throw new Error('No wallet address found');
    }
    
    // Verify this wallet is unique to this email
    console.log(`Wallet for ${email}: ${wallet}`);
    
    return {
      wallet: wallet,
      issuer: userInfo.issuer || email
    };
  } catch (error) {
    console.error('Magic wallet connection error:', error);
    throw error;
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