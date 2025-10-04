// src/lib/onramp.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

export interface OnrampConfig {
  email: string;
  targetUsdcAmount: number;       // in USDC (e.g., 125.50)
  escrowId: string;
  factoryAddress: string;         // your EscrowHavenFactory
  clientAddress: string;          // payer wallet
  freelancerAddress: string;      // recipient wallet
  salt: string;                   // bytes32 string (0x...)
  isTestMode: boolean;
  chainCode?: 'polygon' | 'polygon-amoy' | 'base';
}

export interface OnrampDirectConfig {
  email: string;
  targetUsdcAmount: number;       // e.g., 125.50
  escrowId: string;
  vaultAddress: string;           // PRECOMPUTED CREATE2 address
  isTestMode: boolean;
}

/** Generate calldata for EscrowHavenFactory.deployVault(bytes32,address,address,uint256) */
export function generateCalldata(
  salt: string,
  clientAddress: string,
  freelancerAddress: string,
  usdcAmount: number
): string {
  const iface = new ethers.utils.Interface([
    'function deployVault(bytes32,address,address,uint256) returns (address,address)'
  ]);

  // Avoid float drift: format the decimal amount as a string with up to 6 dp
  const amountStr = usdcAmount.toFixed(6);
  const amount = ethers.utils.parseUnits(amountStr, 6);

  return iface.encodeFunctionData('deployVault', [
    salt,
    clientAddress,
    freelancerAddress,
    amount
  ]);
}

/** Deterministic salt (store once, then reuse). */
export function generateSalt(escrowId: string, timestamp?: number): string {
  const fixedTimestamp = timestamp ?? Date.now();
  return ethers.utils.id(`${escrowId}-${fixedTimestamp}`); // 0x… bytes32
}

/** Get or create a stable salt (handles concurrent calls more safely). */
export async function getOrCreateSalt(
  escrowId: string,
  supabase: SupabaseClient
): Promise<{ salt: string; isNew: boolean }> {
  // 1) Try read - using 'salt' column
  const { data: existing, error: readErr } = await supabase
    .from('escrows')
    .select('salt')
    .eq('id', escrowId)
    .single();

  if (existing?.salt) {
    return { salt: existing.salt, isNew: false };
  }

  // 2) Generate candidate
  const newSalt = generateSalt(escrowId);

  // 3) Try to persist (guard so we don't clobber existing salt)
  const { error: writeErr } = await supabase
    .from('escrows')
    .update({ salt: newSalt })
    .eq('id', escrowId)
    .is('salt', null);

  // 4) Read-back in case of race
  const { data: after } = await supabase
    .from('escrows')
    .select('salt')
    .eq('id', escrowId)
    .single();

  if (after?.salt) {
    const isNew = after.salt.toLowerCase() === newSalt.toLowerCase();
    return { salt: after.salt, isNew };
  }

  throw new Error('Failed to create or fetch salt');
}

/**
 * Build the Onramp.money widget URL for contract-call flow.
 * NOTE:
 * - `walletAddress` = your factory (the "to" contract)
 * - `calldata` = encoded deployVault(...) call
 * - Colors must be hex without '#'
 */
export function createOnrampWidget(config: OnrampConfig): string {
  const baseUrl = config.isTestMode
    ? 'https://sandbox.onramp.money/app/'
    : 'https://onramp.money/app/';

  const appId = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || '1687307';

  const calldata = generateCalldata(
    config.salt,
    config.clientAddress,
    config.freelancerAddress,
    config.targetUsdcAmount
  );

  const params = new URLSearchParams({
    appId,
    walletAddress: config.factoryAddress,
    coinCode: 'USDC',
    coinAmount: config.targetUsdcAmount.toFixed(6),
    isAmountEditable: 'false',
    isFiatCurrencyEditable: 'true',
    isCoinCodeEditable: 'false',
    calldata,
    userEmail: config.email,
    partnerOrderId: config.escrowId,
    primaryColor: '2563EB',
    secondaryColor: '1d4ed8',
    isDarkMode: 'false'
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Build the Onramp.money widget URL to fund a specific wallet (the CREATE2 vault address).
 * This is the direct-deposit flow (no calldata / no factory call).
 */
export function createOnrampDirectWidget(config: OnrampDirectConfig): string {
  const baseUrl = config.isTestMode
    ? 'https://sandbox.onramp.money/app/'
    : 'https://onramp.money/app/';

  const appId = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || '1687307';

  const params = new URLSearchParams({
    appId,
    // IMPORTANT: onramp sends USDC to this address directly
    walletAddress: config.vaultAddress,
    coinCode: 'USDC',
    coinAmount: config.targetUsdcAmount.toFixed(6),
    // lock the amount & token for UX clarity
    isAmountEditable: 'false',
    isFiatCurrencyEditable: 'true',
    isCoinCodeEditable: 'false',
    // user / order info
    userEmail: config.email,
    partnerOrderId: config.escrowId,
    // theming (hex without '#')
    primaryColor: '2563EB',
    secondaryColor: '1d4ed8',
    isDarkMode: 'false'
  });

  return `${baseUrl}?${params.toString()}`;
}