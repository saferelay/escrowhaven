// contracts/SafeRelayEscrowV2_1_EIP712.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SafeRelayEscrowV2_1_EIP712 {
    IERC20 public immutable usdc;
    address public immutable client;
    address public immutable freelancer;
    address public immutable safeRelayFeeRecipient;
    uint256 public immutable totalAmount;
    
    bool public released;
    bool public refunded;
    
    // EIP-712 Domain
    bytes32 private constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    // EIP-712 Type Hashes
    bytes32 private constant RELEASE_TYPEHASH = keccak256(
        "ReleasePayment(string action,address recipient,uint256 amount,uint256 nonce,uint256 deadline)"
    );
    
    bytes32 private constant REFUND_TYPEHASH = keccak256(
        "RefundPayment(string action,address recipient,uint256 amount,uint256 nonce,uint256 deadline)"
    );
    
    bytes32 private constant SETTLEMENT_TYPEHASH = keccak256(
        "SettlementRelease(string action,address recipient,uint256 amount,uint256 totalAmount,uint256 nonce,uint256 deadline)"
    );
    
    bytes32 private immutable DOMAIN_SEPARATOR;
    
    event Released(address indexed to, uint256 amount);
    event Refunded(address indexed to, uint256 amount);
    event SettlementReleased(address indexed freelancer, uint256 freelancerAmount, address indexed client, uint256 clientAmount);
    
    constructor(
        address _usdc,
        address _client,
        address _freelancer,
        address _feeRecipient,
        uint256 _amount
    ) {
        usdc = IERC20(_usdc);
        client = _client;
        freelancer = _freelancer;
        safeRelayFeeRecipient = _feeRecipient;
        totalAmount = _amount;
        
        // Create EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("SafeRelay")),
                keccak256(bytes("2.1")),
                block.chainid,
                address(this)
            )
        );
    }
    
    // Client releases payment with EIP-712 signature
    function releaseWithSignature(
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(!released && !refunded, "Already processed");
        require(block.timestamp <= deadline, "Expired");
        
        // Create EIP-712 hash
        bytes32 structHash = keccak256(
            abi.encode(
                RELEASE_TYPEHASH,
                keccak256(bytes("Release Full Payment")),
                freelancer,
                totalAmount,
                nonce,
                deadline
            )
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        
        // Verify signature
        address signer = recoverSigner(hash, signature);
        require(signer == client, "Invalid signature");
        
        released = true;
        _distributeFunds(freelancer, totalAmount);
        emit Released(freelancer, totalAmount);
    }
    
    // Freelancer refunds with EIP-712 signature
    function refundWithSignature(
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(!released && !refunded, "Already processed");
        require(block.timestamp <= deadline, "Expired");
        
        // Create EIP-712 hash
        bytes32 structHash = keccak256(
            abi.encode(
                REFUND_TYPEHASH,
                keccak256(bytes("Refund Full Payment")),
                client,
                totalAmount,
                nonce,
                deadline
            )
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        
        // Verify signature
        address signer = recoverSigner(hash, signature);
        require(signer == freelancer, "Invalid signature");
        
        refunded = true;
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(client, balance), "Refund failed");
        emit Refunded(client, balance);
    }
    
    // Settlement release with EIP-712 signature
    function settlementRelease(
        uint256 freelancerAmount,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(!released && !refunded, "Already processed");
        require(block.timestamp <= deadline, "Expired");
        require(freelancerAmount <= totalAmount, "Invalid amount");
        
        // Create EIP-712 hash
        bytes32 structHash = keccak256(
            abi.encode(
                SETTLEMENT_TYPEHASH,
                keccak256(bytes("Settlement Release")),
                freelancer,
                freelancerAmount,
                totalAmount,
                nonce,
                deadline
            )
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );
        
        // Verify signature
        address signer = recoverSigner(hash, signature);
        require(signer == client, "Only client can release settlement");
        
        released = true;
        
        uint256 balance = usdc.balanceOf(address(this));
        require(balance >= totalAmount, "Insufficient balance");
        
        // Calculate client refund
        uint256 clientRefund = totalAmount - freelancerAmount;
        
        // Distribute funds
        if (freelancerAmount > 0) {
            _distributeFunds(freelancer, freelancerAmount);
        }
        
        if (clientRefund > 0) {
            require(usdc.transfer(client, clientRefund), "Client refund failed");
        }
        
        emit SettlementReleased(freelancer, freelancerAmount, client, clientRefund);
    }
    
    function _distributeFunds(address recipient, uint256 amount) private {
        // Calculate platform fee (1.99%)
        uint256 fee = (amount * 199) / 10000;
        uint256 recipientAmount = amount - fee;
        
        require(usdc.transfer(recipient, recipientAmount), "Transfer failed");
        if (fee > 0) {
            require(usdc.transfer(safeRelayFeeRecipient, fee), "Fee transfer failed");
        }
    }
    
    function recoverSigner(bytes32 hash, bytes memory signature) private pure returns (address) {
        require(signature.length == 65, "Invalid signature");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        return ecrecover(hash, v, r, s);
    }
    
    // View functions
    function getStatus() external view returns (bool funded, bool isReleased, bool isRefunded) {
        funded = usdc.balanceOf(address(this)) > 0 || released || refunded;
        isReleased = released;
        isRefunded = refunded;
    }
    
    function getDomainSeparator() external view returns (bytes32) {
        return DOMAIN_SEPARATOR;
    }
}