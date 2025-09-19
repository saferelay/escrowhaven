// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

contract EscrowHavenEscrow {
    IERC20 public immutable usdc;
    address public immutable clientMagicWallet;
    address public immutable freelancerMagicWallet;
    address public immutable paymentSplitter;
    address public immutable arbitrator;
    
    bool public released;
    bool public refunded;
    
    // Nonce tracking for signatures
    mapping(uint256 => bool) public usedNonces;
    
    // Settlement structure
    struct Settlement {
        uint256 clientAmount;
        uint256 freelancerAmount;
        address proposer;
        bool clientApproved;
        bool freelancerApproved;
        bool executed;
        uint256 proposalNonce;
    }
    
    Settlement public pendingSettlement;
    
    event Released(uint256 amount, uint256 timestamp);
    event Refunded(uint256 amount, uint256 timestamp);
    event SettlementProposed(uint256 clientAmount, uint256 freelancerAmount, address proposer);
    event SettlementExecuted(uint256 clientAmount, uint256 freelancerAmount);
    
    constructor(
        address _usdc,
        address _client,
        address _freelancer,
        address _splitter,
        address _arbitrator
    ) {
        require(_usdc != address(0), "Invalid USDC");
        require(_client != address(0), "Invalid client");
        require(_freelancer != address(0), "Invalid freelancer");
        require(_splitter != address(0), "Invalid splitter");
        
        usdc = IERC20(_usdc);
        clientMagicWallet = _client;
        freelancerMagicWallet = _freelancer;
        paymentSplitter = _splitter;
        arbitrator = _arbitrator;
    }
    
    // GASLESS RELEASE - Backend submits user's signature
    function releaseWithSignature(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 nonce
    ) external {
        require(!released && !refunded, "Already settled");
        require(!usedNonces[nonce], "Nonce already used");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked("Release escrow", address(this), nonce))
            )
        );
        
        address signer = ecrecover(messageHash, v, r, s);
        require(signer == clientMagicWallet, "Only client can release");
        
        usedNonces[nonce] = true;
        
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to release");
        
        released = true;
        
        bool success = usdc.transfer(paymentSplitter, balance);
        require(success, "Transfer failed");
        
        try IEscrowHavenSplitter(paymentSplitter).split() {} catch {}
        
        emit Released(balance, block.timestamp);
    }
    
    // GASLESS REFUND - Backend submits user's signature
    function refundWithSignature(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 nonce
    ) external {
        require(!released && !refunded, "Already settled");
        require(!usedNonces[nonce], "Nonce already used");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked("Refund escrow", address(this), nonce))
            )
        );
        
        address signer = ecrecover(messageHash, v, r, s);
        require(signer == freelancerMagicWallet, "Only freelancer can refund");
        
        usedNonces[nonce] = true;
        
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No funds to refund");
        
        refunded = true;
        
        bool success = usdc.transfer(clientMagicWallet, balance);
        require(success, "Refund failed");
        
        emit Refunded(balance, block.timestamp);
    }
    
    // GASLESS SETTLEMENT PROPOSAL - Backend submits user's signature
    function proposeSettlementWithSignature(
        uint256 _clientAmount,
        uint256 _freelancerAmount,
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 nonce
    ) external {
        require(!released && !refunded, "Already settled");
        require(!usedNonces[nonce], "Nonce already used");
        
        uint256 balance = usdc.balanceOf(address(this));
        require(_clientAmount + _freelancerAmount <= balance, "Exceeds balance");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(
                    "Propose settlement",
                    address(this),
                    _clientAmount,
                    _freelancerAmount,
                    nonce
                ))
            )
        );
        
        address signer = ecrecover(messageHash, v, r, s);
        require(signer == clientMagicWallet || signer == freelancerMagicWallet, "Not authorized");
        
        usedNonces[nonce] = true;
        
        pendingSettlement = Settlement({
            clientAmount: _clientAmount,
            freelancerAmount: _freelancerAmount,
            proposer: signer,
            clientApproved: signer == clientMagicWallet,
            freelancerApproved: signer == freelancerMagicWallet,
            executed: false,
            proposalNonce: nonce
        });
        
        emit SettlementProposed(_clientAmount, _freelancerAmount, signer);
    }
    
    // GASLESS SETTLEMENT ACCEPTANCE - Backend submits user's signature
    function acceptSettlementWithSignature(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 nonce
    ) external {
        require(pendingSettlement.proposer != address(0), "No pending settlement");
        require(!pendingSettlement.executed, "Already executed");
        require(!released && !refunded, "Already settled");
        require(!usedNonces[nonce], "Nonce already used");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(
                    "Accept settlement",
                    address(this),
                    pendingSettlement.clientAmount,
                    pendingSettlement.freelancerAmount,
                    nonce
                ))
            )
        );
        
        address signer = ecrecover(messageHash, v, r, s);
        require(signer == clientMagicWallet || signer == freelancerMagicWallet, "Not authorized");
        
        usedNonces[nonce] = true;
        
        if (signer == clientMagicWallet) {
            require(!pendingSettlement.clientApproved, "Already approved by client");
            pendingSettlement.clientApproved = true;
        } else {
            require(!pendingSettlement.freelancerApproved, "Already approved by freelancer");
            pendingSettlement.freelancerApproved = true;
        }
        
        if (pendingSettlement.clientApproved && pendingSettlement.freelancerApproved) {
            executeSettlement();
        }
    }
    
    function executeSettlement() private {
        uint256 balance = usdc.balanceOf(address(this));
        require(pendingSettlement.clientAmount + pendingSettlement.freelancerAmount <= balance, "Insufficient balance");
        
        if (pendingSettlement.clientAmount > 0) {
            bool clientTransfer = usdc.transfer(clientMagicWallet, pendingSettlement.clientAmount);
            require(clientTransfer, "Client transfer failed");
        }
        
        if (pendingSettlement.freelancerAmount > 0) {
            bool freelancerTransfer = usdc.transfer(paymentSplitter, pendingSettlement.freelancerAmount);
            require(freelancerTransfer, "Freelancer transfer failed");
            
            try IEscrowHavenSplitter(paymentSplitter).split() {} catch {}
        }
        
        pendingSettlement.executed = true;
        released = true;
        
        emit SettlementExecuted(pendingSettlement.clientAmount, pendingSettlement.freelancerAmount);
    }
    
    function getStatus() external view returns (
        bool isReleased,
        bool isRefunded,
        uint256 balance,
        bool hasSettlement,
        address client,
        address freelancer
    ) {
        return (
            released,
            refunded,
            usdc.balanceOf(address(this)),
            pendingSettlement.proposer != address(0),
            clientMagicWallet,
            freelancerMagicWallet
        );
    }
    
    function getSettlementDetails() external view returns (
        uint256 clientAmount,
        uint256 freelancerAmount,
        address proposer,
        bool clientApproved,
        bool freelancerApproved,
        bool executed
    ) {
        return (
            pendingSettlement.clientAmount,
            pendingSettlement.freelancerAmount,
            pendingSettlement.proposer,
            pendingSettlement.clientApproved,
            pendingSettlement.freelancerApproved,
            pendingSettlement.executed
        );
    }
}

interface IEscrowHavenSplitter {
    function split() external;
}