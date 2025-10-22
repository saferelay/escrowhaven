// src/hooks/useWalletBalance.ts
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

export function useWalletBalance() {
  const { user, authenticated } = usePrivy();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated || !user?.wallet?.address) {
      setBalance('0');
      setLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          'https://polygon-rpc.com'
        );
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const balance = await usdcContract.balanceOf(user.wallet.address);
        const formatted = ethers.utils.formatUnits(balance, 6);
        setBalance(parseFloat(formatted).toFixed(2));
      } catch (error) {
        console.error('Balance fetch failed:', error);
        setBalance('0');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [authenticated, user?.wallet?.address]);

  return { balance, loading };
}