$SolidityCode = @"
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    constructor() payable {}
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // REENTRANCY VULNERABILITY: External call before state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        // State update happens AFTER external call - attacker can re-enter
        balances[msg.sender] -= amount;
    }
    
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}
"@

$payload = @{
    code = $SolidityCode
    contractName = "VulnerableBank"
} | ConvertTo-Json

Write-Host "Testing scan endpoint with Solidity vulnerability..."
Write-Host "=================================================="
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/scan" `
      -Method POST `
      -Headers @{ "Content-Type" = "application/json" } `
      -Body $payload `
      -TimeoutSec 120
    
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "Risk Score: $($result.risk_score)/100"
    Write-Host "Vulnerabilities Found: $($result.total_vulnerabilities)"
    Write-Host "Summary: $($result.summary)"
    Write-Host ""
    
    if ($result.vulnerabilities.Count -gt 0) {
        Write-Host "DETECTED VULNERABILITIES:"
        foreach ($vuln in $result.vulnerabilities) {
            Write-Host ""
            Write-Host "[$($vuln.severity)] $($vuln.title)"
            Write-Host "  Type: $($vuln.type)"
            Write-Host "  Description: $($vuln.description)"
        }
    } else {
        Write-Host "WARNING: No vulnerabilities detected (expected to find reentrancy)"
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
