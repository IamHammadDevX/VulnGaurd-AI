/**
 * Professional Dashboard Page Generator
 * 
 * Creates stunning visual dashboards for:
 * - Executive Summary Dashboard
 * - Risk Assessment Dashboard
 * - Vulnerability Heatmap
 * - Remediation Progress Dashboard
 */

import PDFKit from "pdfkit";
import {
  PROFESSIONAL_PALETTE,
  ProfessionalReportDesigner,
  formatCurrency,
  formatDuration,
  drawProgressBar,
} from "./report-visual-enhancements.js";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTIVE SUMMARY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function drawExecutiveSummaryDashboard(
  doc: PDFKit.PDFDocument,
  {
    riskScore,
    totalVulns,
    counts,
    fundsAtRisk,
    auditCostAvoided,
    estimatedFixHours,
    confidenceLevel,
    trendLabel,
    scanDate,
  }: {
    riskScore: number;
    totalVulns: number;
    counts: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number };
    fundsAtRisk: number;
    auditCostAvoided: number;
    estimatedFixHours: number;
    confidenceLevel: number;
    trendLabel: string;
    scanDate: string;
  }
) {
  const designer = new ProfessionalReportDesigner();

  // Page title
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(18).font("Helvetica-Bold");
  doc.text("Executive Summary Dashboard", MARGIN, MARGIN);
  doc.restore();

  doc.moveDown(0.8);

  // ─────────────────────────────────────────────────────────────────────────────
  // ROW 1: Risk Gauge + Key Metrics
  // ─────────────────────────────────────────────────────────────────────────────

  // Risk gauge (left)
  const gaugeX = MARGIN;
  const gaugeY = doc.y;
  designer.drawRiskGauge(doc, riskScore, gaugeX, gaugeY, 160, 110);

  // Key metrics (right)
  const metricsX = MARGIN + 180;
  let metricsY = gaugeY;

  const metricData = [
    { label: "Total Issues", value: String(totalVulns), subtext: "findings", color: PROFESSIONAL_PALETTE.info },
    { label: "Confidence", value: `${confidenceLevel}%`, subtext: "analysis", color: PROFESSIONAL_PALETTE.info },
    { label: "Trend", value: trendLabel, subtext: "vs baseline", color: PROFESSIONAL_PALETTE.accent },
  ];

  metricData.forEach((metric, i) => {
    if (i % 2 === 0 && i > 0) {
      metricsY += 78;
    }
    const colX = metricsX + (i % 2 === 0 ? 0 : 150);
    designer.drawMetricCard(doc, metric.label, metric.value, metric.subtext, colX, metricsY, 140, 68, metric.color);
  });

  doc.y = gaugeY + 120;
  doc.moveDown(0.5);

  // ─────────────────────────────────────────────────────────────────────────────
  // ROW 2: Severity Distribution + Legend
  // ─────────────────────────────────────────────────────────────────────────────

  designer.drawDivider(doc, MARGIN, doc.y, CONTENT_W);
  doc.moveDown(0.6);

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(12).font("Helvetica-Bold");
  doc.text("Severity Distribution", MARGIN, doc.y);
  doc.restore();
  doc.moveDown(0.5);

  const chartY = doc.y;
  const chartX = MARGIN + 20;
  designer.drawSeverityDistribution(doc, counts, chartX, chartY, 55);

  // Legend
  const legendX = MARGIN + 140;
  let legendY = chartY;
  designer.drawSeverityLegend(doc, counts, legendX, legendY, 350);

  doc.y = chartY + 100;
  doc.moveDown(0.3);

  // ─────────────────────────────────────────────────────────────────────────────
  // ROW 3: Financial Impact Cards
  // ─────────────────────────────────────────────────────────────────────────────

  designer.drawDivider(doc, MARGIN, doc.y, CONTENT_W);
  doc.moveDown(0.6);

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(12).font("Helvetica-Bold");
  doc.text("Financial Impact Analysis", MARGIN, doc.y);
  doc.restore();
  doc.moveDown(0.5);

  const cardY = doc.y;
  const cardWidth = (CONTENT_W - 20) / 3;

  designer.drawMetricCard(
    doc,
    "Funds at Risk",
    formatCurrency(fundsAtRisk),
    "if exploited",
    MARGIN,
    cardY,
    cardWidth,
    80,
    PROFESSIONAL_PALETTE.critical
  );

  designer.drawMetricCard(
    doc,
    "Audit Cost Avoided",
    formatCurrency(auditCostAvoided),
    "vs professional audit",
    MARGIN + cardWidth + 10,
    cardY,
    cardWidth,
    80,
    PROFESSIONAL_PALETTE.success
  );

  designer.drawMetricCard(
    doc,
    "Est. Fix Time",
    formatDuration(estimatedFixHours),
    "to remediate",
    MARGIN + (cardWidth + 10) * 2,
    cardY,
    cardWidth,
    80,
    PROFESSIONAL_PALETTE.accent
  );

  doc.y = cardY + 90;
  doc.moveDown(0.5);

  // ─────────────────────────────────────────────────────────────────────────────
  // ROW 4: Risk Summary Statement
  // ─────────────────────────────────────────────────────────────────────────────

  designer.drawDivider(doc, MARGIN, doc.y, CONTENT_W);
  doc.moveDown(0.6);

  const riskLevel = getRiskLevel(riskScore);
  const riskColor = getSeverityColor(riskScore);

  doc.save();
  doc.fillColor(riskColor).opacity(0.15);
  doc.roundedRect(MARGIN, doc.y, CONTENT_W, 80, 6).fill();
  doc.restore();

  doc.save();
  doc.fillColor(riskColor).fontSize(11).font("Helvetica-Bold");
  doc.text(`Risk Status: ${riskLevel}`, MARGIN + 12, doc.y + 8);

  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(9).font("Helvetica");
  const summary = generateRiskSummary(riskScore, totalVulns, counts);
  doc.text(summary, MARGIN + 12, doc.y + 28, { width: CONTENT_W - 24, lineGap: 2 });
  doc.restore();

  doc.y += 90;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK ASSESSMENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function drawRiskAssessmentDashboard(
  doc: PDFKit.PDFDocument,
  findings: Array<{
    impact: string;
    likelihood: string;
    severity: string;
    recommendation: string;
  }>
) {
  const designer = new ProfessionalReportDesigner();

  // Title
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(16).font("Helvetica-Bold");
  doc.text("Risk Assessment Matrix", MARGIN, MARGIN);
  doc.restore();

  doc.moveDown(0.8);

  // Explanation
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(9).font("Helvetica");
  doc.text(
    "The following matrix shows the relationship between potential impact, likelihood, and recommended remediation priority.",
    MARGIN,
    doc.y,
    { width: CONTENT_W, lineGap: 2 }
  );
  doc.restore();
  doc.moveDown(0.6);

  // Risk matrix
  const matrixY = doc.y;
  designer.drawRiskMatrix(doc, findings, MARGIN, matrixY, CONTENT_W);

  // Move down based on number of findings
  doc.y = matrixY + findings.length * 24 + 30;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VULNERABILITY HEATMAP DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function drawVulnerabilityHeatmap(
  doc: PDFKit.PDFDocument,
  findings: Array<{
    id: number;
    title: string;
    type: string;
    severity: string;
    cvss?: number;
  }>
) {
  const designer = new ProfessionalReportDesigner();

  // Title
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(16).font("Helvetica-Bold");
  doc.text("Vulnerability Summary Heatmap", MARGIN, MARGIN);
  doc.restore();

  doc.moveDown(0.8);

  // Explanation
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(9).font("Helvetica");
  doc.text(
    "High-level overview of all detected vulnerabilities, prioritized by severity and CVSS scoring.",
    MARGIN,
    doc.y,
    { width: CONTENT_W }
  );
  doc.restore();
  doc.moveDown(0.6);

  // Table
  const tableY = doc.y;
  designer.drawFindingsTable(doc, findings, MARGIN, tableY, CONTENT_W);

  doc.y = tableY + Math.min(findings.length, 15) * 20 + 40;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REMEDIATION PROGRESS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function drawRemediationProgressDashboard(
  doc: PDFKit.PDFDocument,
  {
    currentRisk: currentRiskScore,
    targetRisk,
    criticalRemaining,
    highRemaining,
    mediumRemaining,
    estimatedCompletionDays,
  }: {
    currentRisk: number;
    targetRisk: number;
    criticalRemaining: number;
    highRemaining: number;
    mediumRemaining: number;
    estimatedCompletionDays: number;
  }
) {
  const designer = new ProfessionalReportDesigner();

  // Title
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(16).font("Helvetica-Bold");
  doc.text("Remediation Progress & Roadmap", MARGIN, MARGIN);
  doc.restore();

  doc.moveDown(0.8);

  // ─────────────────────────────────────────────────────────────────────────────
  // Current vs Target Risk
  // ─────────────────────────────────────────────────────────────────────────────

  const gaugeRow = doc.y;

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(10).font("Helvetica-Bold");
  doc.text("Current Risk Score", MARGIN, gaugeRow);
  doc.restore();
  designer.drawRiskGauge(doc, currentRiskScore, MARGIN, gaugeRow + 20, 140, 100);

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(10).font("Helvetica-Bold");
  doc.text("Target Risk Score", MARGIN + 160, gaugeRow);
  doc.restore();
  designer.drawRiskGauge(doc, targetRisk, MARGIN + 160, gaugeRow + 20, 140, 100);

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(9).font("Helvetica");
  doc.text(`Expected improvement: ${currentRiskScore} → ${targetRisk}`, MARGIN + 320, gaugeRow + 50);
  doc.text(`Estimated completion: ${estimatedCompletionDays} days`, MARGIN + 320, gaugeRow + 70);
  doc.restore();

  doc.y = gaugeRow + 130;
  doc.moveDown(0.5);

  // ─────────────────────────────────────────────────────────────────────────────
  // Remaining Issues by Severity
  // ─────────────────────────────────────────────────────────────────────────────

  designer.drawDivider(doc, MARGIN, doc.y, CONTENT_W);
  doc.moveDown(0.6);

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(12).font("Helvetica-Bold");
  doc.text("Remaining Issues by Severity", MARGIN, doc.y);
  doc.restore();
  doc.moveDown(0.5);

  const remainingY = doc.y;
  const remainingItems = [
    { label: "CRITICAL", count: criticalRemaining, color: PROFESSIONAL_PALETTE.critical },
    { label: "HIGH", count: highRemaining, color: PROFESSIONAL_PALETTE.high },
    { label: "MEDIUM", count: mediumRemaining, color: PROFESSIONAL_PALETTE.medium },
  ];

  remainingItems.forEach((item, i) => {
    doc.save();
    doc.fillColor(item.color);
    doc.circle(MARGIN + 8, remainingY + i * 24 + 8, 4).fill();
    doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(9).font("Helvetica-Bold");
    doc.text(item.label, MARGIN + 20, remainingY + i * 24 + 2);
    doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(9);
    doc.text(`${item.count} issues`, MARGIN + 100, remainingY + i * 24 + 2);
    doc.restore();
  });

  doc.y = remainingY + remainingItems.length * 24 + 10;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getRiskLevel(score: number): string {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function getSeverityColor(score: number): string {
  if (score >= 80) return PROFESSIONAL_PALETTE.critical;
  if (score >= 60) return PROFESSIONAL_PALETTE.high;
  if (score >= 35) return PROFESSIONAL_PALETTE.medium;
  return PROFESSIONAL_PALETTE.low;
}

function generateRiskSummary(
  riskScore: number,
  totalVulns: number,
  counts: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number }
): string {
  const riskLevel = getRiskLevel(riskScore);

  if (counts.CRITICAL > 0) {
    return `This contract has ${counts.CRITICAL} CRITICAL vulnerabilities that pose immediate exploitation risk. ${riskLevel} risk assessment. Immediate remediation required before any deployment.`;
  } else if (counts.HIGH > 0) {
    return `This contract has ${counts.HIGH} HIGH severity issues that require resolution before mainnet deployment. Current risk level is ${riskLevel}. Recommended to address before production launch.`;
  } else if (counts.MEDIUM > 0) {
    return `This contract has ${counts.MEDIUM} MEDIUM severity findings worth addressing. Risk level is ${riskLevel}. Can proceed to testnet with monitoring, but mainnet deployment requires remediation.`;
  } else {
    return `This contract has minimal security concerns (${counts.LOW} LOW severity items). Risk level is ${riskLevel}. Generally ready for mainnet deployment after final professional review.`;
  }
}
