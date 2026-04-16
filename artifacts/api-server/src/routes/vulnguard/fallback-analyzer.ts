type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type FallbackVulnerability = {
  id: number;
  type: string;
  severity: Severity;
  swc_id: string | null;
  line_number: number | null;
  affected_lines: string | null;
  affected_functions: string | null;
  title: string;
  description: string;
  technical_risk: string;
  attack_scenario: string | null;
  impact: string | null;
  vulnerable_code: string | null;
  fixed_code: string | null;
  recommendation: string;
};

export type FallbackAnalysis = {
  vulnerabilities: FallbackVulnerability[];
  risk_score: number;
  summary: string;
};

function severityScore(sev: Severity): number {
  if (sev === "CRITICAL") return 35;
  if (sev === "HIGH") return 22;
  if (sev === "MEDIUM") return 12;
  return 6;
}

function calcRisk(vulnerabilities: FallbackVulnerability[]): number {
  if (vulnerabilities.length === 0) return 0;

  const score = vulnerabilities.reduce((sum, vuln) => sum + severityScore(vuln.severity), 0);
  return Math.min(98, Math.max(8, score));
}

function makeVulnerability(input: Omit<FallbackVulnerability, "id">, id: number): FallbackVulnerability {
  return {
    id,
    ...input,
  };
}

type FunctionBlock = {
  name: string;
  startLine: number;
  endLine: number;
  lines: string[];
};

function extractFunctionBlocks(code: string): FunctionBlock[] {
  const lines = code.split(/\r?\n/);
  const blocks: FunctionBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fnMatch = line.match(/\bfunction\s+([A-Za-z0-9_]+)\s*\(/);
    if (!fnMatch) continue;

    let braceDepth = 0;
    let started = false;
    let end = i;

    for (let j = i; j < lines.length; j++) {
      const current = lines[j];
      for (const ch of current) {
        if (ch === "{") {
          braceDepth++;
          started = true;
        }
        if (ch === "}") {
          braceDepth--;
        }
      }

      if (started && braceDepth <= 0) {
        end = j;
        break;
      }
    }

    blocks.push({
      name: fnMatch[1],
      startLine: i + 1,
      endLine: end + 1,
      lines: lines.slice(i, end + 1),
    });

    i = Math.max(i, end);
  }

  return blocks;
}

function firstLineMatching(lines: string[], regex: RegExp): number | null {
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) return i;
  }
  return null;
}

function isStateMutationLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Skip control/guard lines that often include comparisons (>=, <=, ==, !=).
  if (/^(require|assert|if|while|for)\s*\(/.test(trimmed)) return false;

  // ++ / -- are clear mutation operations.
  if (/\+\+|--/.test(trimmed)) return true;

  // Match real assignment operators while avoiding comparison operators.
  // Examples matched: a = 1, x += 1, balances[msg.sender] -= amount
  const assignment = /(^|[^<>=!])([A-Za-z_][A-Za-z0-9_\.\[\]]*)\s*(\+=|-=|\*=|\/=|%=|=)/;
  if (!assignment.test(trimmed)) return false;

  // Avoid local variable declarations so we focus on state changes.
  if (/^(uint|int|address|bool|string|bytes\d*|bytes|mapping|struct|enum)\b/.test(trimmed)) {
    return false;
  }

  return true;
}

function firstMutationLine(lines: string[]): number | null {
  for (let i = 0; i < lines.length; i++) {
    if (isStateMutationLine(lines[i])) return i;
  }
  return null;
}

