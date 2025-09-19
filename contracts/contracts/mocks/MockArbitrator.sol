// contracts/contracts/mocks/MockArbitrator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockArbitrator {
    struct Dispute {
        address arbitrable;
        uint256 choices;
        uint256 ruling;
        bool executed;
    }
    
    mapping(uint256 => Dispute) public disputes;
    uint256 public disputeCount;
    uint256 public constant ARBITRATION_COST = 0.001 ether; // Cheap for testing
    
    event DisputeCreation(uint256 indexed _disputeID, address indexed _arbitrable);
    
    function arbitrationCost(bytes calldata) external pure returns (uint256) {
        return ARBITRATION_COST;
    }
    
    function createDispute(uint256 _choices, bytes calldata) external payable returns (uint256 disputeID) {
        require(msg.value >= ARBITRATION_COST, "Insufficient fee");
        
        disputeID = disputeCount++;
        disputes[disputeID] = Dispute({
            arbitrable: msg.sender,
            choices: _choices,
            ruling: 0,
            executed: false
        });
        
        emit DisputeCreation(disputeID, msg.sender);
        
        return disputeID;
    }
    
    function disputeStatus(uint256 _disputeID) external view returns (uint256) {
        if (disputes[_disputeID].executed) return 2; // Solved
        if (disputes[_disputeID].arbitrable != address(0)) return 0; // Waiting
        return 1; // Appealable (not used)
    }
    
    // Test function to simulate ruling
    function executeRuling(uint256 _disputeID, uint256 _ruling) external {
        require(disputes[_disputeID].arbitrable != address(0), "Invalid dispute");
        require(!disputes[_disputeID].executed, "Already executed");
        require(_ruling <= disputes[_disputeID].choices, "Invalid ruling");
        
        disputes[_disputeID].ruling = _ruling;
        disputes[_disputeID].executed = true;
        
        // Call rule() on the arbitrable contract
        IArbitrable(disputes[_disputeID].arbitrable).rule(_disputeID, _ruling);
    }
}

interface IArbitrable {
    function rule(uint256 _disputeID, uint256 _ruling) external;
}