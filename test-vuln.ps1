$vulnCode = @'
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount; // Reentrancy bug!
    }
}
'@

$bodyObj = @{
    code = $vulnCode
    contractName = "VulnerableBank"
} | ConvertTo-Json

Write-Host "Sending scan request..."
Write-Host "Code length: $($vulnCode.Length) chars"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/vulnguard/scan" `
      -Method POST `
      -Headers @{ "Content-Type" = "application/json" } `
      -Body $bodyObj

    $result = $response.Content | ConvertFrom-Json
    Write-Host ""
    Write-Host "=== SCAN RESULTS ==="
    Write-Host "Success: $($result.success)"
    Write-Host "Risk Score: $($result.risk_score)"
    Write-Host "Total Vulnerabilities Found: $($result.total_vulnerabilities)"
    Write-Host "Summary: $($result.summary)"
    Write-Host ""
    
    if ($result.vulnerabilities.Count -gt 0) {
        Write-Host "VULNERABILITIES DETECTED:"
        foreach ($vuln in $result.vulnerabilities) {
            Write-Host ""
            Write-Host "  [ID $($vuln.id)] - $($vuln.type) ($(vuln.severity))"
            Write-Host "  Title: $($vuln.title)"
            Write-Host "  SWC: $($vuln.swc_id)"
            Write-Host "  Line: $($vuln.line_number)"
            Write-Host "  Description: $($vuln.description)"
        }
    } else {
        Write-Host "NO VULNERABILITIES DETECTED"
    }
} catch {
    Write-Host "ERROR: $_"
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)"
}