export function analyzeContractFallback(code: string, contractName?: string): FallbackAnalysis {
  const vulnerabilities: FallbackVulnerability[] = [];
  const sourceLines = code.split(/\r?\n/);
  const functions = extractFunctionBlocks(code);

  const push = (v: Omit<FallbackVulnerability, "id">) => {
    const duplicate = vulnerabilities.find(
      (x) => x.type === v.type && x.line_number === v.line_number,
    );
    if (!duplicate) vulnerabilities.push(makeVulnerability(v, vulnerabilities.length + 1));
  };

  // Check for security imports and patterns
  const hasReentrancyGuard = /ReentrancyGuard|nonReentrant/.test(code);
  const hasOpenZeppelin = /from\s+['"]\s*@openzeppelin\/contracts/.test(code);
  const hasSafeERC20 = /SafeERC20|safeTransfer|safeTransferFrom/.test(code);
  const isSolidity0_8Plus = /pragma\s+solidity\s+\^0\.8|pragma\s+solidity\s+>=0\.8/.test(code);

  // ════════════════════════════════════════════════════════════════════════════
  // 1. REENTRANCY - Only flag if external call + state mutation without guard
  // ════════════════════════════════════════════════════════════════════════════
  for (const fn of functions) {
    const hasNonReentrantModifier = /nonReentrant/.test(fn.lines[0]);
    if (hasNonReentrantModifier) continue; // Skip if protected
    
    const extRegex = /(\.call\s*\{|\.call\s*\(|\.send\s*\(|\.transfer\s*\()/;
    const extIdx = firstLineMatching(fn.lines, extRegex);
    const updateIdx = firstMutationLine(fn.lines);

    if (extIdx !== null && updateIdx !== null && extIdx < updateIdx && !hasReentrancyGuard) {
      const line = fn.startLine + extIdx;
      push({
        type: "reentrancy",
        severity: "CRITICAL",
        swc_id: "SWC-107",
        line_number: line,
        affected_lines: `line ${line}`,
        affected_functions: fn.name,
        title: `Potential reentrancy in ${fn.name}()`,
        description: "External call appears before state update without reentrancy protection.",
        technical_risk: "Attacker contract can re-enter before state is updated.",
        attack_scenario: "Attacker re-enters function before balance is deducted and drains funds.",
        impact: "Loss of contract funds.",
        vulnerable_code: sourceLines[line - 1]?.trim() ?? null,
        fixed_code: null,
        recommendation: "Use nonReentrant modifier from OpenZeppelin ReentrancyGuard.",
      });
    }

    // Only flag unchecked external call if it's a low-level call
    if (extIdx !== null && fn.lines[extIdx]?.includes(".call")) {
      const hasSuccessCheck = fn.lines.some((l) => /require\s*\(\s*success\s*\)|if\s*\(\s*success\s*\)/.test(l));
      if (!hasSuccessCheck) {
        const line = fn.startLine + extIdx;
        push({
          type: "unchecked-external-call",
          severity: "HIGH",
          swc_id: "SWC-104",
          line_number: line,
          affected_lines: `line ${line}`,
          affected_functions: fn.name,
          title: `Unchecked external call in ${fn.name}()`,
          description: "Low-level .call() return value not validated.",
          technical_risk: "Failed call is silently ignored.",
          attack_scenario: "Attacker creates failing call and proceeds with logic.",
          impact: "Logic bypass and accounting errors.",
          vulnerable_code: sourceLines[line - 1]?.trim() ?? null,
          fixed_code: null,
          recommendation: "Always check (bool success) and revert if false.",
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. TX.ORIGIN USAGE IN AUTHORIZATION - Real issue, always flag
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\btx\.origin\s*==|auth.*tx\.origin|require.*tx\.origin/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "tx-origin-auth",
        severity: "HIGH",
        swc_id: "SWC-115",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "tx.origin used for authorization",
        description: "tx.origin is used for access control.",
        technical_risk: "Can be bypassed with phishing proxy contracts.",
        attack_scenario: "Attacker contract calls victim function, tx.origin is original user.",
        impact: "Unauthorized function execution.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Use msg.sender instead of tx.origin.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. DELEGATECALL USAGE - Only flag if target is not validated/hardcoded
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\bdelegatecall\s*\(/.test(line)) {
      // Check if next line or surrounding code validates the target
      const context = sourceLines.slice(Math.max(0, i - 2), Math.min(sourceLines.length, i + 3)).join("\n");
      const hasValidation = /require|assert|address\(0\)/.test(context);
      const isHardcoded = /delegatecall\s*\(\s*"0x[0-9a-fA-F]{40}"/.test(line);
      
      if (!hasValidation && !isHardcoded) {
        const lineNo = i + 1;
        push({
          type: "delegatecall-risk",
          severity: "CRITICAL",
          swc_id: "SWC-112",
          line_number: lineNo,
          affected_lines: `line ${lineNo}`,
          affected_functions: null,
          title: "Unsafe delegatecall detected",
          description: "delegatecall to unvalidated target without address verification.",
          technical_risk: "Uncontrolled implementation can steal contract storage/funds.",
          attack_scenario: "Attacker provides malicious implementation address.",
          impact: "Complete contract compromise.",
          vulnerable_code: line.trim(),
          fixed_code: null,
          recommendation: "Validate delegatecall target with require(). Use established proxy patterns.",
        });
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. WEAK RANDOMNESS - Only flag active randomness usage, not just presence
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    // Only flag if block.timestamp/number is used in actual randomness generation
    if (/\b(block\.timestamp|blockhash|block\.number)\s*[+\-*%]|uint.*%\s*(block\.(timestamp|number))|\bhash\s*\(.*block\.(timestamp|number)/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "weak-randomness",
        severity: "MEDIUM",
        swc_id: "SWC-120",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "Weak randomness source",
        description: "Block values used for randomness are predictable.",
        technical_risk: "Miners can bias randomness outcome.",
        attack_scenario: "Attacker influences block properties for favorable randomness.",
        impact: "Biased random outcomes in games/lotteries.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Use Chainlink VRF or other oracle for true randomness.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. UNCHECKED MATH - Only flag Solidity < 0.8 without SafeMath
  // ════════════════════════════════════════════════════════════════════════════
  if (!isSolidity0_8Plus) {
    sourceLines.forEach((line, i) => {
      if (/\b(balances|amounts|totals|supply|total)\[.*\]\s*[+\-]\s*=|=\s*.*\b(balances|amounts)\[.*\]\s*[+\-]/.test(line)) {
        if (!line.includes("SafeMath") && !line.includes(".add(") && !line.includes(".sub(")) {
          const lineNo = i + 1;
          push({
            type: "unchecked-math",
            severity: "HIGH",
            swc_id: "SWC-101",
            line_number: lineNo,
            affected_lines: `line ${lineNo}`,
            affected_functions: null,
            title: "Unchecked math operation (Solidity < 0.8)",
            description: "Arithmetic on state without SafeMath.",
            technical_risk: "Integer overflow/underflow possible.",
            attack_scenario: "Attacker overflows balance to gain infinite tokens.",
            impact: "Infinite minting or fund loss.",
            vulnerable_code: line.trim(),
            fixed_code: null,
            recommendation: "Use SafeMath library or upgrade to Solidity 0.8+.",
          });
        }
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 6. DANGEROUS TIMESTAMP USAGE - Only flag equality checks
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    // Only flag strict equality with timestamp
    if (/\b(block\.timestamp|now)\s*==\s*|==\s*(block\.timestamp|now)\b/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "timestamp-dependence",
        severity: "MEDIUM",
        swc_id: "SWC-116",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "Timestamp equality check",
        description: "Strict equality with block.timestamp is easily manipulated.",
        technical_risk: "Miners can adjust timestamp within ~15 second range.",
        attack_scenario: "Attacker waits for favorable timestamp to match condition.",
        impact: "Logic bypass or transaction ordering manipulation.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Use >= or <= instead of ==. Consider block numbers for critical timing.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. MISSING ACCESS CONTROL - Only flag truly public state-changing functions
  // ════════════════════════════════════════════════════════════════════════════
  for (const fn of functions) {
    const fnDecl = fn.lines[0];
    const isPublic = /\bpublic\b|\bexternal\b/.test(fnDecl);
    const isStateChanging = fn.lines.some((l) => isStateMutationLine(l));
    const hasRequire = fn.lines.some((l) => /\brequire\s*\(/.test(l));
    const hasModifier = /\b(onlyOwner|onlyRole|nonReentrant|onlyMinter|onlyBurner)\b/.test(fnDecl);
    
    if (isPublic && isStateChanging && !hasRequire && !hasModifier && !fn.name.startsWith("_")) {
      // Only flag if no require/modifier AND name suggests sensitive operation
      if (/withdraw|transfer|mint|burn|set|remove|destroy|kill|pause|unpause|admin|owner|approve/.test(fn.name)) {
        push({
          type: "missing-access-control",
          severity: "CRITICAL",
          swc_id: "SWC-105",
          line_number: fn.startLine,
          affected_lines: `lines ${fn.startLine}-${fn.endLine}`,
          affected_functions: fn.name,
          title: `Unrestricted ${fn.name}()`,
          description: "Public state-changing function with no access control.",
          technical_risk: "Anyone can call sensitive function.",
          attack_scenario: "Attacker calls withdraw(), mint(), or setOwner().",
          impact: "Fund theft or contract takeover.",
          vulnerable_code: fnDecl.trim(),
          fixed_code: null,
          recommendation: "Add require() or onlyOwner modifier.",
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 8. SELFDESTRUCT - Always critical if not properly guarded
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\bselfdestruct\s*\(|suicide\s*\(/.test(line)) {
      // Check if previous lines have require/modifier guard
      const context = sourceLines.slice(Math.max(0, i - 5), i + 1).join("\n");
      const hasGuard = /require|onlyOwner|onlyRole|msg\.sender|modifier/.test(context);
      
      const lineNo = i + 1;
      push({
        type: "selfdestruct-usage",
        severity: hasGuard ? "MEDIUM" : "CRITICAL",
        swc_id: "SWC-106",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: hasGuard ? "Protected selfdestruct" : "Unprotected selfdestruct",
        description: "Contract can be destroyed.",
        technical_risk: "Permanent loss of contract functionality.",
        attack_scenario: "Attacker calls selfdestruct and drains funds.",
        impact: "Contract destruction.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Restrict selfdestruct with require(msg.sender == owner). Consider pausing instead.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // CALCULATE RISK SCORE
  // ════════════════════════════════════════════════════════════════════════════
  const risk_score = calcRisk(vulnerabilities);
  const targetName = contractName || "the contract";
  const issueCount = vulnerabilities.length;
  
  const criticalCount = vulnerabilities.filter((v) => v.severity === "CRITICAL").length;
  const highCount = vulnerabilities.filter((v) => v.severity === "HIGH").length;
  const mediumCount = vulnerabilities.filter((v) => v.severity === "MEDIUM").length;
  const lowCount = vulnerabilities.filter((v) => v.severity === "LOW").length;
  
  const summary = issueCount === 0
    ? `No vulnerabilities detected in ${targetName}. Code appears secure.`
    : `Static analysis detected ${issueCount} issue(s): ${criticalCount} critical, ${highCount} high, ${mediumCount} medium, ${lowCount} low.`;

  return {
    vulnerabilities,
    risk_score,
    summary,
  };
}
