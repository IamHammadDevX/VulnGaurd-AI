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

  // Reentrancy + unchecked external calls within function blocks.
  for (const fn of functions) {
    const extRegex = /(\.call\s*\{|\.call\s*\(|\.send\s*\(|\.transfer\s*\()/;
    const updateRegex = /([A-Za-z0-9_\.\]\[)]+\s*([+\-*/]?=))/;
    const extIdx = firstLineMatching(fn.lines, extRegex);
    const updateIdx = firstLineMatching(fn.lines, updateRegex);

    if (extIdx !== null && updateIdx !== null && extIdx < updateIdx) {
      const line = fn.startLine + extIdx;
      push({
        type: "reentrancy",
        severity: "CRITICAL",
        swc_id: "SWC-107",
        line_number: line,
        affected_lines: `line ${line}`,
        affected_functions: fn.name,
        title: `Potential reentrancy in ${fn.name}()` ,
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

  // tx.origin usage
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

  // delegatecall usage
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

  // Weak randomness heuristics
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
        recommendation: "Use secure randomness sources (e.g., VRF) instead of block values.",
      });
    }
  });

  const risk_score = calcRisk(vulnerabilities);
  const targetName = contractName || "the contract";
  const summary = vulnerabilities.length === 0
    ? `No deterministic high-confidence issues were detected in ${targetName}. Manual review is still recommended.`
    : `Static fallback analysis detected ${vulnerabilities.length} potential issue(s) in ${targetName}. Manual confirmation is recommended.`;

  return {
    vulnerabilities,
    risk_score,
    summary,
  };
}
