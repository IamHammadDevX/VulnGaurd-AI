/**
 * Professional Enterprise Cover Page Generator
 * 
 * Creates stunning, professional-grade cover pages with:
 * - Brand identity (VulnGuard AI logo)
 * - Executive report metadata
 * - Risk indicator
 * - Professional design patterns
 */

import PDFKit from "pdfkit";
import { PROFESSIONAL_PALETTE } from "./report-visual-enhancements.js";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

interface CoverPageOptions {
  contractName: string;
  riskScore: number;
  scanDate: string;
  scanId: string;
  clientName?: string;
  auditVersion?: string;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
}

/**
 * Draw professional enterprise cover page
 */
export function drawProfessionalCoverPage(doc: PDFKit.PDFDocument, options: CoverPageOptions) {
  const {
    contractName,
    riskScore,
    scanDate,
    scanId,
    clientName = "Security Audit Client",
    auditVersion = "2.0 (Enterprise Edition)",
    totalIssues,
    criticalCount,
    highCount,
  } = options;

  // ═══════════════════════════════════════════════════════════════════════════════
  // HEADER SECTION (Full-bleed gradient background)
  // ═══════════════════════════════════════════════════════════════════════════════

  // Background gradient effect (navy to dark blue)
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.primary);
  doc.rect(0, 0, PAGE_W, 300).fill();

  // Accent top bar
  doc.fillColor(PROFESSIONAL_PALETTE.accent);
  doc.rect(0, 0, PAGE_W, 6).fill();

  // Subtle gradient overlay pattern (simulated with rectangles)
  doc.fillColor(PROFESSIONAL_PALETTE.primaryDark).opacity(0.4);
  for (let i = 0; i < PAGE_W; i += 40) {
    doc.rect(i, 0, 20, 300).fill();
  }
  doc.restore();

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGO & BRANDING
  // ─────────────────────────────────────────────────────────────────────────────

  doc.save();

  // Logo circle (V)
  doc.fillColor(PROFESSIONAL_PALETTE.accent);
  doc.circle(MARGIN + 25, 75, 22).fill();

  doc.fillColor(PROFESSIONAL_PALETTE.white).fontSize(24).font("Helvetica-Bold");
  doc.text("V", MARGIN + 18, 64);

  // Company name
  doc.fillColor(PROFESSIONAL_PALETTE.white).fontSize(28).font("Helvetica-Bold");
  doc.text("VulnGuard AI", MARGIN + 60, 60);

  doc.fillColor(PROFESSIONAL_PALETTE.accent).fontSize(11).font("Helvetica");
  doc.text("Smart Contract Security Audit", MARGIN + 60, 92);

  doc.fillColor(PROFESSIONAL_PALETTE.textLight).fontSize(9).font("Helvetica");
  doc.text("Enterprise-Grade Vulnerability Assessment Report", MARGIN + 60, 105);

  doc.restore();

  // ─────────────────────────────────────────────────────────────────────────────
  // METADATA SECTION (Right side of header)
  // ─────────────────────────────────────────────────────────────────────────────

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.white).fontSize(8).font("Helvetica");
  doc.text(`Generated: ${scanDate}`, PAGE_W - MARGIN - 160, 65);
  doc.text(`Report ID: ${scanId.substring(0, 16)}...`, PAGE_W - MARGIN - 160, 78);
  doc.text(`Version: ${auditVersion}`, PAGE_W - MARGIN - 160, 91);
  doc.text(`Classification: CONFIDENTIAL`, PAGE_W - MARGIN - 160, 104);
  doc.restore();

  // ─────────────────────────────────────────────────────────────────────────────
  // HORIZONTAL DIVIDER
  // ─────────────────────────────────────────────────────────────────────────────

  doc.save();
  doc.strokeColor(PROFESSIONAL_PALETTE.accent).opacity(0.4).lineWidth(2);
  doc.moveTo(MARGIN, 135).lineTo(PAGE_W - MARGIN, 135).stroke();
  doc.restore();

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN CONTENT SECTION
  // ═══════════════════════════════════════════════════════════════════════════════

  // Subtitle
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(14).font("Helvetica-Bold");
  doc.text("Security Audit Report", MARGIN, 160);
  doc.restore();

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN CARD: CONTRACT INFORMATION
  // ─────────────────────────────────────────────────────────────────────────────

  const cardX = MARGIN;
  const cardY = 195;
  const cardW = CONTENT_W;
  const cardH = 180;

  // Card background
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.light);
  doc.roundedRect(cardX, cardY, cardW, cardH, 10).fill();

  // Left accent bar
  doc.fillColor(PROFESSIONAL_PALETTE.accent);
  doc.roundedRect(cardX, cardY, 5, cardH, 5).fill();

  // Border
  doc.strokeColor(PROFESSIONAL_PALETTE.accent).lineWidth(1.5).opacity(0.3);
  doc.roundedRect(cardX, cardY, cardW, cardH, 10).stroke();
  doc.restore();

  // Contract name
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(11).font("Helvetica-Bold");
  doc.text("CONTRACT UNDER AUDIT", cardX + 20, cardY + 20, { characterSpacing: 1 });

  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(22).font("Helvetica-Bold");
  doc.text(contractName, cardX + 20, cardY + 40, { width: cardW - 180 });

  doc.restore();

  // Risk score badge (right side)
  const riskColor = getRiskColor(riskScore);
  doc.save();
  doc.fillColor(riskColor).opacity(0.12);
  doc.circle(PAGE_W - MARGIN - 60, cardY + 80, 50).fill();

  doc.fillColor(riskColor).fontSize(32).font("Helvetica-Bold");
  doc.text(String(riskScore), PAGE_W - MARGIN - 85, cardY + 60, { width: 60, align: "center" });

  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(9).font("Helvetica");
  doc.text("/ 100", PAGE_W - MARGIN - 85, cardY + 95, { width: 60, align: "center" });

  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(9).font("Helvetica-Bold");
  doc.text("RISK SCORE", PAGE_W - MARGIN - 85, cardY + 112, { width: 60, align: "center", characterSpacing: 0.5 });
  doc.restore();

  // Divider line
  doc.save();
  doc.strokeColor(PROFESSIONAL_PALETTE.silver).lineWidth(0.5);
  doc.moveTo(cardX + 20, cardY + 78).lineTo(PAGE_W - MARGIN - 120, cardY + 78).stroke();
  doc.restore();

  // Card details (3 columns)
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(8).font("Helvetica-Bold");
  doc.text("Audit Date", cardX + 20, cardY + 90, { characterSpacing: 0.5 });
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(9).font("Helvetica");
  const dateObj = new Date(scanDate);
  doc.text(dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), cardX + 20, cardY + 102);

  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(8).font("Helvetica-Bold");
  doc.text("Total Issues", cardX + 145, cardY + 90, { characterSpacing: 0.5 });
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(9).font("Helvetica");
  doc.text(String(totalIssues), cardX + 145, cardY + 102);

  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(8).font("Helvetica-Bold");
  doc.text("Critical Issues", cardX + 240, cardY + 90, { characterSpacing: 0.5 });
  doc.fillColor(PROFESSIONAL_PALETTE.critical).fontSize(9).font("Helvetica-Bold");
  doc.text(String(criticalCount), cardX + 240, cardY + 102);

  // Severity indicators
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(8).font("Helvetica-Bold");
  doc.text("Severity Breakdown", cardX + 20, cardY + 128, { characterSpacing: 0.5 });

  const severities = [
    { label: "CRITICAL", count: criticalCount, color: PROFESSIONAL_PALETTE.critical },
    { label: "HIGH", count: highCount, color: PROFESSIONAL_PALETTE.high },
  ];

  let badgeX = cardX + 20;
  severities.forEach(({ label, count, color }) => {
    if (count > 0) {
      doc.save();
      doc.fillColor(color).opacity(0.15);
      doc.roundedRect(badgeX, cardY + 140, 55, 18, 3).fill();
      doc.fillColor(color).font("Helvetica-Bold").fontSize(8);
      doc.text(`${label}`, badgeX + 4, cardY + 142);
      doc.text(`(${count})`, badgeX + 4, cardY + 154);
      doc.restore();
      badgeX += 65;
    }
  });

  doc.restore();

  // ═══════════════════════════════════════════════════════════════════════════════
  // KEY METRICS SECTION
  // ═══════════════════════════════════════════════════════════════════════════════

  const metricsY = cardY + cardH + 40;

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(12).font("Helvetica-Bold");
  doc.text("Key Metrics", MARGIN, metricsY);
  doc.restore();

  // Metric boxes
  const metricBoxW = (CONTENT_W - 20) / 3;
  const metricBoxH = 70;

  const metrics = [
    {
      title: "Risk Assessment",
      value: getRiskLevel(riskScore),
      color: riskColor,
      detail: "requires immediate attention" + (riskScore > 80 ? " before deployment" : ""),
    },
    {
      title: "Production Ready",
      value: criticalCount === 0 ? "PARTIAL" : "NO",
      color: criticalCount === 0 ? PROFESSIONAL_PALETTE.success : PROFESSIONAL_PALETTE.critical,
      detail: `${criticalCount} critical blocker${criticalCount !== 1 ? "s" : ""}`,
    },
    {
      title: "Recommended Action",
      value: "FIX & RESCAN",
      color: PROFESSIONAL_PALETTE.accent,
      detail: "before mainnet launch",
    },
  ];

  metrics.forEach((metric, i) => {
    const metricX = MARGIN + i * (metricBoxW + 10);

    // Background
    doc.save();
    doc.fillColor(metric.color).opacity(0.08);
    doc.roundedRect(metricX, metricsY + 30, metricBoxW, metricBoxH, 6).fill();

    // Top bar
    doc.fillColor(metric.color);
    doc.roundedRect(metricX, metricsY + 30, metricBoxW, 4, 3).fill();

    // Border
    doc.strokeColor(metric.color).lineWidth(1).opacity(0.25);
    doc.roundedRect(metricX, metricsY + 30, metricBoxW, metricBoxH, 6).stroke();
    doc.restore();

    // Content
    doc.save();
    doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(8).font("Helvetica-Bold");
    doc.text(metric.title, metricX + 8, metricsY + 40);

    doc.fillColor(metric.color).fontSize(16).font("Helvetica-Bold");
    doc.text(metric.value, metricX + 8, metricsY + 52);

    doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(7).font("Helvetica");
    doc.text(metric.detail, metricX + 8, metricsY + 73, { width: metricBoxW - 16, ellipsis: true });
    doc.restore();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // CLIENT & DISCLAIMER SECTION
  // ═══════════════════════════════════════════════════════════════════════════════

  const footerY = PAGE_H - 160;

  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(8).font("Helvetica-Bold");
  doc.text("CLIENT ORGANIZATION", MARGIN, footerY, { characterSpacing: 0.5 });

  doc.fillColor(PROFESSIONAL_PALETTE.textPrimary).fontSize(10).font("Helvetica");
  doc.text(clientName, MARGIN, footerY + 16);
  doc.restore();

  // Disclaimer box
  const disclaimerY = PAGE_H - 100;
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.critical).opacity(0.08);
  doc.roundedRect(MARGIN, disclaimerY, CONTENT_W, 60, 4).fill();

  doc.fillColor(PROFESSIONAL_PALETTE.critical).fontSize(8).font("Helvetica-Bold");
  doc.text("DISCLAIMER", MARGIN + 8, disclaimerY + 6, { characterSpacing: 0.5 });

  doc.fillColor(PROFESSIONAL_PALETTE.textMuted).fontSize(7).font("Helvetica");
  doc.text(
    "This automated security audit is for informational purposes only. It is not a substitute for professional manual security audits. Always commission a formal security review from a reputable firm before mainnet deployment.",
    MARGIN + 8,
    disclaimerY + 18,
    { width: CONTENT_W - 16, lineGap: 1.5 }
  );
  doc.restore();

  // ─────────────────────────────────────────────────────────────────────────────
  // FOOTER DECORATION
  // ─────────────────────────────────────────────────────────────────────────────

  doc.save();
  doc.strokeColor(PROFESSIONAL_PALETTE.accent).lineWidth(1.5).opacity(0.4);
  doc.moveTo(MARGIN, PAGE_H - 20).lineTo(PAGE_W - MARGIN, PAGE_H - 20).stroke();

  doc.fillColor(PROFESSIONAL_PALETTE.textLight).fontSize(7).font("Helvetica");
  doc.text("CONFIDENTIAL - This report is for authorized use only", MARGIN, PAGE_H - 14, {
    width: CONTENT_W,
    align: "center",
  });
  doc.restore();
}

/**
 * Helper functions
 */

function getRiskColor(score: number): string {
  if (score >= 80) return PROFESSIONAL_PALETTE.critical;
  if (score >= 60) return PROFESSIONAL_PALETTE.high;
  if (score >= 35) return PROFESSIONAL_PALETTE.medium;
  return PROFESSIONAL_PALETTE.low;
}

function getRiskLevel(score: number): string {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}
