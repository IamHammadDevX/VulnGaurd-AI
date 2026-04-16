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

  // ════════════════════════════════════════════════════════════════════════════
  // 1. REENTRANCY + UNCHECKED EXTERNAL CALLS
  // ════════════════════════════════════════════════════════════════════════════
  for (const fn of functions) {
    const extRegex = /(\.call\s*\{|\.call\s*\(|\.send\s*\(|\.transfer\s*\()/;
    const extIdx = firstLineMatching(fn.lines, extRegex);
    const updateIdx = firstMutationLine(fn.lines);

    if (extIdx !== null && updateIdx !== null && extIdx < updateIdx) {
      const line = fn.startLine + extIdx;
      push({
        type: "reentrancy",
        severity: "CRITICAL",
        swc_id: "SWC-107",
        line_number: line,
        affected_lines: `line ${line}`,
        affected_functions: fn.name,
        title: `Potential reentrancy in ${fn.name}()`,
        description: "External value transfer/call appears before state update, enabling possible reentrant execution.",
        technical_risk: "State is mutated after an external interaction, violating checks-effects-interactions ordering.",
        attack_scenario: "An attacker contract re-enters the function before balance/state is reduced and drains funds.",
        impact: "Loss of contract funds and broken accounting invariants.",
        vulnerable_code: sourceLines[line - 1]?.trim() ?? null,
        fixed_code: null,
        recommendation: "Apply checks-effects-interactions pattern and use a reentrancy guard before external calls.",
      });
    }

    if (extIdx !== null) {
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
          description: "Low-level external call result is not validated.",
          technical_risk: "Silent call failures may leave state inconsistent and break invariants.",
          attack_scenario: "A failed external call is ignored and logic proceeds as if transfer succeeded.",
          impact: "Unexpected logic execution and potential fund/accounting inconsistencies.",
          vulnerable_code: sourceLines[line - 1]?.trim() ?? null,
          fixed_code: null,
          recommendation: "Validate return values from low-level calls and revert on failure.",
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. TX.ORIGIN USAGE
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\btx\.origin\b/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "tx-origin-auth",
        severity: "HIGH",
        swc_id: "SWC-115",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "tx.origin used for authorization",
        description: "tx.origin can be manipulated through phishing-style proxy calls.",
        technical_risk: "Authorization based on tx.origin is not safe for contract-based call chains.",
        attack_scenario: "Attacker contract triggers victim function while preserving origin of privileged user.",
        impact: "Privilege escalation and unauthorized state-changing actions.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Use msg.sender-based authorization and role checks instead of tx.origin.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. DELEGATECALL USAGE
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\bdelegatecall\s*\(/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "delegatecall-risk",
        severity: "CRITICAL",
        swc_id: "SWC-112",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "delegatecall usage detected",
        description: "delegatecall executes external code in caller storage context.",
        technical_risk: "Unsafe target/address control can corrupt storage and seize contract ownership.",
        attack_scenario: "Malicious implementation code overwrites sensitive state variables in caller contract.",
        impact: "Complete contract compromise, funds loss, and privilege takeover.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Restrict delegatecall targets strictly and validate implementation addresses.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. WEAK RANDOMNESS
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\b(block\.timestamp|blockhash\s*\(|block\.number|now)\b/.test(line) && /random|rand|%/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "weak-randomness",
        severity: "MEDIUM",
        swc_id: "SWC-120",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "Predictable randomness source",
        description: "On-chain values like timestamp/blockhash are manipulable or predictable.",
        technical_risk: "Miners/validators can bias outputs derived from public chain state.",
        attack_scenario: "Adversary influences inclusion/timing to improve odds in lotteries/games.",
        impact: "Economic exploitation and unfair outcome manipulation.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Use secure randomness sources (e.g., Chainlink VRF) instead of block values.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. UNCHECKED MATH OPERATIONS (Integer Overflow/Underflow)
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    // Look for math operations without safe checks (not using SafeMath, OpenZeppelin)
    if (/[+\-*/%]\s*=|=[^=].*[+\-*/%](?!=)/.test(line) && !line.includes("SafeMath") && !line.includes(".add(") && !line.includes(".sub(")) {
      // Only flag if it looks like numeric operation on state variables
      if (/\b(uint|int)[0-9]*\b|balances\[|amounts\[|totals\[|supply/.test(line)) {
        const lineNo = i + 1;
        push({
          type: "unchecked-math",
          severity: "HIGH",
          swc_id: "SWC-101",
          line_number: lineNo,
          affected_lines: `line ${lineNo}`,
          affected_functions: null,
          title: "Potential integer overflow/underflow",
          description: "Arithmetic operation without explicit bounds checking or SafeMath library.",
          technical_risk: "Values can wrap around causing logic errors and unauthorized fund movement.",
          attack_scenario: "Attacker manipulates input to cause wrap-around and increase balance beyond actual deposit.",
          impact: "Fund loss, permission bypass, and incorrect accounting.",
          vulnerable_code: line.trim(),
          fixed_code: null,
          recommendation: "Use SafeMath library (Solidity < 0.8) or compiler checked arithmetic (Solidity >= 0.8).",
        });
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. TIMESTAMP DEPENDENCE / TIME MANIPULATION
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\b(block\.timestamp|now)\b/.test(line) && /\s*==\s*|\s*<\s*|\s*>\s*|\s*<=\s*|\s*>=\s*/.test(line)) {
      if (!/comment|\/\/|\/\*/.test(line)) {
        const lineNo = i + 1;
        push({
          type: "timestamp-dependence",
          severity: "MEDIUM",
          swc_id: "SWC-116",
          line_number: lineNo,
          affected_lines: `line ${lineNo}`,
          affected_functions: null,
          title: "Timestamp dependency in critical logic",
          description: "Timestamp is used in time-sensitive comparisons that can be manipulated.",
          technical_risk: "Miners can adjust block timestamps within narrow ranges affecting logic flow.",
          attack_scenario: "Attacker mines block with timestamp favorable to their transaction.",
          impact: "Logic bypass, transaction ordering manipulation, deadline evasion.",
          vulnerable_code: line.trim(),
          fixed_code: null,
          recommendation: "Avoid strict timestamp equality; use blocks for time-critical operations or widen acceptable ranges.",
        });
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. MISSING ACCESS CONTROL / MISSING ONLYOWNER
  // ════════════════════════════════════════════════════════════════════════════
  for (const fn of functions) {
    const fnDecl = fn.lines[0];
    const isPublic = /\bpublic\b/.test(fnDecl);
    const isStateChanging = fn.lines.some((l) => isStateMutationLine(l));
    const hasAccessControl = fn.lines.some((l) => /\b(require|onlyOwner|onlyAuthorized|onlyRole)\b/.test(l));

    if (isPublic && isStateChanging && !hasAccessControl && !fn.name.startsWith("_")) {
      // Skip common harmless functions
      if (!/constructor|balanceOf|totalSupply|allowance|decimals|symbol|name/.test(fn.name)) {
        push({
          type: "missing-access-control",
          severity: "HIGH",
          swc_id: "SWC-105",
          line_number: fn.startLine,
          affected_lines: `lines ${fn.startLine}-${fn.endLine}`,
          affected_functions: fn.name,
          title: `Missing access control in ${fn.name}()`,
          description: "Public state-changing function lacks permission checks.",
          technical_risk: "Any external account can invoke sensitive operations, compromising contract invariants.",
          attack_scenario: "Attacker calls sensitive function (withdraw, transfer, setPrice) without authorization.",
          impact: "Fund theft, privilege escalation, state manipulation.",
          vulnerable_code: fnDecl.trim(),
          fixed_code: null,
          recommendation: "Add require() statements or modifiers (onlyOwner, onlyAuthorized) to restrict access.",
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 8. MISSING INPUT VALIDATION
  // ════════════════════════════════════════════════════════════════════════════
  for (const fn of functions) {
    const hasAddressParam = /\(.*address\s+\w+/.test(fn.lines[0]);
    const hasAmountParam = /\(.*uint\d*\s+\w+/.test(fn.lines[0]);
    const hasZeroCheck = fn.lines.some((l) => /require.*!=\s*0|require.*>\s*0|address\(0\)|msg\.sender/.test(l));

    if ((hasAddressParam || hasAmountParam) && !hasZeroCheck && fn.lines.length > 3) {
      if (!/modifier|constructor|view|pure|returns/.test(fn.lines[0])) {
        push({
          type: "missing-input-validation",
          severity: "MEDIUM",
          swc_id: "SWC-110",
          line_number: fn.startLine,
          affected_lines: `lines ${fn.startLine}-${fn.endLine}`,
          affected_functions: fn.name,
          title: `Insufficient input validation in ${fn.name}()`,
          description: "Function accepts parameters without validating critical conditions.",
          technical_risk: "Invalid inputs can cause logic errors, unauthorized actions, or fund loss.",
          attack_scenario: "Attacker passes address(0) or amount 0 to trigger unintended behavior.",
          impact: "Logic bypass, fund loss, incorrect accounting.",
          vulnerable_code: fn.lines[0].trim(),
          fixed_code: null,
          recommendation: "Add require() checks to validate non-zero addresses and positive amounts.",
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 9. UNSAFE TYPE CASTING
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\b(uint|int|address|bool)\s*\(|uint\d+\s*\(/.test(line) && /=|return/.test(line)) {
      const lineNo = i + 1;
      const hasSafeCheck = /require|assert|if/.test(sourceLines[i - 1] ?? "");
      if (!hasSafeCheck && !/comment|\/\/|\/\*/.test(line)) {
        push({
          type: "unsafe-casting",
          severity: "MEDIUM",
          swc_id: "SWC-101",
          line_number: lineNo,
          affected_lines: `line ${lineNo}`,
          affected_functions: null,
          title: "Unsafe type casting detected",
          description: "Type conversion without validation may cause data loss.",
          technical_risk: "Casting larger types to smaller types can truncate values silently.",
          attack_scenario: "Attacker provides value that truncates when cast, altering logic.",
          impact: "Incorrect calculations, fund accounting errors.",
          vulnerable_code: line.trim(),
          fixed_code: null,
          recommendation: "Validate values before casting; ensure they fit within target type bounds.",
        });
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 10. UNINITIALIZED VARIABLES / STATE
  // ════════════════════════════════════════════════════════════════════════════
  const stateVars = new Set<string>();
  sourceLines.forEach((line) => {
    const match = line.match(/\b(uint|int|address|bool|string)\s+(\w+)\s*;/);
    if (match) stateVars.add(match[2]);
  });

  for (const fn of functions) {
    const usedVars = new Set<string>();
    fn.lines.forEach((line) => {
      for (const varName of stateVars) {
        if (new RegExp(`\\b${varName}\\b`).test(line)) {
          usedVars.add(varName);
        }
      }
    });

    if (usedVars.size > 0) {
      const assignedVars = new Set<string>();
      fn.lines.forEach((line) => {
        for (const varName of usedVars) {
          if (new RegExp(`\\b${varName}\\s*=`).test(line)) {
            assignedVars.add(varName);
          }
        }
      });

      // If using state vars without assignment in function
      for (const varName of usedVars) {
        if (!assignedVars.has(varName) && /\+=|-=|\*=|\/=|\.push|\.add/.test(fn.lines.join("\n"))) {
          push({
            type: "uninitialized-state",
            severity: "MEDIUM",
            swc_id: "SWC-109",
            line_number: fn.startLine,
            affected_lines: `lines ${fn.startLine}-${fn.endLine}`,
            affected_functions: fn.name,
            title: `Potential use of uninitialized state in ${fn.name}()`,
            description: "State variable used without explicit initialization in function.",
            technical_risk: "Default values may cause incorrect logic flow if assumptions differ.",
            attack_scenario: "Attacker relies on default zero values to bypass checks.",
            impact: "Logic bypass, fund loss, incorrect balances.",
            vulnerable_code: fn.lines[0].trim(),
            fixed_code: null,
            recommendation: "Explicitly initialize all state before use; use constructor for setup.",
          });
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 11. MISSING EVENT LOGGING
  // ════════════════════════════════════════════════════════════════════════════
  for (const fn of functions) {
    const isPublic = /\bpublic\b/.test(fn.lines[0]);
    const isStateChanging = fn.lines.some((l) => isStateMutationLine(l));
    const hasEvent = fn.lines.some((l) => /emit\s+\w+/.test(l));

    if (isPublic && isStateChanging && !hasEvent && !fn.name.startsWith("_")) {
      if (!/constructor|view|pure/.test(fn.lines[0])) {
        push({
          type: "missing-event-logging",
          severity: "LOW",
          swc_id: "SWC-101",
          line_number: fn.startLine,
          affected_lines: `lines ${fn.startLine}-${fn.endLine}`,
          affected_functions: fn.name,
          title: `Missing event logging in ${fn.name}()`,
          description: "State-changing function does not emit events for off-chain monitoring.",
          technical_risk: "Off-chain systems cannot track state changes, reducing observability.",
          attack_scenario: "Malicious transactions occur without emitted events for detection.",
          impact: "Reduced auditability and monitoring capability.",
          vulnerable_code: fn.lines[0].trim(),
          fixed_code: null,
          recommendation: "Emit appropriate events for all state-changing operations.",
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 12. ASSEMBLY USAGE (Low-level operations)
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\bassembly\s*\{|yul/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "assembly-usage",
        severity: "MEDIUM",
        swc_id: "SWC-101",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "Assembly/Yul code detected",
        description: "Low-level assembly operations bypass safety checks.",
        technical_risk: "Assembly code is difficult to audit and prone to subtle errors.",
        attack_scenario: "Attacker exploits unsafe assembly logic to manipulate memory/storage.",
        impact: "Memory corruption, storage tampering, fund loss.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Minimize assembly usage; prefer high-level Solidity. Audit assembly thoroughly.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 13. MISSING RETURN VALUE CHECKS ON EXTERNAL CALLS
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\.transferFrom|\.approve|\.safeTransfer|\.transfer/.test(line) && !line.includes("require") && !line.includes("assert")) {
      const lineNo = i + 1;
      push({
        type: "unchecked-transfer",
        severity: "MEDIUM",
        swc_id: "SWC-104",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "Unchecked transfer return value",
        description: "ERC20 transfer operations may fail silently without being checked.",
        technical_risk: "Transfer failures are ignored, causing accounting mismatches.",
        attack_scenario: "Attacker uses non-standard ERC20 that returns false instead of reverting.",
        impact: "Fund accounting inconsistency, balance loss.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Wrap transfers in require() or use SafeERC20 library.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 14. FUNCTION VISIBILITY ISSUES
  // ════════════════════════════════════════════════════════════════════════════
  for (const fn of functions) {
    const fnDecl = fn.lines[0];
    const hasVisibility = /\b(public|private|internal|external)\b/.test(fnDecl);
    if (!hasVisibility && !fn.name.startsWith("_")) {
      push({
        type: "missing-visibility",
        severity: "LOW",
        swc_id: "SWC-108",
        line_number: fn.startLine,
        affected_lines: `line ${fn.startLine}`,
        affected_functions: fn.name,
        title: `Missing visibility modifier in ${fn.name}()`,
        description: "Function lacks explicit visibility modifier; defaults to internal (Solidity <0.5) or public (>=0.5).",
        technical_risk: "Unexpected function exposure if compiler version differs.",
        attack_scenario: "Attacker calls function assumed private due to version mismatch.",
        impact: "Unintended function accessibility.",
        vulnerable_code: fnDecl.trim(),
        fixed_code: null,
        recommendation: "Always explicitly specify function visibility (public, private, internal, external).",
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 15. SELFDESTRUCT USAGE
  // ════════════════════════════════════════════════════════════════════════════
  sourceLines.forEach((line, i) => {
    if (/\bselfdestruct|suicide/.test(line)) {
      const lineNo = i + 1;
      push({
        type: "selfdestruct-usage",
        severity: "HIGH",
        swc_id: "SWC-106",
        line_number: lineNo,
        affected_lines: `line ${lineNo}`,
        affected_functions: null,
        title: "selfdestruct usage detected",
        description: "Contract can be destroyed, sending funds to arbitrary address.",
        technical_risk: "Unprotected selfdestruct can destroy contract and send funds to attacker.",
        attack_scenario: "Attacker calls selfdestruct (if public) or exploits it via other vuln to destroy contract.",
        impact: "Permanent contract destruction, fund loss.",
        vulnerable_code: line.trim(),
        fixed_code: null,
        recommendation: "Restrict selfdestruct access with modifiers; consider EIP-6780 alternatives.",
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FINALIZE RESULTS
  // ════════════════════════════════════════════════════════════════════════════
  const risk_score = calcRisk(vulnerabilities);
  const targetName = contractName || "the contract";
  const issueCount = vulnerabilities.length;
  const summary = issueCount === 0
    ? `No deterministic high-confidence issues were detected in ${targetName}. Manual review is still recommended.`
    : `Static analysis detected ${issueCount} potential issue(s) in ${targetName}:
       ${vulnerabilities.filter((v) => v.severity === "CRITICAL").length} critical, 
       ${vulnerabilities.filter((v) => v.severity === "HIGH").length} high, 
       ${vulnerabilities.filter((v) => v.severity === "MEDIUM").length} medium, 
       ${vulnerabilities.filter((v) => v.severity === "LOW").length} low.
       Manual confirmation is recommended.`;

  return {
    vulnerabilities,
    risk_score,
    summary,
  };
}
