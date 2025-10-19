import { getMagicInstance } from './magic';
import { ethers } from 'ethers';

// Polygon mainnet USDC
const USDC_ADDRESS_POLYGON = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

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
  amount: number,
  magicInstance?: any,
  userEmail?: string
): Promise<TransferResult> {
  try {
    console.log('🔄 transferUSDCForOfframp called');
    console.log('Recipient:', recipientAddress);
    console.log('Amount:', amount);
    
    // Check if we're in sandbox mode
    const isSandbox = process.env.NEXT_PUBLIC_MOONPAY_MODE !== 'production';
    
    if (isSandbox) {
      console.log('🧪 SANDBOX MODE: Sending test ETH transaction on Sepolia...');
      
      // Get Magic instance
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
      
      const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      console.log('✅ User address:', userAddress);
      
      // Send a small test ETH transaction (0.0001 ETH)
      // In sandbox, MoonPay expects ETH, not USDC
      const testAmount = ethers.utils.parseEther('0.0001'); // Very small amount for testing
      
      console.log(`💸 Sending test transaction: 0.0001 ETH to ${recipientAddress}`);
      
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: testAmount
      });
      
      console.log('Transaction sent:', tx.hash);
      console.log('Waiting for confirmation...');
      
      const receipt = await tx.wait(1);
      console.log('✅ Test transaction confirmed:', receipt.transactionHash);
      
      return { 
        success: true, 
        txHash: receipt.transactionHash 
      };
    }
    
    // PRODUCTION MODE: Real USDC transfer on Polygon
    console.log('🔴 PRODUCTION MODE: Executing real USDC transfer...');
    
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
    
    const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log('✅ User address:', userAddress);
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS_POLYGON, ERC20_ABI, signer);

    const balance = await usdcContract.balanceOf(userAddress);
    const decimals = await usdcContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);

    console.log('Balance check:', {
      balance: ethers.utils.formatUnits(balance, decimals),
      required: amount,
      hasEnough: balance.gte(amountWei)
    });

    if (balance.lt(amountWei)) {
      throw new Error(`Insufficient USDC balance. You have ${ethers.utils.formatUnits(balance, decimals)} USDC but need ${amount} USDC`);
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
    console.error('❌ Transfer failed:', error);
    return { success: false, error: error.message || 'Transfer failed' };
  }
}