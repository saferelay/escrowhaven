// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

/**
 * @title SafeRelayEscrowV2
 * @notice Escrow contract that accepts signatures from client and freelancer wallets
 * @dev No admin functions - truly decentralized
 */
contract SafeRelayEscrowV2 {
    // Parties
    address public immutable client;
    address public immutable freelancer;
    address public immutable clientWallet;
    address public immutable freelancerWallet;
    
    // Amounts
    uint256 public immutable totalAmount;
    uint256 public immutable platformFeeBps = 199; // 1.99%
    
    // Platform fee recipient
    address public constant PLATFORM_FEE_RECIPIENT = 0xE99318b378CC5C163223bbfF06D4d5159E4e5f1e;
    
    // USDC addresses
    address public immutable usdc;
    
    // State
    bool public clientApproved;
    bool public freelancerApproved;
    bool public released;
    bool public refunded;
    
    // Settlement state
    struct Settlement {
        uint256 clientAmount;
        uint256 freelancerAmount;
        address proposedBy;
        bool clientAccepted;
        bool freelancerAccepted;
        bool executed;
    }
    Settlement public pendingSettlement;
    
    // Events
    event Funded(uint256 amount);
    event ClientApproved();
    event FreelancerApproved();
    event Released(uint256 freelancerAmount, uint256 platformFee);
    event Refunded(uint256 amount);
    event SettlementProposed(address proposedBy, uint256 clientAmount, uint256 freelancerAmount);
    event SettlementAccepted(address acceptedBy);
    event SettlementExecuted(uint256 clientAmount, uint256 freelancerAmount);
    
    constructor(
        address _client,
        address _freelancer,
        address _clientWallet,
        address _freelancerWallet,
        uint256 _amount,
        address _usdc
    ) {
        require(_client != address(0) && _freelancer != address(0), "Invalid addresses");
        require(_clientWallet != address(0) && _freelancerWallet != address(0), "Invalid wallets");
        require(_amount > 0, "Invalid amount");
        
        client = _client;
        freelancer = _freelancer;
        clientWallet = _clientWallet;
        freelancerWallet = _freelancerWallet;
        totalAmount = _amount;
        usdc = _usdc;
    }
    
    /**
     * @notice Get current escrow status
     */
    function getStatus() external view returns (
        bool funded,
        bool clientOk,
        bool freelancerOk,
        bool isReleased,
        bool isRefunded,
        uint256 balance
    ) {
        balance = IERC20(usdc).balanceOf(address(this));
        funded = balance >= totalAmount;
        clientOk = clientApproved;
        freelancerOk = freelancerApproved;
        isReleased = released;
        isRefunded = refunded;
    }
    
    /**
     * @notice Client approves release of funds
     * @dev Can only be called by client's wallet
     */
    function approveAsClient() external {
        require(msg.sender == clientWallet, "Only client wallet");
        require(!released && !refunded, "Already finalized");
        require(IERC20(usdc).balanceOf(address(this)) >= totalAmount, "Not funded");
        
        clientApproved = true;
        emit ClientApproved();
        
        // Auto-release if both approved
        if (freelancerApproved && pendingSettlement.proposedBy == address(0)) {
            _releaseFunds();
        }
    }
    
    /**
     * @notice Freelancer approves release of funds
     * @dev Can only be called by freelancer's wallet
     */
    function approveAsFreelancer() external {
        require(msg.sender == freelancerWallet, "Only freelancer wallet");
        require(!released && !refunded, "Already finalized");
        require(IERC20(usdc).balanceOf(address(this)) >= totalAmount, "Not funded");
        
        freelancerApproved = true;
        emit FreelancerApproved();
        
        // Auto-release if both approved
        if (clientApproved && pendingSettlement.proposedBy == address(0)) {
            _releaseFunds();
        }
    }
    
    /**
     * @notice Propose a settlement (partial payment)
     * @param freelancerAmount Amount freelancer will receive
     */
    function proposeSettlement(uint256 freelancerAmount) external {
        require(msg.sender == clientWallet || msg.sender == freelancerWallet, "Only parties");
        require(!released && !refunded, "Already finalized");
        require(freelancerAmount <= totalAmount, "Amount too high");
        require(IERC20(usdc).balanceOf(address(this)) >= totalAmount, "Not funded");
        
        uint256 clientAmount = totalAmount - freelancerAmount;
        
        pendingSettlement = Settlement({
            clientAmount: clientAmount,
            freelancerAmount: freelancerAmount,
            proposedBy: msg.sender,
            clientAccepted: msg.sender == clientWallet,
            freelancerAccepted: msg.sender == freelancerWallet,
            executed: false
        });
        
        emit SettlementProposed(msg.sender, clientAmount, freelancerAmount);
    }
    
    /**
     * @notice Accept a pending settlement
     */
    function acceptSettlement() external {
        require(pendingSettlement.proposedBy != address(0), "No pending settlement");
        require(!pendingSettlement.executed, "Already executed");
        require(msg.sender == clientWallet || msg.sender == freelancerWallet, "Only parties");
        require(msg.sender != pendingSettlement.proposedBy, "Already proposed by you");
        
        if (msg.sender == clientWallet) {
            pendingSettlement.clientAccepted = true;
        } else {
            pendingSettlement.freelancerAccepted = true;
        }
        
        emit SettlementAccepted(msg.sender);
        
        // Execute if both accepted
        if (pendingSettlement.clientAccepted && pendingSettlement.freelancerAccepted) {
            _executeSettlement();
        }
    }
    
    /**
     * @notice Freelancer can refund the full amount to client
     */
    function refundToClient() external {
        require(msg.sender == freelancerWallet, "Only freelancer");
        require(!released && !refunded, "Already finalized");
        
        uint256 balance = IERC20(usdc).balanceOf(address(this));
        require(balance > 0, "No funds to refund");
        
        refunded = true;
        require(IERC20(usdc).transfer(clientWallet, balance), "Refund failed");
        
        emit Refunded(balance);
    }
    
    /**
     * @dev Internal function to release funds with platform fee
     */
    function _releaseFunds() private {
        require(!released, "Already released");
        released = true;
        
        uint256 balance = IERC20(usdc).balanceOf(address(this));
        uint256 platformFee = (balance * platformFeeBps) / 10000;
        uint256 freelancerAmount = balance - platformFee;
        
        require(IERC20(usdc).transfer(freelancerWallet, freelancerAmount), "Transfer failed");
        require(IERC20(usdc).transfer(PLATFORM_FEE_RECIPIENT, platformFee), "Fee transfer failed");
        
        emit Released(freelancerAmount, platformFee);
    }
    
    /**
     * @dev Internal function to execute settlement
     */
    function _executeSettlement() private {
        require(!pendingSettlement.executed, "Already executed");
        pendingSettlement.executed = true;
        released = true;
        
        uint256 balance = IERC20(usdc).balanceOf(address(this));
        require(balance >= totalAmount, "Insufficient balance");
        
        // Calculate platform fee only on freelancer's portion
        uint256 platformFee = (pendingSettlement.freelancerAmount * platformFeeBps) / 10000;
        uint256 freelancerFinal = pendingSettlement.freelancerAmount - platformFee;
        
        // Transfer amounts
        if (pendingSettlement.clientAmount > 0) {
            require(IERC20(usdc).transfer(clientWallet, pendingSettlement.clientAmount), "Client transfer failed");
        }
        if (freelancerFinal > 0) {
            require(IERC20(usdc).transfer(freelancerWallet, freelancerFinal), "Freelancer transfer failed");
        }
        if (platformFee > 0) {
            require(IERC20(usdc).transfer(PLATFORM_FEE_RECIPIENT, platformFee), "Fee transfer failed");
        }
        
        emit SettlementExecuted(pendingSettlement.clientAmount, freelancerFinal);
    }
}