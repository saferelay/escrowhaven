import { ethers } from 'ethers';

export async function createTransparentEscrow(
  clientEmail: string,
  recipientAddress: string,
  amountUsd: number
) {
  console.log('Creating escrow on blockchain...');
  
  // Create provider with timeout
  const alchemyUrl = `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  
  // Add timeout to provider creation - Fixed type annotation
  const providerPromise = new Promise<ethers.providers.JsonRpcProvider>((resolve, reject) => {
    const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
    
    // Set a timeout
    const timeout = setTimeout(() => {
      reject(new Error('Provider connection timeout'));
    }, 10000); // 10 second timeout
    
    // Try to get network to verify connection
    provider.getNetwork().then(() => {
      clearTimeout(timeout);
      resolve(provider);
    }).catch(err => {
      clearTimeout(timeout);
      reject(err);
    });
  });
  
  const provider = await providerPromise;
  console.log('Provider connected');
  
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const FACTORY_ABI = [
    "function createEscrow(address client, address freelancer, uint256 amount) returns (address escrow, address splitter)",
    "event EscrowCreated(address indexed escrow, address indexed client, address indexed freelancer, address splitter, uint256 amount, uint256 timestamp)"
  ];
  
  const factory = new ethers.Contract(
    process.env.ESCROWHAVEN_FACTORY_ADDRESS!,  // Added missing comma here
    FACTORY_ABI,
    signer
  );
  
  // Generate client address from email
  const clientAddress = ethers.utils.getAddress(
    '0x' + ethers.utils.keccak256(ethers.utils.toUtf8Bytes(clientEmail)).slice(26)
  );
  
  const amountUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
  
  console.log('Sending transaction...');
  
  // Create escrow with timeout
  const txPromise = factory.createEscrow(
    clientAddress,
    recipientAddress,
    amountUsdc,
    { gasLimit: 2000000 }
  );
  
  // Add timeout to transaction
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Transaction timeout')), 30000)
  );
  
  const tx = await Promise.race([txPromise, timeoutPromise]) as any;
  
  console.log('Transaction sent:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('Transaction confirmed');
  
  // Parse event
  const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
  if (!event) {
    throw new Error('EscrowCreated event not found');
  }
  
  const [escrowAddress, , , splitterAddress] = event.args;
  
  return {
    escrowAddress,
    splitterAddress,
    txHash: tx.hash
  };
}