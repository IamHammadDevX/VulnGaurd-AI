@{
    "code" = "pragma solidity ^0.8.0; contract VulnerableBank { mapping(address => uint256) public balances; function withdraw(uint256 amount) public { require(balances[msg.sender] >= amount); (bool success, ) = msg.sender.call{value: amount}(""); require(success); balances[msg.sender] -= amount; } }"
    "contractName" = "VulnerableBank"
} | ConvertTo-Json | Out-File scan_payload.json -Encoding UTF8

Write-Host "Payload saved. Sending request..."

$response = curl.exe -X POST http://localhost:8080/api/scan `
  -H "Content-Type: application/json" `
  -d "@scan_payload.json" `
  --max-time 120

$result = $response | ConvertFrom-Json
Write-Host "Response:"
Write-Host ($result | ConvertTo-Json -Depth 10)
