// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EscrowHavenEscrow.sol";
import "./EscrowHavenSplitter.sol";
import "./IERC20.sol";

contract EscrowHavenFactory {
    address public constant USDC_POLYGON = 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;
    address public constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address public constant USDC_ETHEREUM = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant MOCK_USDC = 0x8B0180f2101c8260d49339abfEe87927412494B4;
    
    address public immutable saferelayBackend;
    mapping(address => bool) public authorizedCallers;
    address public klerosArbitrator;
    
    event EscrowCreated(
        address indexed escrow, 
        address indexed splitter, 
        address indexed client, 
        address freelancer, 
        bytes32 salt
    );
    
    event Debug(string message, address addr, uint256 value);
    
    modifier onlyAuthorized() {
        require(
            authorizedCallers[msg.sender] || msg.sender == saferelayBackend,
            "Factory: Not authorized"
        );
        _;
    }
    
    constructor() {
        saferelayBackend = msg.sender;
        authorizedCallers[msg.sender] = true;
    }
    
    function getUSDC() public view returns (address) {
        uint256 chainId = block.chainid;
        if (chainId == 1) return USDC_ETHEREUM;
        if (chainId == 137) return USDC_POLYGON;
        if (chainId == 8453) return USDC_BASE;
        return MOCK_USDC;
    }
    
    // FIXED: No amount in constructor
    function getVaultAddress(
        bytes32 salt,
        address client,
        address freelancer
    ) public view returns (address vault, address splitter) {
        address usdcAddress = getUSDC();
        
        bytes memory splitterBytecode = abi.encodePacked(
            type(EscrowHavenSplitter).creationCode,
            abi.encode(usdcAddress, freelancer)
        );
        
        splitter = address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(splitterBytecode)
        )))));
        
        // NO AMOUNT in constructor
        bytes memory vaultBytecode = abi.encodePacked(
            type(EscrowHavenEscrow).creationCode,
            abi.encode(usdcAddress, client, freelancer, splitter, klerosArbitrator)
        );
        
        vault = address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(vaultBytecode)
        )))));
        
        return (vault, splitter);
    }
    
    // FIXED: No amount parameter
    function deployVault(
        bytes32 salt,
        address client,
        address freelancer
    ) public onlyAuthorized returns (address escrow, address splitter) {
        address usdcAddress = getUSDC();
        
        bytes memory splitterBytecode = abi.encodePacked(
            type(EscrowHavenSplitter).creationCode,
            abi.encode(usdcAddress, freelancer)
        );
        
        address splitterAddr;
        assembly {
            splitterAddr := create2(0, add(splitterBytecode, 0x20), mload(splitterBytecode), salt)
        }
        require(splitterAddr != address(0), "Factory: Splitter deployment failed");
        
        // NO AMOUNT in constructor
        bytes memory escrowBytecode = abi.encodePacked(
            type(EscrowHavenEscrow).creationCode,
            abi.encode(usdcAddress, client, freelancer, splitterAddr, klerosArbitrator)
        );
        
        address escrowAddr;
        assembly {
            escrowAddr := create2(0, add(escrowBytecode, 0x20), mload(escrowBytecode), salt)
        }
        require(escrowAddr != address(0), "Factory: Escrow deployment failed");
        
        emit EscrowCreated(escrowAddr, splitterAddr, client, freelancer, salt);
        
        return (escrowAddr, splitterAddr);
    }
    
    function setAuthorized(address caller, bool authorized) external {
        require(msg.sender == saferelayBackend, "Factory: Only backend can authorize");
        authorizedCallers[caller] = authorized;
    }
    
    function setArbitrator(address _arbitrator) external {
        require(msg.sender == saferelayBackend, "Factory: Only backend can set arbitrator");
        klerosArbitrator = _arbitrator;
    }
}