// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SafeRelayEscrowV2.sol";

/**
 * @title SafeRelayFactoryV2
 * @notice Factory for deploying escrow contracts with user wallet controls
 */
contract SafeRelayFactoryV2 {
    // Events
    event EscrowCreated(
        address indexed escrow,
        address indexed client,
        address indexed freelancer,
        address clientWallet,
        address freelancerWallet,
        uint256 amount,
        uint256 timestamp
    );
    
    // Tracking
    mapping(address => bool) public isValidEscrow;
    address[] public allEscrows;
    
    // USDC addresses for different networks
    mapping(uint256 => address) public usdcAddresses;
    
    constructor() {
        // Polygon Amoy (testnet)
        usdcAddresses[80002] = 0x8B0180f2101c8260d49339abfEe87927412494B4;
        // Polygon Mainnet
        usdcAddresses[137] = 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;
        // Base Mainnet
        usdcAddresses[8453] = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    }
    
    /**
     * @notice Create a new escrow contract
     * @param clientEmail Email address of the client (for reference)
     * @param freelancerEmail Email address of the freelancer (for reference)
     * @param clientWallet Wallet address of the client (Magic.link wallet)
     * @param freelancerWallet Wallet address of the freelancer (Magic.link wallet)
     * @param amount Amount in USDC (with 6 decimals)
     */
    function createEscrow(
        string memory clientEmail,
        string memory freelancerEmail,
        address clientWallet,
        address freelancerWallet,
        uint256 amount
    ) external returns (address escrow) {
        require(clientWallet != address(0), "Invalid client wallet");
        require(freelancerWallet != address(0), "Invalid freelancer wallet");
        require(clientWallet != freelancerWallet, "Same wallet for both parties");
        require(amount > 0, "Invalid amount");
        
        // Get USDC address for current chain
        address usdcAddress = usdcAddresses[block.chainid];
        require(usdcAddress != address(0), "USDC not configured for this chain");
        
        // Deploy new escrow
        escrow = address(new SafeRelayEscrowV2(
            msg.sender, // Deployer address (for tracking)
            msg.sender, // Using msg.sender as placeholder for email tracking
            clientWallet,
            freelancerWallet,
            amount,
            usdcAddress
        ));
        
        isValidEscrow[escrow] = true;
        allEscrows.push(escrow);
        
        emit EscrowCreated(
            escrow,
            clientWallet,
            freelancerWallet,
            clientWallet,
            freelancerWallet,
            amount,
            block.timestamp
        );
        
        return escrow;
    }
    
    /**
     * @notice Get total number of escrows created
     */
    function getEscrowCount() external view returns (uint256) {
        return allEscrows.length;
    }
    
    /**
     * @notice Check if an address is a valid escrow from this factory
     */
    function isEscrowValid(address escrow) external view returns (bool) {
        return isValidEscrow[escrow];
    }
}