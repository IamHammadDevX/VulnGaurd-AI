import fetch from "node-fetch"; // or use global fetch if available
import { readFileSync } from "fs";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  const envFile = readFileSync(".env", "utf-8");
  const match = envFile.match(/OPENROUTER_API_KEY=(.+)/);
  if (!match) {
    console.error("OPENROUTER_API_KEY not found in .env");
    process.exit(1);
  }
  process.env.OPENROUTER_API_KEY = match[1].trim();
}

const code = `pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount; // Reentrancy bug!
    }
}`;

const systemPrompt = `You are a Solidity security auditor. Respond ONLY with valid JSON. No markdown. No text.`;

const userPrompt = `Analyze this contract for vulnerabilities:

${code}

Respond with JSON: { "vulnerabilities": [ { "type": "string", "severity": "CRITICAL|HIGH|MEDIUM|LOW" } ], "total": number }`;

(async () => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "VulnGuard Test",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        max_tokens: 2048,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      }),
    });

    const data = (await response.json());
    console.log("Status:", response.status);
    console.log("Raw response:");
    console.log(JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]?.message?.content) {
      console.log("\n\nAI Response Text:");
      console.log(data.choices[0].message.content);

      // Try to extract JSON
      const text = data.choices[0].message.content;
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          console.log("\n\nParsed JSON:");
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log("\n\nFailed to parse JSON:", e.message);
        }
      } else {
        console.log("\n\nNo JSON found in response");
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
})();
