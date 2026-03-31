$code = @"
pragma solidity ^0.8.0;
contract VulnerableBank {
    mapping(address => uint256) public balances;
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount;
    }
}
"@

$payload = @{
    code = $code
    contractName = "VulnerableBank"
} | ConvertTo-Json

$ProgressPreference = 'SilentlyContinue'

Write-Host "Sending scan request..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/scan" `
      -Method POST `
      -Headers @{ "Content-Type" = "application/json" } `
      -Body $payload `
      -TimeoutSec 150 `
      -SkipHttpErrorCheck
    
    Write-Host ""
    Write-Host "=== RESPONSE ==="
    Write-Host "Status: $($response.StatusCode)"
    Write-Host ""
    Write-Host "Body:"
    $response.Content
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
