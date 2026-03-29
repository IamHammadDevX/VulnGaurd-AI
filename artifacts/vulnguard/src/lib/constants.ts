export const EXAMPLE_CONTRACTS = {
  VulnerableBank: {
    name: "VulnerableBank",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    // VULNERABILITY: Reentrancy
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        
        balances[msg.sender] -= amount; // WRONG ORDER!
    }
    
    // VULNERABILITY: Integer Overflow (pre-0.8.0 equivalent logic issue)
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // VULNERABILITY: Access Control
    function emergencyWithdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    // VULNERABILITY: Logic Error
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] > amount); // Should be >=
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}`,
  },
  InsecureToken: {
    name: "InsecureToken",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract InsecureToken {
    mapping(address => uint256) public balances;
    address public owner;
    
    constructor() { 
        owner = msg.sender; 
        balances[owner] = 1000000; 
    }
    
    function transfer(address to, uint256 amount) public {
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    
    function mint(address to, uint256 amount) public {
        balances[to] += amount;
    }
    
    function setOwner(address newOwner) public {
        owner = newOwner;
    }
}`,
  },
  SafeContract: {
    name: "SafeBank",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SafeBank is ReentrancyGuard, Ownable {
    mapping(address => uint256) private balances;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}`,
  }
};
