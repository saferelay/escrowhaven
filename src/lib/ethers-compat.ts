// Compatibility layer for ethers v5
import { ethers } from 'ethers';

// Re-export commonly used items
export const JsonRpcProvider = ethers.providers.JsonRpcProvider;
export const Contract = ethers.Contract;
export const Wallet = ethers.Wallet;
export const Interface = ethers.utils.Interface;

// Re-export utils
export const parseUnits = ethers.utils.parseUnits;
export const formatUnits = ethers.utils.formatUnits;
export const keccak256 = ethers.utils.keccak256;
export const toUtf8Bytes = ethers.utils.toUtf8Bytes;
export const getAddress = ethers.utils.getAddress;
export const concat = ethers.utils.concat;
export const hexlify = ethers.utils.hexlify;
export const isAddress = ethers.utils.isAddress;
export const id = ethers.utils.id;

// Export ethers itself
export { ethers };
export default ethers;