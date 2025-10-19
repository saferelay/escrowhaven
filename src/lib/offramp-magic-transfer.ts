import { getMagicInstance } from './magic';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function transferUSDCForOfframp(
  recipientAddress: string,
  usdcAmount: number,
  magicInstance?: any,  // Accept Magic instance as optional parameter
  userEmail?: string     // Add email parameter for re-authentication if needed
): Promise<TransferResult> {
  try {
    console.log('🔄 transferUSDCForOfframp called');
    console.log('Recipient:', recipientAddress);
    console.log('Amount:', usdcAmount);
    
    // Use passed instance first, then try global window, then getMagicInstance
    let magic = magicInstance;
    
    if (!magic && typeof window !== 'undefined') {
      magic = (window as any).escrowhavenMagic;
    }
    
    if (!magic) {
      console.log('Magic not found on window, using getMagicInstance()');
      magic = getMagicInstance();
    }
    
    if (!magic) {
      throw new Error('Magic wallet not initialized');
    }
    
    console.log('✅ Magic instance obtained');
    
    // CRITICAL FIX: Check if Magic session is active and re-authenticate if needed
    try {
      const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
      const signer = provider.getSigner();
      
      // Try to get address - this will fail if not authenticated
      const userAddress = await signer.getAddress();
      console.log('✅ Active Magic session found, user address:', userAddress);
      
    } catch (error: any) {
      console.log('⚠️ No active Magic session, need to authenticate...');
      
      // If we have user email, trigger re-authentication
      if (userEmail) {
        console.log('🔐 Requesting Magic authentication for:', userEmail);
        alert('Please check your email to confirm this transaction with Magic.link');
        
        await magic.auth.loginWithMagicLink({ 
          email: userEmail,
          showUI: true 
        });
        
        console.log('✅ Magic authentication completed');
      } else {
        throw new Error('Your session has expired. Please refresh the page and try again.');
      }
    }
    
    // Now proceed with the transfer
    const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log('✅ User address:', userAddress);
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);

    const balance = await usdcContract.balanceOf(userAddress);
    const decimals = await usdcContract.decimals();
    const amountWei = ethers.utils.parseUnits(usdcAmount.toString(), decimals);

    console.log('Balance check:', {
      balance: ethers.utils.formatUnits(balance, decimals),
      required: usdcAmount,
      hasEnough: balance.gte(amountWei)
    });

    if (balance.lt(amountWei)) {
      throw new Error(`Insufficient USDC balance. You have ${ethers.utils.formatUnits(balance, decimals)} USDC but need ${usdcAmount} USDC`);
    }

    console.log('💸 Transferring USDC to:', recipientAddress);
    console.log('Amount:', ethers.utils.formatUnits(amountWei, decimals), 'USDC');
    
    const tx = await usdcContract.transfer(recipientAddress, amountWei);
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait(1);
    console.log('✅ Transaction confirmed:', receipt.transactionHash);

    return { success: true, txHash: receipt.transactionHash };
  } catch (error: any) {
    console.error('❌ USDC transfer failed:', error);
    return { success: false, error: error.message || 'Transfer failed' };
  }
}