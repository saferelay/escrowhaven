// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

contract EscrowHavenSplitter {
    IERC20 public immutable usdc;
    address public immutable recipient;
    address public constant ESCROWHAVEN_FEE = 0x4e82123df6CD65306AdDC8b7748d0cea6024f0aF;
    
    event Split(uint256 recipientAmount, uint256 feeAmount);
    event Debug(string message, uint256 value);
    
    constructor(address _usdc, address _recipient) {
        require(_usdc != address(0), "Invalid USDC");
        require(_recipient != address(0), "Invalid recipient");
        usdc = IERC20(_usdc);
        recipient = _recipient;
    }
    
    function split() external {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to split");
        
        emit Debug("Splitter balance", balance);
        
        // Calculate amounts (98.01% to recipient, 1.99% fee)
        uint256 recipientAmount = (balance * 9801) / 10000;
        uint256 feeAmount = balance - recipientAmount;
        
        // Transfer to recipient
        bool recipientTransfer = usdc.transfer(recipient, recipientAmount);
        require(recipientTransfer, "Recipient transfer failed");
        
        // Transfer fee if any
        if (feeAmount > 0) {
            bool feeTransfer = usdc.transfer(ESCROWHAVEN_FEE, feeAmount);
            require(feeTransfer, "Fee transfer failed");
        }
        
        emit Split(recipientAmount, feeAmount);
    }
    
    // Emergency function to check balance
    function getBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}