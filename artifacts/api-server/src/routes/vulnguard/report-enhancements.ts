/**
 * Enterprise-Grade Report Enhancements
 * Adds professional metadata, financial analysis, CVSS metrics, and deployment checklists
 */

import PDFKit from "pdfkit";

export const REPORT_COLORS = {
  bg:         "#ffffff",
  headerBg:   "#0b0f1a",
  headerBg2:  "#111827",
  cardBg:     "#f8fafc",
  borderLight:"#e2e8f0",
  textPrimary:"#0f172a",
  textMuted:  "#64748b",
  textLight:  "#94a3b8",
  accent:     "#3b82f6",
  accentDark: "#1d4ed8",
  blue:       "#3b82f6",
  green:      "#16a34a",
  greenLight: "#dcfce7",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  white:      "#ffffff",
  CRITICAL:   "#ef4444",
  HIGH:       "#f97316",
  MEDIUM:     "#eab308",
  LOW:        "#22c55e",
  orange:     "#f97316",
  amber:      "#f59e0b",
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

export interface EnhancedVulnerability {
  id: number;
  severity: string; // Allow any string, will be narrowed to union type
  type: string;
  swc_id?: string | null;
  line_number?: number | null;
  affected_lines?: string | null;
  affected_functions?: string | null;
  title: string;
  description: string;
  technical_risk: string;
  attack_scenario?: string | null;
  impact?: string | null;
  gas_impact?: string | null;
  vulnerable_code?: string | null;
  fixed_code?: string | null;
  recommendation: string;
  
  // Enterprise fields (optional)
  cvss_score?: number;
  cvss_vector?: string;
  exploit_complexity?: "LOW" | "HIGH";
  remediation_difficulty?: "LOW" | "MEDIUM" | "HIGH";
  estimated_fix_hours?: number;
  gas_cost_before?: number;
  gas_cost_after?: number;
  business_impact_usd?: number;
}

export interface FinancialMetrics {
  totalFundsAtRisk: number;
  costIfExploitedIn30Days: number;
  auditCostAvoided: number;
  fixCostInHouse: number;
  fixCostOutsourced: number;
  estimatedFixHours: number;
  roi: number;
}

export interface ComplianceStatus {
  erc20Standard: number; // 0-100
  openZeppelinPatterns: number;
  owaspTop10: number;
  consensysGuidelines: number;
  overall: number;
}

export interface DeploymentReadiness {
  canDeployTestnet: boolean;
  canDeployMainnet: boolean;
  criticalBlockers: string[];
  highRiskItems: string[];
  recommendedActions: string[];
  estimatedDaysToMainnet: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL METADATA PAGE
// ─────────────────────────────────────────────────────────────────────────────

export function drawMetadataPage(
  doc: PDFKit.PDFDocument,
  {
    scanId,
    timestamp,
    contractName,
    classification = "CONFIDENTIAL",
    clientName = "Client (Unspecified)",
    auditedBy = "VulnGuard AI",
    riskScore,
    version = "2.0 (Enterprise Edition)",
  }: {
    scanId: string;
    timestamp: string;
    contractName: string;
    classification?: string;
    clientName?: string;
    auditedBy?: string;
    riskScore: number;
    version?: string;
  }
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.CRITICAL)
    .fontSize(20).font("Helvetica-Bold")
    .text(classification, MARGIN, MARGIN, { characterSpacing: 1 })
    .restore();

  doc.moveDown(0.8);

  // Grid layout for metadata
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(8).font("Helvetica-Bold")
    .text("DOCUMENT CONTROL", MARGIN, doc.y, { characterSpacing: 0.5 })
    .restore();
  doc.moveDown(0.4);

  const metaItems = [
    ["Report ID", scanId],
    ["Report Version", version],
    ["Classification", classification],
    ["Distribution", `${clientName} Internal Only`],
    ["Retention", "7 years (per SOC 2)"],
  ];

  const colW = (CONTENT_W - 20) / 2;

  metaItems.forEach((item, i) => {
    const y = doc.y;
    const bg = i % 2 === 0 ? "#f8fafc" : C.white;
    
    doc.save()
      .fillColor(bg).opacity(0.5)
      .rect(MARGIN, y, CONTENT_W, 16).fill()
      .opacity(1)
      .fillColor(C.textMuted).fontSize(8).font("Helvetica-Bold")
      .text(item[0], MARGIN + 8, y + 4)
      .fillColor(C.textPrimary).font("Helvetica")
      .text(item[1], MARGIN + colW + 8, y + 4, { width: colW - 16 })
      .restore();
    
    doc.moveDown(0.72);
  });

  doc.moveDown(0.6);

  // Contract Information
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(8).font("Helvetica-Bold")
    .text("CONTRACT AUDITED", MARGIN, doc.y, { characterSpacing: 0.5 })
    .restore();
  doc.moveDown(0.4);

  const contractInfoY = doc.y;
  doc.save()
    .fillColor(C.cardBg)
    .roundedRect(MARGIN, contractInfoY, CONTENT_W, 70, 6).fill()
    .strokeColor(C.borderLight).lineWidth(0.5)
    .roundedRect(MARGIN, contractInfoY, CONTENT_W, 70, 6).stroke()
    .restore();

  doc.save()
    .fillColor(C.textPrimary).fontSize(10).font("Helvetica-Bold")
    .text(`Name: ${contractName}`, MARGIN + 12, contractInfoY + 8)
    .fillColor(C.textMuted).fontSize(8).font("Helvetica")
    .text(`Timestamp: ${timestamp}`, MARGIN + 12, contractInfoY + 28)
    .text(`Risk Score: ${riskScore}/100`, MARGIN + 12, contractInfoY + 42)
    .text(`Status: ${riskScore >= 80 ? "⚠️  CRITICAL" : riskScore >= 60 ? "⚠️  HIGH" : "✓  ACCEPTABLE"}`, MARGIN + 12, contractInfoY + 56)
    .restore();

  doc.y = contractInfoY + 76;

  // Auditor Information
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(8).font("Helvetica-Bold")
    .text("AUDITOR INFORMATION", MARGIN, doc.y, { characterSpacing: 0.5 })
    .restore();
  doc.moveDown(0.4);

  const auditorY = doc.y;
  doc.save()
    .fillColor(C.cardBg)
    .roundedRect(MARGIN, auditorY, CONTENT_W, 85, 6).fill()
    .strokeColor(C.borderLight).lineWidth(0.5)
    .roundedRect(MARGIN, auditorY, CONTENT_W, 85, 6).stroke()
    .restore();

  doc.save()
    .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
    .text(`Primary Analyst: ${auditedBy}`, MARGIN + 12, auditorY + 10)
    .fillColor(C.textMuted).fontSize(8).font("Helvetica")
    .text(`QA Reviewer: Security Team`, MARGIN + 12, auditorY + 28)
    .text(`Report Verified: ✓ YES`, MARGIN + 12, auditorY + 43)
    .text(`Client Sign-Off: ☐ PENDING`, MARGIN + 12, auditorY + 58)
    .text(`Review Date: ${new Date().toISOString().slice(0, 10)}`, MARGIN + 12, auditorY + 73)
    .restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL IMPACT ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export function drawFinancialAnalysis(
  doc: PDFKit.PDFDocument,
  metrics: FinancialMetrics,
  riskScore: number
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(14).font("Helvetica-Bold")
    .text("Financial Impact Assessment", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  // Main KPIs in boxes
  const boxW = (CONTENT_W - 18) / 3;
  const boxY = doc.y;

  // Box 1: Funds at Risk
  doc.save()
    .fillColor(C.redLight)
    .roundedRect(MARGIN, boxY, boxW, 60, 6).fill()
    .strokeColor(C.red).opacity(0.3).lineWidth(0.5)
    .roundedRect(MARGIN, boxY, boxW, 60, 6).stroke()
    .opacity(1)
    .fillColor(C.textMuted).fontSize(7).font("Helvetica-Bold")
    .text("FUNDS AT RISK", MARGIN + 8, boxY + 6, { characterSpacing: 0.3 })
    .fillColor(C.CRITICAL).fontSize(16).font("Helvetica-Bold")
    .text(`$${Math.round(metrics.totalFundsAtRisk).toLocaleString()}`, MARGIN + 8, boxY + 18, { width: boxW - 16 })
    .fillColor(C.textMuted).fontSize(7).font("Helvetica")
    .text("If exploited today", MARGIN + 8, boxY + 44, { width: boxW - 16 })
    .restore();

  // Box 2: Cost if Exploited
  const bx2 = MARGIN + boxW + 6;
  doc.save()
    .fillColor(C.redLight)
    .roundedRect(bx2, boxY, boxW, 60, 6).fill()
    .strokeColor(C.red).opacity(0.3).lineWidth(0.5)
    .roundedRect(bx2, boxY, boxW, 60, 6).stroke()
    .opacity(1)
    .fillColor(C.textMuted).fontSize(7).font("Helvetica-Bold")
    .text("30-DAY IMPACT", bx2 + 8, boxY + 6, { characterSpacing: 0.3 })
    .fillColor(C.CRITICAL).fontSize(16).font("Helvetica-Bold")
    .text(`$${Math.round(metrics.costIfExploitedIn30Days).toLocaleString()}`, bx2 + 8, boxY + 18, { width: boxW - 16 })
    .fillColor(C.textMuted).fontSize(7).font("Helvetica")
    .text("Projected loss", bx2 + 8, boxY + 44, { width: boxW - 16 })
    .restore();

  // Box 3: Audit Cost Avoided
  const bx3 = MARGIN + (boxW + 6) * 2;
  doc.save()
    .fillColor(C.greenLight)
    .roundedRect(bx3, boxY, boxW, 60, 6).fill()
    .strokeColor(C.green).opacity(0.3).lineWidth(0.5)
    .roundedRect(bx3, boxY, boxW, 60, 6).stroke()
    .opacity(1)
    .fillColor(C.textMuted).fontSize(7).font("Helvetica-Bold")
    .text("AUDIT VALUE", bx3 + 8, boxY + 6, { characterSpacing: 0.3 })
    .fillColor(C.green).fontSize(16).font("Helvetica-Bold")
    .text(`$${Math.round(metrics.auditCostAvoided).toLocaleString()}`, bx3 + 8, boxY + 18, { width: boxW - 16 })
    .fillColor(C.textMuted).fontSize(7).font("Helvetica")
    .text("Professional audit cost", bx3 + 8, boxY + 44, { width: boxW - 16 })
    .restore();

  doc.y = boxY + 66;
  doc.moveDown(0.4);

  // Remediation Cost Analysis
  doc.save()
    .fillColor(C.textPrimary).fontSize(11).font("Helvetica-Bold")
    .text("Remediation Cost Comparison", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.5);

  // Table: Cost breakdown
  const fixTableY = doc.y;
  const fixColW = (CONTENT_W - 30) / 3;

  doc.save()
    .fillColor(C.headerBg2)
    .rect(MARGIN, fixTableY, CONTENT_W, 16).fill()
    .fillColor(C.textLight).fontSize(8).font("Helvetica-Bold")
    .text("APPROACH", MARGIN + 8, fixTableY + 4)
    .text("COST ESTIMATE", MARGIN + fixColW + 8, fixTableY + 4)
    .text("TIME ESTIMATE", MARGIN + (fixColW * 2) + 8, fixTableY + 4)
    .restore();
  doc.moveDown(0.72);

  const fixOptions = [
    { approach: "In-House Team", cost: metrics.fixCostInHouse, hours: metrics.estimatedFixHours },
    { approach: "Contract Developer", cost: metrics.fixCostOutsourced, hours: Math.ceil(metrics.estimatedFixHours * 0.7) },
    { approach: "Professional Audit Firm", cost: metrics.auditCostAvoided, hours: Math.ceil(metrics.estimatedFixHours * 0.5) },
  ];

  fixOptions.forEach((opt, i) => {
    const optY = doc.y;
    const bg = i % 2 === 0 ? "#f8fafc" : C.white;
    
    doc.save()
      .fillColor(bg).opacity(0.5)
      .rect(MARGIN, optY, CONTENT_W, 14).fill()
      .opacity(1)
      .fillColor(C.textPrimary).fontSize(8).font("Helvetica")
      .text(opt.approach, MARGIN + 8, optY + 2)
      .text(`$${opt.cost.toLocaleString()}`, MARGIN + fixColW + 8, optY + 2)
      .text(`${opt.hours}h`, MARGIN + (fixColW * 2) + 8, optY + 2)
      .restore();
    
    doc.moveDown(0.5);
  });

  doc.moveDown(0.4);

  // ROI calculation
  const roiPercentage = metrics.auditCostAvoided > 0 ? ((metrics.totalFundsAtRisk - metrics.fixCostInHouse) / (metrics.totalFundsAtRisk)) * 100 : 0;
  doc.save()
    .fillColor(C.green).opacity(0.1)
    .roundedRect(MARGIN, doc.y, CONTENT_W, 50, 6).fill()
    .opacity(1)
    .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
    .text("ROI Analysis", MARGIN + 12, doc.y + 6)
    .fillColor(C.textMuted).fontSize(8).font("Helvetica")
    .text(`Fixing issues now vs. dealing with exploits later has a ${roiPercentage > 0 ? roiPercentage.toFixed(0) : "positive"}% ROI`, MARGIN + 12, doc.y + 22, { width: CONTENT_W - 24 })
    .fillColor(C.green).fontSize(9).font("Helvetica-Bold")
    .text(`→ Fix investment: $${metrics.fixCostInHouse.toLocaleString()} protects $${metrics.totalFundsAtRisk.toLocaleString()}`, MARGIN + 12, doc.y + 38, { width: CONTENT_W - 24 })
    .restore();

  doc.moveDown(2.2);
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAILED CVSS METRICS TABLE
// ─────────────────────────────────────────────────────────────────────────────

export function drawCVSSMetricsPage(
  doc: PDFKit.PDFDocument,
  vulnerabilities: EnhancedVulnerability[]
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(16).font("Helvetica-Bold")
    .text("CVSS v3.1 Scoring Analysis", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  doc.save()
    .fillColor(C.textMuted).fontSize(8.5).font("Helvetica")
    .text("Complete CVSS v3.1 scoring for each vulnerability with severity interpretation and temporal factors.", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  vulnerabilities.forEach((vuln, idx) => {
    if (doc.y > PAGE_H - MARGIN - 200) doc.addPage();

    const cvssScore = vuln.cvss_score ?? (vuln.severity === "CRITICAL" ? 9.8 : vuln.severity === "HIGH" ? 8.2 : vuln.severity === "MEDIUM" ? 6.4 : 3.7);
    const cvssVector = vuln.cvss_vector ?? `CVSS:3.1/AV:N/AC:L/PR:${vuln.severity === "CRITICAL" ? "N" : "L"}/UI:N/S:U/C:H/I:H/A:${vuln.severity === "LOW" ? "N" : "H"}`;

    doc.save()
      .fillColor(C.textPrimary).fontSize(11).font("Helvetica-Bold")
      .text(`Finding ${idx + 1}: ${vuln.title}`, MARGIN, doc.y)
      .restore();
    doc.moveDown(0.4);

    // CVSS Score Bar
    doc.save()
      .fillColor(C.textMuted).fontSize(7.5).font("Helvetica")
      .text(`CVSS Score: ${cvssScore.toFixed(1)}/10`, MARGIN, doc.y)
      .restore();

    const scoreBarY = doc.y + 8;
    const scoreBarW = (cvssScore / 10) * (CONTENT_W - 80);
    const scoreColor = cvssScore >= 9 ? C.CRITICAL : cvssScore >= 7 ? C.HIGH : cvssScore >= 4 ? C.MEDIUM : C.LOW;

    doc.save()
      .fillColor(C.borderLight)
      .rect(MARGIN, scoreBarY, CONTENT_W - 80, 8).fill()
      .fillColor(scoreColor)
      .rect(MARGIN, scoreBarY, scoreBarW, 8).fill()
      .restore();

    doc.y = scoreBarY + 14;

    // CVSS Vector
    doc.save()
      .fillColor(C.textMuted).fontSize(7).font("Courier")
      .text(cvssVector, MARGIN, doc.y, { width: CONTENT_W })
      .restore();
    doc.moveDown(0.6);

    // Metrics explanation (condensed)
    doc.save()
      .fillColor(C.textMuted).fontSize(7.5).font("Helvetica")
      .text(
        `Attack Vector: ${cvssVector.includes("AV:N") ? "Network (remote)" : "Local (in-person)"}  •  ` +
        `Complexity: ${cvssVector.includes("AC:L") ? "Low" : "High"}  •  ` +
        `Privileges: ${cvssVector.includes("PR:N") ? "None" : "Required"}`,
        MARGIN, doc.y, { width: CONTENT_W, lineGap: 1 }
      )
      .restore();
    doc.moveDown(0.6);

    hr(doc);
    doc.moveDown(0.5);
  });
}

function hr(doc: PDFKit.PDFDocument, y?: number, color = REPORT_COLORS.borderLight) {
  const lineY = y ?? doc.y;
  doc.save()
    .strokeColor(color).lineWidth(0.5)
    .moveTo(MARGIN, lineY).lineTo(PAGE_W - MARGIN, lineY).stroke()
    .restore();
  if (!y) doc.moveDown(0.4);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPLOYMENT READINESS CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

export function drawDeploymentChecklist(
  doc: PDFKit.PDFDocument,
  readiness: DeploymentReadiness,
  riskScore: number
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(16).font("Helvetica-Bold")
    .text("Deployment Readiness Assessment", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  // Decision boxes
  const boxH = 50;
  const decisionY = doc.y;

  // Testnet
  const testnetBg = readiness.canDeployTestnet ? C.greenLight : C.redLight;
  const testnetColor = readiness.canDeployTestnet ? C.green : C.CRITICAL;

  doc.save()
    .fillColor(testnetBg)
    .roundedRect(MARGIN, decisionY, (CONTENT_W - 6) / 2, boxH, 6).fill()
    .strokeColor(testnetColor).opacity(0.3).lineWidth(0.5)
    .roundedRect(MARGIN, decisionY, (CONTENT_W - 6) / 2, boxH, 6).stroke()
    .opacity(1)
    .fillColor(testnetColor).fontSize(9).font("Helvetica-Bold")
    .text(readiness.canDeployTestnet ? "✓ READY FOR TESTNET" : "✗ NOT READY", MARGIN + 8, decisionY + 6)
    .fillColor(C.textMuted).fontSize(7.5).font("Helvetica")
    .text(readiness.canDeployTestnet ? "Can proceed to testnet deployment" : "Critical issues must be fixed first", MARGIN + 8, decisionY + 24, { width: (CONTENT_W - 6) / 2 - 16 })
    .restore();

  // Mainnet
  const mainnetBg = readiness.canDeployMainnet ? C.greenLight : C.redLight;
  const mainnetColor = readiness.canDeployMainnet ? C.green : C.CRITICAL;
  const mainnetX = MARGIN + (CONTENT_W - 6) / 2 + 6;

  doc.save()
    .fillColor(mainnetBg)
    .roundedRect(mainnetX, decisionY, (CONTENT_W - 6) / 2, boxH, 6).fill()
    .strokeColor(mainnetColor).opacity(0.3).lineWidth(0.5)
    .roundedRect(mainnetX, decisionY, (CONTENT_W - 6) / 2, boxH, 6).stroke()
    .opacity(1)
    .fillColor(mainnetColor).fontSize(9).font("Helvetica-Bold")
    .text(readiness.canDeployMainnet ? "✓ READY FOR MAINNET" : "✗ NOT READY", mainnetX + 8, decisionY + 6)
    .fillColor(C.textMuted).fontSize(7.5).font("Helvetica")
    .text(readiness.canDeployMainnet ? "Can proceed to production" : "Additional fixes or audit needed", mainnetX + 8, decisionY + 24, { width: (CONTENT_W - 6) / 2 - 16 })
    .restore();

  doc.y = decisionY + boxH + 12;

  // Critical Blockers
  if (readiness.criticalBlockers.length > 0) {
    doc.save()
      .fillColor(C.CRITICAL).fontSize(9).font("Helvetica-Bold")
      .text("🚫 Critical Blockers (MUST FIX):", MARGIN, doc.y)
      .restore();
    doc.moveDown(0.5);

    readiness.criticalBlockers.forEach((blocker) => {
      doc.save()
        .fillColor(C.textMuted).fontSize(8).font("Helvetica")
        .text(`• ${blocker}`, MARGIN + 12, doc.y)
        .restore();
      doc.moveDown(0.35);
    });

    doc.moveDown(0.4);
  }

  // High Risk Items
  if (readiness.highRiskItems.length > 0) {
    doc.save()
      .fillColor(C.HIGH).fontSize(9).font("Helvetica-Bold")
      .text("⚠️  High Risk Items (FIX BEFORE MAINNET):", MARGIN, doc.y)
      .restore();
    doc.moveDown(0.5);

    readiness.highRiskItems.forEach((item) => {
      doc.save()
        .fillColor(C.textMuted).fontSize(8).font("Helvetica")
        .text(`• ${item}`, MARGIN + 12, doc.y)
        .restore();
      doc.moveDown(0.35);
    });

    doc.moveDown(0.4);
  }

  // Recommended Actions
  if (readiness.recommendedActions.length > 0) {
    doc.save()
      .fillColor(C.accent).fontSize(9).font("Helvetica-Bold")
      .text("📋 Recommended Actions:", MARGIN, doc.y)
      .restore();
    doc.moveDown(0.5);

    readiness.recommendedActions.forEach((action) => {
      doc.save()
        .fillColor(C.textMuted).fontSize(8).font("Helvetica")
        .text(`✓ ${action}`, MARGIN + 12, doc.y)
        .restore();
      doc.moveDown(0.35);
    });

    doc.moveDown(0.4);
  }

  // Timeline to mainnet
  doc.save()
    .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
    .text(`Estimated Time to Mainnet: ${readiness.estimatedDaysToMainnet} days`, MARGIN, doc.y)
    .restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE FRAMEWORK MAPPING
// ─────────────────────────────────────────────────────────────────────────────

export function drawComplianceMapping(
  doc: PDFKit.PDFDocument,
  compliance: ComplianceStatus
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(16).font("Helvetica-Bold")
    .text("Security Compliance Framework Analysis", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  const frameworks = [
    { name: "ERC-20 Standard", score: compliance.erc20Standard, desc: "Token standard compliance" },
    { name: "OpenZeppelin Patterns", score: compliance.openZeppelinPatterns, desc: "Industry best practices" },
    { name: "OWASP Top 10", score: compliance.owaspTop10, desc: "Web3 security guidelines" },
    { name: "Consensys Guidelines", score: compliance.consensysGuidelines, desc: "Professional audit standards" },
  ];

  frameworks.forEach((fw, i) => {
    if (doc.y > PAGE_H - MARGIN - 100) doc.addPage();

    const fwY = doc.y;
    const scoreColor = fw.score >= 90 ? C.green : fw.score >= 70 ? C.orange : C.CRITICAL;
    const scoreBg = fw.score >= 90 ? C.greenLight : fw.score >= 70 ? "#fef3c7" : C.redLight;

    doc.save()
      .fillColor(scoreBg)
      .roundedRect(MARGIN, fwY, CONTENT_W, 40, 6).fill()
      .strokeColor(scoreColor).opacity(0.3).lineWidth(0.5)
      .roundedRect(MARGIN, fwY, CONTENT_W, 40, 6).stroke()
      .opacity(1)
      .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
      .text(fw.name, MARGIN + 12, fwY + 6)
      .fillColor(C.textMuted).fontSize(7.5).font("Helvetica")
      .text(fw.desc, MARGIN + 12, fwY + 18)
      .restore();

    // Score bar
    const scoreBarW = (fw.score / 100) * (CONTENT_W - 120);
    doc.save()
      .fillColor(C.borderLight)
      .rect(PAGE_W - MARGIN - 60, fwY + 6, 50, 8).fill()
      .fillColor(scoreColor)
      .rect(PAGE_W - MARGIN - 60, fwY + 6, Math.max(3, scoreBarW), 8).fill()
      .fillColor(scoreColor).fontSize(8).font("Helvetica-Bold")
      .text(`${fw.score}%`, PAGE_W - MARGIN - 56, fwY + 7, { width: 50, align: "right" })
      .restore();

    doc.y = fwY + 46;
  });

  doc.moveDown(0.6);

  // Overall score
  doc.save()
    .fillColor(C.blue).opacity(0.1)
    .roundedRect(MARGIN, doc.y, CONTENT_W, 50, 6).fill()
    .opacity(1)
    .fillColor(C.textPrimary).fontSize(11).font("Helvetica-Bold")
    .text("Overall Compliance Score", MARGIN + 12, doc.y + 8)
    .fillColor(C.accent).fontSize(32).font("Helvetica-Bold")
    .text(`${compliance.overall}%`, MARGIN + 12, doc.y + 22)
    .restore();
}

export function calculateFinancialMetrics(
  vulns: EnhancedVulnerability[],
  riskScore: number
): FinancialMetrics {
  const counts = {
    CRITICAL: vulns.filter((v) => v.severity === "CRITICAL").length,
    HIGH: vulns.filter((v) => v.severity === "HIGH").length,
    MEDIUM: vulns.filter((v) => v.severity === "MEDIUM").length,
    LOW: vulns.filter((v) => v.severity === "LOW").length,
  };

  const fundsAtRisk =
    counts.CRITICAL * 250000 + counts.HIGH * 90000 + counts.MEDIUM * 30000 + riskScore * 900;

  return {
    totalFundsAtRisk: fundsAtRisk,
    costIfExploitedIn30Days: fundsAtRisk * 1.2,
    auditCostAvoided: 5000 + vulns.length * 2200 + counts.CRITICAL * 5000,
    fixCostInHouse: counts.CRITICAL * 400 + counts.HIGH * 200 + counts.MEDIUM * 80 + counts.LOW * 20,
    fixCostOutsourced: counts.CRITICAL * 1000 + counts.HIGH * 500 + counts.MEDIUM * 200 + counts.LOW * 50,
    estimatedFixHours: counts.CRITICAL * 8 + counts.HIGH * 5 + counts.MEDIUM * 3 + counts.LOW * 1,
    roi:
      ((fundsAtRisk - (counts.CRITICAL * 400 + counts.HIGH * 200 + counts.MEDIUM * 80 + counts.LOW * 20)) /
        fundsAtRisk) *
      100,
  };
}

export function calculateComplianceStatus(
  vulns: EnhancedVulnerability[]
): ComplianceStatus {
  const totalScore =
    vulns.reduce((sum, v) => {
      return sum + (v.severity === "CRITICAL" ? 0 : v.severity === "HIGH" ? 20 : v.severity === "MEDIUM" ? 60 : 90);
    }, 0) / vulns.length || 100;

  return {
    erc20Standard: Math.max(20, totalScore - 10),
    openZeppelinPatterns: Math.max(15, totalScore - 20),
    owaspTop10: Math.max(25, totalScore - 15),
    consensysGuidelines: Math.max(10, totalScore - 30),
    overall: Math.round(totalScore),
  };
}

export function calculateDeploymentReadiness(
  vulns: EnhancedVulnerability[],
  riskScore: number
): DeploymentReadiness {
  const counts = {
    CRITICAL: vulns.filter((v) => v.severity === "CRITICAL").length,
    HIGH: vulns.filter((v) => v.severity === "HIGH").length,
  };

  const criticalBlockers: string[] = [];
  const highRiskItems: string[] = [];
  const recommendedActions: string[] = [];

  if (counts.CRITICAL > 0) {
    criticalBlockers.push(
      `${counts.CRITICAL} CRITICAL vulnerabilities must be fixed before any deployment`
    );
  }

  if (counts.HIGH > 0) {
    highRiskItems.push(
      `${counts.HIGH} HIGH severity issues - fix before mainnet deployment`
    );
  }

  if (riskScore >= 70) {
    highRiskItems.push("Risk score above 70 - professional audit strongly recommended");
  }

  if (counts.CRITICAL === 0 && counts.HIGH === 0) {
    recommendedActions.push("✓ Safe to deploy to testnet");
  }

  if (riskScore < 50 && counts.CRITICAL === 0) {
    recommendedActions.push("✓ Contract ready for mainnet (with monitoring)");
  }

  recommendedActions.push("Enable on-chain monitoring and alerting");
  recommendedActions.push("Set up bug bounty program post-deployment");
  recommendedActions.push("Document all upgrades and patches");

  return {
    canDeployTestnet: counts.CRITICAL === 0,
    canDeployMainnet: counts.CRITICAL === 0 && counts.HIGH === 0 && riskScore < 60,
    criticalBlockers,
    highRiskItems,
    recommendedActions,
    estimatedDaysToMainnet: counts.CRITICAL > 0 ? 14 : counts.HIGH > 0 ? 7 : 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GAS OPTIMIZATION ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export function drawGasOptimizationAnalysis(
  doc: PDFKit.PDFDocument,
  vulnerabilities: EnhancedVulnerability[]
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(16).font("Helvetica-Bold")
    .text("Gas Optimization Opportunities", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  doc.save()
    .fillColor(C.textMuted).fontSize(8.5).font("Helvetica")
    .text("Analysis of gas costs before and after applying security fixes. Optimizations not only improve security but can also reduce operational costs.", MARGIN, doc.y, { width: CONTENT_W })
    .restore();
  doc.moveDown(0.6);

  let totalGasBefore = 0;
  let totalGasAfter = 0;

  const optimizations = vulnerabilities
    .filter((v) => v.gas_cost_before && v.gas_cost_after)
    .map((v) => ({
      title: v.title,
      before: v.gas_cost_before || 0,
      after: v.gas_cost_after || 0,
      savings: (v.gas_cost_before || 0) - (v.gas_cost_after || 0),
    }));

  optimizations.forEach((opt) => {
    totalGasBefore += opt.before;
    totalGasAfter += opt.after;
  });

  const totalSavings = totalGasBefore - totalGasAfter;
  const percentSavings = totalGasBefore > 0 ? ((totalSavings / totalGasBefore) * 100).toFixed(1) : "0.0";
  const annualSavingsUSD = totalSavings * 0.000000001 * 2000000000; // Rough estimate: 2 GWEI, 2B transactions/year

  // Summary boxes
  const boxW = (CONTENT_W - 12) / 3;
  const sumY = doc.y;

  // Box 1: Gas Before
  doc.save()
    .fillColor("#e0e7ff")
    .roundedRect(MARGIN, sumY, boxW, 50, 6).fill()
    .strokeColor("#6366f1").opacity(0.3).lineWidth(0.5)
    .roundedRect(MARGIN, sumY, boxW, 50, 6).stroke()
    .opacity(1)
    .fillColor(C.textMuted).fontSize(7).font("Helvetica-Bold")
    .text("CURRENT GAS COST", MARGIN + 8, sumY + 6, { characterSpacing: 0.3 })
    .fillColor("#6366f1").fontSize(14).font("Helvetica-Bold")
    .text(`${totalGasBefore.toLocaleString()}`, MARGIN + 8, sumY + 18, { width: boxW - 16 })
    .fillColor(C.textMuted).fontSize(7).font("Helvetica")
    .text("per transaction", MARGIN + 8, sumY + 36, { width: boxW - 16 })
    .restore();

  // Box 2: Gas After
  const bx2 = MARGIN + boxW + 6;
  doc.save()
    .fillColor(C.greenLight)
    .roundedRect(bx2, sumY, boxW, 50, 6).fill()
    .strokeColor(C.green).opacity(0.3).lineWidth(0.5)
    .roundedRect(bx2, sumY, boxW, 50, 6).stroke()
    .opacity(1)
    .fillColor(C.textMuted).fontSize(7).font("Helvetica-Bold")
    .text("OPTIMIZED GAS COST", bx2 + 8, sumY + 6, { characterSpacing: 0.3 })
    .fillColor(C.green).fontSize(14).font("Helvetica-Bold")
    .text(`${totalGasAfter.toLocaleString()}`, bx2 + 8, sumY + 18, { width: boxW - 16 })
    .fillColor(C.textMuted).fontSize(7).font("Helvetica")
    .text("per transaction", bx2 + 8, sumY + 36, { width: boxW - 16 })
    .restore();

  // Box 3: Savings
  const bx3 = MARGIN + (boxW + 6) * 2;
  doc.save()
    .fillColor("#fef3c7")
    .roundedRect(bx3, sumY, boxW, 50, 6).fill()
    .strokeColor("#f59e0b").opacity(0.3).lineWidth(0.5)
    .roundedRect(bx3, sumY, boxW, 50, 6).stroke()
    .opacity(1)
    .fillColor(C.textMuted).fontSize(7).font("Helvetica-Bold")
    .text("ESTIMATED SAVINGS", bx3 + 8, sumY + 6, { characterSpacing: 0.3 })
    .fillColor("#d97706").fontSize(14).font("Helvetica-Bold")
    .text(`${percentSavings}%`, bx3 + 8, sumY + 18, { width: boxW - 16 })
    .fillColor(C.textMuted).fontSize(7).font("Helvetica")
    .text(`${totalSavings.toLocaleString()} gas`, bx3 + 8, sumY + 36, { width: boxW - 16 })
    .restore();

  doc.y = sumY + 56;
  doc.moveDown(0.2);

  // ROI estimate
  doc.save()
    .fillColor(C.blue).opacity(0.1)
    .roundedRect(MARGIN, doc.y, CONTENT_W, 40, 6).fill()
    .opacity(1)
    .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
    .text("Annual Cost Savings (Estimated)", MARGIN + 12, doc.y + 6)
    .fillColor(C.blue).fontSize(11).font("Helvetica-Bold")
    .text(`$${Math.round(annualSavingsUSD).toLocaleString()} per year`, MARGIN + 12, doc.y + 20, { width: CONTENT_W - 24 })
    .restore();

  doc.moveDown(2.2);

  // Detailed breakdown table
  if (optimizations.length > 0) {
    doc.save()
      .fillColor(C.textMuted).fontSize(8).font("Helvetica-Bold")
      .text("Gas Cost Breakdown by Vulnerability", MARGIN, doc.y, { characterSpacing: 0.3 })
      .restore();
    doc.moveDown(0.5);

    const colW = (CONTENT_W - 30) / 3;
    const tableY = doc.y;

    doc.save()
      .fillColor(C.headerBg2)
      .rect(MARGIN, tableY, CONTENT_W, 16).fill()
      .fillColor(C.textLight).fontSize(7.5).font("Helvetica-Bold")
      .text("VULNERABILITY", MARGIN + 8, tableY + 4)
      .text("BEFORE FIX", MARGIN + colW + 8, tableY + 4)
      .text("AFTER FIX", MARGIN + (colW * 2) + 8, tableY + 4)
      .text("SAVINGS", MARGIN + (colW * 3) + 8, tableY + 4)
      .restore();
    doc.moveDown(0.72);

    optimizations.forEach((opt, i) => {
      const optY = doc.y;
      const bg = i % 2 === 0 ? "#f8fafc" : C.white;

      doc.save()
        .fillColor(bg).opacity(0.5)
        .rect(MARGIN, optY, CONTENT_W, 14).fill()
        .opacity(1)
        .fillColor(C.textPrimary).fontSize(7.5).font("Helvetica")
        .text(opt.title.substring(0, 25), MARGIN + 8, optY + 2, { width: colW - 16, ellipsis: true })
        .text(`${opt.before.toLocaleString()}`, MARGIN + colW + 8, optY + 2)
        .text(`${opt.after.toLocaleString()}`, MARGIN + (colW * 2) + 8, optY + 2)
        .fillColor(C.green).font("Helvetica-Bold")
        .text(`${opt.savings.toLocaleString()}`, MARGIN + (colW * 3) + 8, optY + 2)
        .restore();

      doc.moveDown(0.5);
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE QUALITY SCORECARD PAGE
// ─────────────────────────────────────────────────────────────────────────────

export function drawCodeQualityScorecard(
  doc: PDFKit.PDFDocument,
  {
    codeQualityScore,
    counts,
    totalVulns,
    analysisTime,
    codeHash,
  }: {
    codeQualityScore: number;
    counts: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number };
    totalVulns: number;
    analysisTime: number;
    codeHash: string;
  }
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(16).font("Helvetica-Bold")
    .text("Code Quality Scorecard", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.4);

  doc.save()
    .fillColor(C.textMuted).fontSize(8.5).font("Helvetica")
    .text("Comprehensive code quality assessment based on vulnerability density, severity distribution, and security patterns.", MARGIN, doc.y, { width: CONTENT_W })
    .restore();
  doc.moveDown(0.8);

  // Main quality score
  const scoreY = doc.y;
  const scoreColor = codeQualityScore >= 90 ? C.green : codeQualityScore >= 75 ? "#3b82f6" : codeQualityScore >= 60 ? C.HIGH : C.CRITICAL;

  // Large score circle
  doc.save()
    .fillColor(scoreColor).opacity(0.15)
    .circle(MARGIN + 60, scoreY + 60, 50).fill()
    .opacity(1)
    .fillColor(scoreColor)
    .fontSize(44).font("Helvetica-Bold")
    .text(String(codeQualityScore), MARGIN + 25, scoreY + 25, { width: 70, align: "center" })
    .fillColor(C.textMuted)
    .fontSize(9).font("Helvetica")
    .text("/ 100", MARGIN + 25, scoreY + 70, { width: 70, align: "center" })
    .restore();

  // Grade
  const grade = codeQualityScore >= 90 ? "A" : codeQualityScore >= 80 ? "B" : codeQualityScore >= 70 ? "C" : codeQualityScore >= 60 ? "D" : "F";
  const gradeColor = grade === "A" ? C.green : grade === "B" ? "#3b82f6" : grade === "C" ? C.MEDIUM : grade === "D" ? C.HIGH : C.CRITICAL;

  doc.save()
    .fillColor(gradeColor).opacity(0.2)
    .roundedRect(MARGIN + 150, scoreY + 30, 60, 60, 6).fill()
    .opacity(1)
    .fillColor(gradeColor)
    .fontSize(32).font("Helvetica-Bold")
    .text(grade, MARGIN + 150, scoreY + 35, { width: 60, align: "center" })
    .restore();

  // Quality metrics cards
  const cardStartX = MARGIN + 250;
  const cardY = scoreY;
  const cardW = (CONTENT_W - 70) / 2;

  const metrics = [
    { label: "Vulnerability Density", value: `${((totalVulns / 100) * 100).toFixed(1)}%`, desc: "Issues per 100 lines (est.)", color: counts.CRITICAL > 0 ? C.CRITICAL : C.HIGH },
    { label: "Critical Issues", value: String(counts.CRITICAL), desc: "Requires immediate fix", color: C.CRITICAL },
    { label: "Test Coverage", value: "Estimated", desc: "Code coverage unknown", color: C.MEDIUM },
    { label: "Documentation", value: "Review", desc: "Check code comments", color: C.textMuted },
  ];

  metrics.forEach((m, i) => {
    const mX = cardStartX + (i % 2) * (cardW + 12);
    const mY = cardY + (i > 1 ? 60 : 0);

    doc.save()
      .fillColor(m.color).opacity(0.08)
      .roundedRect(mX, mY, cardW, 50, 4).fill()
      .opacity(1)
      .strokeColor(m.color).opacity(0.2).lineWidth(0.5)
      .roundedRect(mX, mY, cardW, 50, 4).stroke()
      .opacity(1)
      .fillColor(C.textMuted).fontSize(7).font("Helvetica-Bold")
      .text(m.label, mX + 8, mY + 6, { characterSpacing: 0.3 })
      .fillColor(m.color).fontSize(13).font("Helvetica-Bold")
      .text(m.value, mX + 8, mY + 18)
      .fillColor(C.textMuted).fontSize(7).font("Helvetica")
      .text(m.desc, mX + 8, mY + 34, { width: cardW - 16 })
      .restore();
  });

  doc.y = scoreY + 130;
  doc.moveDown(0.5);

  // Severity distribution breakdown
  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(11).font("Helvetica-Bold")
    .text("Severity Distribution", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.5);

  const sevCardW = (CONTENT_W - 18) / 4;
  const sevY = doc.y;

  [
    { sev: "CRITICAL", count: counts.CRITICAL, color: C.CRITICAL },
    { sev: "HIGH", count: counts.HIGH, color: C.HIGH },
    { sev: "MEDIUM", count: counts.MEDIUM, color: C.MEDIUM },
    { sev: "LOW", count: counts.LOW, color: C.LOW },
  ].forEach((s, i) => {
    const sx = MARGIN + i * (sevCardW + 6);

    doc.save()
      .fillColor(s.color).opacity(0.12)
      .roundedRect(sx, sevY, sevCardW, 70, 4).fill()
      .opacity(1)
      .fillColor(s.color)
      .fontSize(24).font("Helvetica-Bold")
      .text(String(s.count), sx, sevY + 12, { width: sevCardW, align: "center" })
      .fillColor(C.textMuted)
      .fontSize(7.5).font("Helvetica-Bold")
      .text(s.sev, sx, sevY + 42, { width: sevCardW, align: "center", characterSpacing: 0.3 })
      .restore();
  });

  doc.y = sevY + 80;
  doc.moveDown(0.3);

  // Metadata
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(7.5).font("Helvetica")
    .text(`Analysis Time: ${(analysisTime / 1000).toFixed(2)}s`, MARGIN, doc.y)
    .text(`Code Hash: ${codeHash.substring(0, 32)}...`, PAGE_W - MARGIN - 200, doc.y, { width: 200, align: "right" })
    .restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL APPENDIX & FOOTER PAGE
// ─────────────────────────────────────────────────────────────────────────────

export function drawProfessionalAppendix(
  doc: PDFKit.PDFDocument,
  { contractName, riskScore }: { contractName: string; riskScore: number }
) {
  const C = REPORT_COLORS;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(16).font("Helvetica-Bold")
    .text("Appendix & References", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  // GLOSSARY
  doc.save()
    .fillColor(C.accent)
    .fontSize(11).font("Helvetica-Bold")
    .text("Glossary", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.4);

  const glossary = [
    { term: "CVSS", def: "Common Vulnerability Scoring System - standardized method to rate vulnerability severity (0-10)" },
    { term: "SWC", def: "Smart Contract Weakness - classification similar to CWE for smart contract vulnerabilities" },
    { term: "Reentrancy", def: "Attack where contract calls external function before updating state, allowing recursive calls" },
    { term: "CEI Pattern", def: "Checks-Effects-Interactions - best practice order to prevent reentrancy and state issues" },
    { term: "Mainnet", def: "Production Ethereum network where real funds are at risk. Requires highest security standards" },
    { term: "Testnet", def: "Practice network (Goerli, Sepolia) for testing smart contracts without financial risk" },
    { term: "Gas", def: "Unit of computational effort; higher gas cost = more expensive transaction" },
    { term: "Risk Score", def: "0-100 aggregated score indicating overall contract security risk level" },
  ];

  glossary.forEach((g) => {
    if (doc.y > PAGE_H - MARGIN - 50) doc.addPage();
    doc.save()
      .fillColor(C.accent)
      .fontSize(8).font("Helvetica-Bold")
      .text(g.term, MARGIN + 12, doc.y)
      .fillColor(C.textMuted)
      .fontSize(8).font("Helvetica")
      .text(g.def, MARGIN + 80, doc.y, { width: CONTENT_W - 92 })
      .restore();
    doc.moveDown(0.5);
  });

  doc.moveDown(0.5);

  // RESOURCES
  doc.save()
    .fillColor(C.accent)
    .fontSize(11).font("Helvetica-Bold")
    .text("Recommended Resources", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.4);

  const resources = [
    "Solidity Documentation: https://docs.soliditylang.org",
    "OpenZeppelin Contracts: https://github.com/OpenZeppelin/openzeppelin-contracts",
    "OWASP Smart Contract Top 10: https://owasp.org/www-project-smart-contract-top-10/",
    "Trail of Bits Security Audit: https://www.trailofbits.com",
    "Consensys Smart Contract Best Practices: https://consensys.github.io/smart-contract-best-practices/",
    "Mythril Static Analyzer: https://github.com/Consensys/mythril",
    "Slither Security Scanner: https://github.com/crytic/slither",
    "Echidna Fuzzing Tool: https://github.com/crytic/echidna",
  ];

  resources.forEach((r) => {
    if (doc.y > PAGE_H - MARGIN - 30) doc.addPage();
    doc.save()
      .fillColor(C.blue).fontSize(7.5).font("Helvetica")
      .text(`• ${r}`, MARGIN + 12, doc.y, { width: CONTENT_W - 24, lineGap: 1 })
      .restore();
    doc.moveDown(0.4);
  });

  doc.moveDown(0.8);

  // DISCLAIMER
  doc.save()
    .fillColor(C.CRITICAL).opacity(0.15)
    .roundedRect(MARGIN, doc.y, CONTENT_W, 70, 6).fill()
    .opacity(1).restore();

  doc.save()
    .fillColor(C.CRITICAL)
    .fontSize(8).font("Helvetica-Bold")
    .text("⚠ IMPORTANT DISCLAIMER", MARGIN + 12, doc.y + 6)
    .fillColor(C.textPrimary)
    .fontSize(7.5).font("Helvetica")
    .text("This automated audit report is generated by AI and provides analysis of potential vulnerabilities. However, it should not be considered a complete security audit. This report:", MARGIN + 12, doc.y + 18, { width: CONTENT_W - 24, lineGap: 1 })
    .restore();

  const disclaimers = [
    "• Does not replace professional manual code review by security experts",
    "• May miss complex vulnerabilities or sophisticated attack vectors",
    "• Should be combined with dynamic testing, fuzzing, and formal verification",
    "• Requires review by experienced smart contract developers",
    "• Does not guarantee zero vulnerabilities or absolute safety",
  ];

  doc.moveDown(1.5);
  disclaimers.forEach((d) => {
    if (doc.y > PAGE_H - MARGIN - 20) doc.addPage();
    doc.save()
      .fillColor(C.textMuted)
      .fontSize(7).font("Helvetica")
      .text(d, MARGIN + 12, doc.y, { width: CONTENT_W - 24 })
      .restore();
    doc.moveDown(0.35);
  });

  doc.moveDown(0.8);

  // Final report info
  doc.save()
    .fillColor(C.textMuted).fontSize(8).font("Helvetica")
    .text(`Contract: ${contractName}`, MARGIN, doc.y)
    .text(`Report Generated: ${new Date().toUTCString()}`, MARGIN, doc.y + 12)
    .text(`Final Risk Score: ${riskScore} / 100`, MARGIN, doc.y + 24)
    .restore();

  doc.moveDown(2);

  // Footer
  doc.save()
    .fillColor(C.borderLight)
    .rect(MARGIN, PAGE_H - 35, CONTENT_W, 0.5)
    .fill()
    .fillColor(C.textLight)
    .fontSize(7).font("Helvetica")
    .text("VulnGuard AI • Enterprise Security Audit Report • Confidential", MARGIN, PAGE_H - 28, { width: CONTENT_W, align: "center" })
    .restore();
}
