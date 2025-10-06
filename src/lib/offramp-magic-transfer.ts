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
  usdcAmount: number
): Promise<TransferResult> {
  try {
    const magic = getMagicInstance();
    if (!magic) throw new Error('Magic wallet not initialized');

    const isLoggedIn = await magic.user.isLoggedIn();
    if (!isLoggedIn) throw new Error('User not logged in');

    const provider = new ethers.providers.Web3Provider(magic.rpcProvider as any);
    const signer = provider.getSigner();
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);

    const balance = await usdcContract.balanceOf(await signer.getAddress());
    const decimals = await usdcContract.decimals();
    const amountWei = ethers.utils.parseUnits(usdcAmount.toString(), decimals);

    if (balance.lt(amountWei)) {
      throw new Error(`Insufficient USDC balance`);
    }

    console.log('Transferring USDC to:', recipientAddress);
    const tx = await usdcContract.transfer(recipientAddress, amountWei);
    const receipt = await tx.wait(1);

    return { success: true, txHash: receipt.transactionHash };
  } catch (error: any) {
    console.error('USDC transfer failed:', error);
    return { success: false, error: error.message || 'Transfer failed' };
  }
}