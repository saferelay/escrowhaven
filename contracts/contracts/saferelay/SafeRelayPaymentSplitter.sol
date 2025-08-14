// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

contract SafeRelayPaymentSplitter {
    IERC20 public immutable usdc;
    address public immutable recipientWallet;  // ACTUAL WALLET ADDRESS!
    address public immutable platformWallet;
    uint256 public immutable recipientShare;  // 9801 = 98.01%
    uint256 public immutable platformShare;   // 199 = 1.99%
    
    event PaymentSplit(address recipient, uint256 recipientAmount, uint256 platformAmount);
    
    constructor(
        address _usdcAddress,
        address _recipientWallet,  // ACTUAL WALLET!
        address _platformWallet,
        uint256 _recipientShare,
        uint256 _platformShare
    ) {
        require(_recipientShare + _platformShare == 10000, "Must total 100%");
        require(_recipientWallet != address(0), "Invalid recipient wallet");
        
        usdc = IERC20(_usdcAddress);
        recipientWallet = _recipientWallet;
        platformWallet = _platformWallet;
        recipientShare = _recipientShare;
        platformShare = _platformShare;
    }
    
    function split() external {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to split");
        
        uint256 recipientAmount = (balance * recipientShare) / 10000;
        uint256 platformAmount = balance - recipientAmount;
        
        require(usdc.transfer(recipientWallet, recipientAmount), "Recipient transfer failed");
        require(usdc.transfer(platformWallet, platformAmount), "Platform transfer failed");
        
        emit PaymentSplit(recipientWallet, recipientAmount, platformAmount);
    }
}
