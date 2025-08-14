// contracts/contracts/saferelay/SafeRelayFactoryV2_1.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SafeRelayEscrowV2_1_EIP712.sol";

contract SafeRelayFactoryV2_1 {
    event EscrowCreated(
        address indexed escrowAddress,
        address indexed clientWallet,
        address indexed freelancerWallet,
        uint256 amount,
        uint256 timestamp
    );
    
    mapping(address => bool) public isValidEscrow;
    address[] public allEscrows;
    
    // USDC addresses for production
    address public constant USDC_POLYGON_AMOY = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address public constant USDC_POLYGON_MAINNET = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    
    // Mock USDC for testing - YOUR MOCK USDC
    address public constant MOCK_USDC = 0x8B0180f2101c8260d49339abfEe87927412494B4;
    
    // SafeRelay fee recipient
    address public constant SAFERELAY_FEE_RECIPIENT = 0xE99318b378CC5C163223bbfF06D4d5159E4e5f1e;
    
    // Owner address to check if we're in test mode
    address public immutable deployer;
    
    constructor() {
        deployer = msg.sender;
    }
    
    function createEscrow(
        address clientWallet,
        address freelancerWallet,
        uint256 amount
    ) external returns (address escrowAddress) {
        require(clientWallet != address(0), "Invalid client");
        require(freelancerWallet != address(0), "Invalid freelancer");
        require(clientWallet != freelancerWallet, "Same address");
        require(amount > 0, "Invalid amount");
        
        // Get USDC address based on chain
        address usdcAddress;
        
        if (block.chainid == 137) {
            // Polygon Mainnet - always use real USDC
            usdcAddress = USDC_POLYGON_MAINNET;
        } else {
            // For all testnets, use Mock USDC
            usdcAddress = MOCK_USDC;
        }
        
        // Deploy new escrow with correct parameter order
        SafeRelayEscrowV2_1_EIP712 escrow = new SafeRelayEscrowV2_1_EIP712(
            usdcAddress,           // _usdc (first)
            clientWallet,          // _client
            freelancerWallet,      // _freelancer
            SAFERELAY_FEE_RECIPIENT, // _feeRecipient
            amount                 // _amount
        );
        
        escrowAddress = address(escrow);
        isValidEscrow[escrowAddress] = true;
        allEscrows.push(escrowAddress);
        
        emit EscrowCreated(
            escrowAddress,
            clientWallet,
            freelancerWallet,
            amount,
            block.timestamp
        );
        
        return escrowAddress;
    }
    
    function getEscrowCount() external view returns (uint256) {
        return allEscrows.length;
    }
    
    function getEscrowByIndex(uint256 index) external view returns (address) {
        return allEscrows[index];
    }
    
    function getUSDCAddress() external view returns (address) {
        if (block.chainid == 137) {
            return USDC_POLYGON_MAINNET;
        } else {
            return MOCK_USDC;
        }
    }
}