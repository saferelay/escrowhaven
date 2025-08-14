// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SafeRelayEscrow.sol";
import "./SafeRelayPaymentSplitter.sol";
import "./IERC20.sol";

contract SafeRelayFactory {
    address public immutable saferelayBackend;
    address public immutable usdcAddress;
    address public constant PLATFORM_FEE_RECIPIENT = 0xE99318b378CC5C163223bbfF06D4d5159E4e5f1e;
    
    // Track authorized callers (backend + Transak contract)
    mapping(address => bool) public authorizedCallers;
    
    // For atomic deployments, track expected deployments
    mapping(bytes32 => uint256) public pendingDeployments; // hash => amount
    
    event EscrowCreated(
        address indexed escrow,
        address indexed splitter,
        string payerEmail,
        string recipientEmail,
        address recipientWallet,
        uint256 amount
    );
    
    event AuthorizedCallerSet(address indexed caller, bool authorized);
    
    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == saferelayBackend, "Not authorized");
        _;
    }
    
    constructor(address _backend, address _usdc) {
        saferelayBackend = _backend;
        usdcAddress = _usdc;
        authorizedCallers[_backend] = true;
    }
    
    // Add/remove authorized callers (only backend can do this)
    function setAuthorizedCaller(address caller, bool authorized) external {
        require(msg.sender == saferelayBackend, "Only backend");
        authorizedCallers[caller] = authorized;
        emit AuthorizedCallerSet(caller, authorized);
    }
    
    // Register expected atomic deployment (called by backend before Transak)
    function registerPendingDeployment(
        string memory payerEmail,
        string memory recipientEmail,
        address recipientWallet,
        uint256 amount
    ) external onlyAuthorized returns (bytes32) {
        bytes32 deploymentHash = keccak256(abi.encodePacked(
            payerEmail,
            recipientEmail,
            recipientWallet,
            amount,
            block.timestamp
        ));
        
        pendingDeployments[deploymentHash] = amount;
        return deploymentHash;
    }
    
    // Traditional deployment - only authorized can call
    function createEscrow(
        string memory payerEmail,
        string memory recipientEmail,
        address recipientWallet,
        uint256 amount
    ) public onlyAuthorized returns (address escrow, address splitter) {
        require(recipientWallet != address(0), "Invalid recipient wallet");
        
        // Create splitter
        splitter = address(new SafeRelayPaymentSplitter(
            usdcAddress,
            recipientWallet,
            PLATFORM_FEE_RECIPIENT,
            9801,  // 98.01% to recipient
            199    // 1.99% platform fee
        ));
        
        // Create escrow
        escrow = address(new SafeRelayEscrow(
            usdcAddress,
            payerEmail,
            recipientEmail,
            saferelayBackend,
            splitter,
            amount
        ));
        
        emit EscrowCreated(escrow, splitter, payerEmail, recipientEmail, recipientWallet, amount);
        
        // Check if factory has received USDC (for atomic deployment)
        IERC20 usdc = IERC20(usdcAddress);
        uint256 factoryBalance = usdc.balanceOf(address(this));
        
        // If we have enough USDC, transfer it to the escrow
        if (factoryBalance >= amount) {
            require(usdc.transfer(escrow, amount), "USDC transfer to escrow failed");
        }
        
        return (escrow, splitter);
    }
    
    // Atomic deployment with hash verification (for Transak)
    function createEscrowWithHash(
        string memory payerEmail,
        string memory recipientEmail,
        address recipientWallet,
        uint256 amount,
        bytes32 deploymentHash
    ) external returns (address escrow, address splitter) {
        // Verify the deployment was pre-registered
        require(pendingDeployments[deploymentHash] == amount, "Invalid deployment hash");
        
        // Clear the pending deployment
        delete pendingDeployments[deploymentHash];
        
        // Create the escrow (this can be called by anyone with valid hash)
        return createEscrow(payerEmail, recipientEmail, recipientWallet, amount);
    }
    
    // NO EMERGENCY WITHDRAW FUNCTION!
    // The factory should NEVER be able to withdraw funds
    // If USDC gets stuck here, it's better than having a backdoor
    
    // View functions only
    function getUSDCBalance() external view returns (uint256) {
        return IERC20(usdcAddress).balanceOf(address(this));
    }
    
    function isAuthorized(address caller) external view returns (bool) {
        return authorizedCallers[caller] || caller == saferelayBackend;
    }
}
