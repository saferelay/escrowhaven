// src/hooks/useWalletBalance.ts - Fixed to read live blockchain balance

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Polygon USDC
const USDC_ABI = ['function balanceOf(address owner) view returns (uint256)'];

export function useWalletBalance() {
  const { user } = usePrivy();
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user?.wallet?.address) {
      console.log('[useWalletBalance] No wallet address available');
      setBalance('0.00');
      return;
    }

    setLoading(true);
    try {
      console.log('[useWalletBalance] Fetching balance for:', user.wallet.address);

      const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com';
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Check RPC is responding
      const network = await provider.getNetwork();
      console.log('[useWalletBalance] Connected to network:', network.chainId, network.name);

      // Create USDC contract instance
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

      // Get balance
      const balanceWei = await usdcContract.balanceOf(user.wallet.address);
      const balanceFormatted = ethers.utils.formatUnits(balanceWei, 6);
      const balanceFixed = parseFloat(balanceFormatted).toFixed(2);

      console.log('[useWalletBalance] Balance:', balanceFixed, 'USDC');
      setBalance(balanceFixed);
    } catch (error) {
      console.error('[useWalletBalance] Error fetching balance:', error);
      setBalance('0.00');
    } finally {
      setLoading(false);
    }
  }, [user?.wallet?.address]);

  // Fetch on mount and when wallet changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Refresh every 10 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBalance();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    balance,
    loading,
    refresh: fetchBalance,
  };
}