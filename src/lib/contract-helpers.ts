// src/lib/contract-helpers.ts
import { ethers } from 'ethers';
import { getEnvConfig } from './environment';

// Factory ABI
export const FACTORY_V2_ABI = [
  "function createEscrow(string clientEmail, string freelancerEmail, address clientWallet, address freelancerWallet, uint256 amount) returns (address)",
  "function isEscrowValid(address escrow) view returns (bool)",
  "event EscrowCreated(address indexed escrow, address indexed client, address indexed freelancer, address clientWallet, address freelancerWallet, uint256 amount, uint256 timestamp)"
];

// Escrow ABI
export const ESCROW_V2_ABI = [
  // View functions
  "function getStatus() view returns (bool funded, bool clientOk, bool freelancerOk, bool isReleased, bool isRefunded, uint256 balance)",
  "function client() view returns (address)",
  "function freelancer() view returns (address)",
  "function clientWallet() view returns (address)",
  "function freelancerWallet() view returns (address)",
  "function totalAmount() view returns (uint256)",
  "function pendingSettlement() view returns (uint256 clientAmount, uint256 freelancerAmount, address proposedBy, bool clientAccepted, bool freelancerAccepted, bool executed)",
  
  // Action functions
  "function approveAsClient() external",
  "function approveAsFreelancer() external",
  "function proposeSettlement(uint256 freelancerAmount) external",
  "function acceptSettlement() external",
  "function refundToClient() external",
  
  // Events
  "event Funded(uint256 amount)",
  "event ClientApproved()",
  "event FreelancerApproved()",
  "event Released(uint256 freelancerAmount, uint256 platformFee)",
  "event Refunded(uint256 amount)",
  "event SettlementProposed(address proposedBy, uint256 clientAmount, uint256 freelancerAmount)",
  "event SettlementAccepted(address acceptedBy)",
  "event SettlementExecuted(uint256 clientAmount, uint256 freelancerAmount)"
];

export async function deployEscrowContract(
  clientEmail: string,
  freelancerEmail: string,
  clientWallet: string,
  freelancerWallet: string,
  amountUsd: number
) {
  const config = getEnvConfig();
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const factory = new ethers.Contract(
    process.env.SAFERELAY_FACTORY_V2_ADDRESS!,
    FACTORY_V2_ABI,
    signer
  );
  
  const amountUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
  
  console.log('Deploying escrow contract...');
  const tx = await factory.createEscrow(
    clientEmail,
    freelancerEmail,
    clientWallet,
    freelancerWallet,
    amountUsdc
  );
  
  console.log('Transaction sent:', tx.hash);
  const receipt = await tx.wait();
  
  // Get escrow address from event
  const event = receipt.events.find(e => e.event === 'EscrowCreated');
  const escrowAddress = event.args.escrow;
  
  console.log('Escrow deployed at:', escrowAddress);
  return escrowAddress;
}

export async function getEscrowStatus(escrowAddress: string) {
  const config = getEnvConfig();
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  
  const escrow = new ethers.Contract(escrowAddress, ESCROW_V2_ABI, provider);
  const status = await escrow.getStatus();
  
  return {
    funded: status.funded,
    clientApproved: status.clientOk,
    freelancerApproved: status.freelancerOk,
    released: status.isReleased,
    refunded: status.isRefunded,
    balance: ethers.utils.formatUnits(status.balance, 6)
  };
}

export async function approveEscrowWithMagic(
  escrowAddress: string,
  userRole: 'client' | 'freelancer',
  magic: any // Magic instance
) {
  const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
  const signer = provider.getSigner();
  
  const escrow = new ethers.Contract(escrowAddress, ESCROW_V2_ABI, signer);
  
  const tx = userRole === 'client' 
    ? await escrow.approveAsClient()
    : await escrow.approveAsFreelancer();
    
  console.log('Approval transaction:', tx.hash);
  const receipt = await tx.wait();
  console.log('Approval confirmed!');
  
  return receipt;
}