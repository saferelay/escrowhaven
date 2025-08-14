// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title EscrowVault
 * @dev Individual escrow vault that holds USDC and releases based on dual approval
 * @notice This contract is cloned by the EscrowFactory for each new escrow
 */
contract EscrowVault is ReentrancyGuard, Initializable {
    // State variables
    IERC20 public usdc;
    address public client;
    address public freelancer;
    uint256 public amount;
    
    bool public clientApproved;
    bool public freelancerApproved;
    bool public released;
    
    // Events
    event Approved(address indexed approver, bool isClient);
    event Released(address indexed freelancer, uint256 amount);
    event FundsDeposited(address indexed depositor, uint256 amount);
    
    // Modifiers
    modifier onlyParticipants() {
        require(msg.sender == client || msg.sender == freelancer, "EscrowVault: Not authorized");
        _;
    }
    
    modifier notReleased() {
        require(!released, "EscrowVault: Already released");
        _;
    }
    
    /**
     * @dev Initialize the escrow vault (called by factory)
     * @param _client Address of the client
     * @param _freelancer Address of the freelancer
     * @param _amount Expected USDC amount
     * @param _usdc USDC token contract address
     */
    function initialize(
        address _client,
        address _freelancer,
        uint256 _amount,
        address _usdc
    ) external initializer {
        require(_client != address(0), "EscrowVault: Invalid client address");
        require(_freelancer != address(0), "EscrowVault: Invalid freelancer address");
        require(_client != _freelancer, "EscrowVault: Client and freelancer must be different");
        require(_amount > 0, "EscrowVault: Amount must be greater than 0");
        require(_usdc != address(0), "EscrowVault: Invalid USDC address");
        
        client = _client;
        freelancer = _freelancer;
        amount = _amount;
        usdc = IERC20(_usdc);
    }
    
    /**
     * @dev Approve the escrow release (called by client or freelancer)
     */
    function approve() external onlyParticipants notReleased {
        if (msg.sender == client) {
            require(!clientApproved, "EscrowVault: Client already approved");
            clientApproved = true;
            emit Approved(msg.sender, true);
        } else {
            require(!freelancerApproved, "EscrowVault: Freelancer already approved");
            freelancerApproved = true;
            emit Approved(msg.sender, false);
        }
        
        // Auto-release if both parties approved
        if (clientApproved && freelancerApproved) {
            _release();
        }
    }
    
    /**
     * @dev Release funds to freelancer (internal function)
     */
    function _release() internal nonReentrant {
        require(clientApproved && freelancerApproved, "EscrowVault: Not approved by both parties");
        require(!released, "EscrowVault: Already released");
        
        released = true;
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "EscrowVault: No funds to release");
        
        // Transfer all USDC in the contract to freelancer
        bool success = usdc.transfer(freelancer, balance);
        require(success, "EscrowVault: Transfer failed");
        
        emit Released(freelancer, balance);
    }
    
    /**
     * @dev Get current escrow status
     */
    function getStatus() external view returns (
        address _client,
        address _freelancer,
        uint256 _amount,
        uint256 _balance,
        bool _clientApproved,
        bool _freelancerApproved,
        bool _released
    ) {
        return (
            client,
            freelancer,
            amount,
            usdc.balanceOf(address(this)),
            clientApproved,
            freelancerApproved,
            released
        );
    }
    
    /**
     * @dev Check if contract has sufficient funds
     */
    function isFunded() external view returns (bool) {
        return usdc.balanceOf(address(this)) >= amount;
    }
}
