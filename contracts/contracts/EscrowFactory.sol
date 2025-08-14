// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EscrowVault.sol";

/**
 * @title EscrowFactory
 * @dev Factory contract for creating deterministic escrow vaults
 * @notice This contract creates individual escrow vaults using CREATE2 for deterministic addresses
 */
contract EscrowFactory is Ownable {
    // State variables
    address public immutable escrowImplementation;
    address public constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // Base Sepolia testnet USDC
    address public constant USDC_BASE_MAINNET = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base mainnet USDC
    address public constant USDC_POLYGON_AMOY = 0x8B0180f2101c8260d49339abfEe87927412494B4; // Polygon Amoy testnet USDC
    address public constant USDC_POLYGON_MAINNET = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // Polygon mainnet USDC
    
    // Events
    event EscrowCreated(
        address indexed escrowAddress,
        bytes32 indexed salt,
        address indexed client,
        address freelancer,
        uint256 amount
    );
    
    /**
     * @dev Constructor deploys the implementation contract
     */
    constructor() Ownable() {  // Pass msg.sender as initial owner
        escrowImplementation = address(new EscrowVault());
    }
    
    /**
     * @dev Create a new escrow vault with deterministic address
     * @param salt Unique salt for CREATE2 address generation
     * @param client Address of the client
     * @param freelancer Address of the freelancer  
     * @param amount Expected USDC amount
     * @return escrowAddress Address of the created escrow vault
     */
    function createEscrow(
        bytes32 salt,
        address client,
        address freelancer,
        uint256 amount
    ) external returns (address escrowAddress) {
        require(client != address(0), "EscrowFactory: Invalid client address");
        require(freelancer != address(0), "EscrowFactory: Invalid freelancer address");
        require(client != freelancer, "EscrowFactory: Client and freelancer must be different");
        require(amount > 0, "EscrowFactory: Amount must be greater than 0");
        
        // Clone the implementation using CREATE2 for deterministic address
        escrowAddress = Clones.cloneDeterministic(escrowImplementation, salt);
        
        // Initialize the escrow vault
        address usdcAddress = getUSDCAddress();
        EscrowVault(escrowAddress).initialize(client, freelancer, amount, usdcAddress);
        
        emit EscrowCreated(escrowAddress, salt, client, freelancer, amount);
        
        return escrowAddress;
    }
    
    /**
     * @dev Get the deterministic address for an escrow (before deployment)
     * @param salt Unique salt for CREATE2 address generation
     * @return The predicted address of the escrow vault
     */
    function getEscrowAddress(bytes32 salt) external view returns (address) {
        return Clones.predictDeterministicAddress(escrowImplementation, salt, address(this));
    }
    
    /**
     * @dev Get the current USDC address for this chain
     */
    function getUSDCAddress() public view returns (address) {
        uint256 chainId = block.chainid;
        
        if (chainId == 84532) return USDC_BASE_SEPOLIA;        // Base Sepolia
        else if (chainId == 8453) return USDC_BASE_MAINNET;    // Base Mainnet
        else if (chainId == 80002) return USDC_POLYGON_AMOY;   // Polygon Amoy
        else if (chainId == 137) return USDC_POLYGON_MAINNET;  // Polygon Mainnet
        else revert("EscrowFactory: Unsupported chain");
    }
    
    /**
     * @dev Check if an escrow vault exists at the predicted address
     * @param salt Salt used for address generation
     */
    function escrowExists(bytes32 salt) external view returns (bool) {
        address predicted = Clones.predictDeterministicAddress(escrowImplementation, salt, address(this));
        return predicted.code.length > 0;
    }
}
