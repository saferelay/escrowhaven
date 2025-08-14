// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";
import "./SafeRelayPaymentSplitter.sol";

contract SafeRelayEscrow {
    IERC20 public immutable usdc;
    string public payerEmail;
    string public recipientEmail;
    address public immutable saferelayBackend;
    address public immutable paymentSplitter;
    uint256 public immutable amount;
    
    bool public payerApproved;
    bool public recipientApproved;
    bool public fundsReleased;
    
    event Approved(string email, bool isPayer);
    event FundsReleased(uint256 amount);
    
    modifier onlySafeRelay() {
        require(msg.sender == saferelayBackend, "Only SafeRelay backend");
        _;
    }
    
    constructor(
        address _usdc,
        string memory _payerEmail,
        string memory _recipientEmail,
        address _backend,
        address _splitter,
        uint256 _amount
    ) {
        usdc = IERC20(_usdc);
        payerEmail = _payerEmail;
        recipientEmail = _recipientEmail;
        saferelayBackend = _backend;
        paymentSplitter = _splitter;
        amount = _amount;
    }
    
    // Approve for a specific party
    function approveFor(string memory approverEmail, bool isPayer) external onlySafeRelay {
        require(!fundsReleased, "Already released");
        
        if (isPayer) {
            require(keccak256(bytes(approverEmail)) == keccak256(bytes(payerEmail)), "Email mismatch");
            require(!payerApproved, "Payer already approved");
            payerApproved = true;
            emit Approved(approverEmail, true);
        } else {
            require(keccak256(bytes(approverEmail)) == keccak256(bytes(recipientEmail)), "Email mismatch");
            require(!recipientApproved, "Recipient already approved");
            recipientApproved = true;
            emit Approved(approverEmail, false);
        }
        
        // Auto-release if both approved
        if (payerApproved && recipientApproved) {
            _releaseFunds();
        }
    }
    
    function _releaseFunds() private {
        require(!fundsReleased, "Already released");
        require(payerApproved && recipientApproved, "Not fully approved");
        
        fundsReleased = true;
        
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds");
        
        // Send to splitter
        require(usdc.transfer(paymentSplitter, balance), "Transfer failed");
        
        // Call split to distribute funds
        SafeRelayPaymentSplitter(paymentSplitter).split();
        
        emit FundsReleased(balance);
    }
    
    function getStatus() external view returns (
        bool funded,
        bool payerOk,
        bool recipientOk,
        bool released
    ) {
        funded = usdc.balanceOf(address(this)) >= amount || fundsReleased;
        payerOk = payerApproved;
        recipientOk = recipientApproved;
        released = fundsReleased;
    }
    
    function isFunded() external view returns (bool) {
        return usdc.balanceOf(address(this)) >= amount;
    }
    
    function getBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
