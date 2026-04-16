import { Router, type IRouter } from "express";
import PDFDocument from "pdfkit";
import { GetReportParams } from "@workspace/api-zod";
import { reportLimiter } from "../../middlewares/rateLimitMiddleware.js";
import { getScan } from "./store.js";

const router: IRouter = Router();

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
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
};

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

type SevKey = keyof typeof C & ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW");

// ── Helper: draw page header strip ───────────────────────────────────────────
function drawPageHeader(doc: PDFKit.PDFDocument, title: string, pageNum: number, totalPages: number) {
  doc.save()
    .fillColor(C.headerBg2)
    .rect(0, 0, PAGE_W, 36)
    .fill()
    .fillColor(C.accent)
    .fontSize(8).font("Helvetica-Bold")
    .text("VulnGuard AI", MARGIN, 13)
    .fillColor(C.textLight)
    .fontSize(8).font("Helvetica")
    .text(title, MARGIN + 75, 13)
    .fillColor(C.textLight)
    .fontSize(8)
    .text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN - 40, 13, { width: 40, align: "right" })
    .restore();
}

// ── Helper: draw page footer ──────────────────────────────────────────────────
function drawPageFooter(doc: PDFKit.PDFDocument, scanDate: string) {
  doc.save()
    .fillColor(C.borderLight)
    .rect(MARGIN, PAGE_H - 32, CONTENT_W, 0.5)
    .fill()
    .fillColor(C.textLight)
    .fontSize(7.5).font("Helvetica")
    .text(
      `VulnGuard AI Security Audit  ·  ${scanDate}  ·  This report is for informational purposes only. Always consult a professional auditor before mainnet deployment.`,
      MARGIN, PAGE_H - 26, { width: CONTENT_W, align: "center" }
    )
    .restore();
}

// ── Helper: horizontal rule ───────────────────────────────────────────────────
function hr(doc: PDFKit.PDFDocument, y?: number, color = C.borderLight) {
  const lineY = y ?? doc.y;
  doc.save()
    .strokeColor(color).lineWidth(0.5)
    .moveTo(MARGIN, lineY).lineTo(PAGE_W - MARGIN, lineY).stroke()
    .restore();
  if (!y) doc.moveDown(0.4);
}

// ── Helper: severity badge inline ─────────────────────────────────────────────
function sevBadge(doc: PDFKit.PDFDocument, x: number, y: number, severity: string) {
  const color = C[severity as SevKey] ?? C.textMuted;
  const w = 52, h = 14;
  doc.save()
    .fillColor(color).opacity(0.15)
    .roundedRect(x, y, w, h, 3).fill()
    .opacity(1)
    .fillColor(color)
    .fontSize(7.5).font("Helvetica-Bold")
    .text(severity, x, y + 3, { width: w, align: "center" })
    .restore();
}

// ── Helper: section label ─────────────────────────────────────────────────────
function sectionLabel(doc: PDFKit.PDFDocument, text: string) {
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(7.5).font("Helvetica-Bold")
    .text(text.toUpperCase(), { characterSpacing: 0.8 })
    .restore()
    .moveDown(0.25);
}

// ── Pie chart (drawn as PDFKit SVG arcs) ─────────────────────────────────────
function drawPieChart(
  doc: PDFKit.PDFDocument,
  cx: number,
  cy: number,
  r: number,
  counts: Record<string, number>
) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    doc.save()
      .fillColor(C.green).opacity(0.2)
      .circle(cx, cy, r).fill()
      .opacity(1)
      .fillColor(C.green)
      .fontSize(9).font("Helvetica-Bold")
      .text("CLEAN", cx - 20, cy - 6, { width: 40, align: "center" })
      .restore();
    return;
  }

  let startAngle = -Math.PI / 2;

  for (const sev of SEVERITY_ORDER) {
    const count = counts[sev] ?? 0;
    if (count === 0) continue;
    const sweep = (count / total) * 2 * Math.PI;
    const endAngle = startAngle + sweep;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;

    const pathStr = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = C[sev as SevKey];

    doc.save()
      .fillColor(color)
      .path(pathStr).fill()
      .restore();

    startAngle = endAngle;
  }

  // White donut hole
  doc.save()
    .fillColor(C.bg)
    .circle(cx, cy, r * 0.52).fill()
    .restore();

  // Center label: total count
  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(14).font("Helvetica-Bold")
    .text(String(total), cx - 20, cy - 10, { width: 40, align: "center" })
    .fillColor(C.textMuted)
    .fontSize(7).font("Helvetica")
    .text("issues", cx - 20, cy + 6, { width: 40, align: "center" })
    .restore();
}

// ── Code block ────────────────────────────────────────────────────────────────
function codeBlock(
  doc: PDFKit.PDFDocument,
  code: string,
  label: string,
  bgColor: string,
  borderColor: string,
  textColor: string
) {
  const MAX_CHARS = 800;
  const displayCode = code.length > MAX_CHARS
    ? code.substring(0, MAX_CHARS) + "\n... (truncated)"
    : code;

  const lineCount = displayCode.split("\n").length;
  const estHeight = Math.min(lineCount * 11 + 28, 220);

  if (doc.y + estHeight > PAGE_H - MARGIN - 40) doc.addPage();

  const startY = doc.y;
  doc.save()
    .fillColor(bgColor).opacity(0.6)
    .roundedRect(MARGIN, startY, CONTENT_W, 16, 4).fill()
    .opacity(1)
    .fillColor(textColor)
    .fontSize(7.5).font("Helvetica-Bold")
    .text(label, MARGIN + 8, startY + 4)
    .restore();

  doc.y = startY + 16;

  const codeStartY = doc.y;
  const codeText = displayCode;
  const approxCodeH = Math.min(lineCount * 10.5, 200);

  doc.save()
    .fillColor(bgColor).opacity(0.35)
    .rect(MARGIN, codeStartY, CONTENT_W, approxCodeH + 10).fill()
    .strokeColor(borderColor).opacity(0.5).lineWidth(0.5)
    .rect(MARGIN, startY, CONTENT_W, approxCodeH + 26).stroke()
    .opacity(1)
    .restore();

  doc.save()
    .fillColor(textColor).opacity(0.9)
    .fontSize(7).font("Courier")
    .text(codeText, MARGIN + 8, codeStartY + 4, {
      width: CONTENT_W - 16,
      lineGap: 1.5,
    })
    .restore();

  doc.moveDown(0.6);
}

// ── Main route ────────────────────────────────────────────────────────────────
router.get("/report/:scanId", reportLimiter, (req, res) => {
  const parseResult = GetReportParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid scan ID" });
    return;
  }

  const { scanId } = parseResult.data;
  const scan = getScan(scanId);

  if (!scan) {
    res.status(404).json({
      error: "Scan not found. Reports are session-based and expire when the server restarts.",
    });
    return;
  }

  try {
    // Sort vulnerabilities by severity
    const SEV_RANK: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const vulns = (scan.vulnerabilities as Array<{
      id: number;
      severity: string;
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
    }>).slice().sort((a, b) => (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9));

    const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    vulns.forEach((v) => { if (v.severity in counts) counts[v.severity]++; });

    const riskColor = scan.risk_score >= 70 ? C.CRITICAL : scan.risk_score >= 40 ? C.HIGH : C.LOW;
    const scanDate = new Date(scan.timestamp).toUTCString();
    const scanDateShort = new Date(scan.timestamp).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    // We'll track pages to add headers/footers
    // PDFKit approach: collect pages, add header/footer via pageAdded event
    const totalEstPages = 5 + Math.ceil(vulns.length / 1.5);

    const doc = new PDFDocument({ margin: 0, size: "A4", autoFirstPage: false });
    const filename = `${scan.contract_name.replace(/[^a-zA-Z0-9]/g, "_")}-audit-report.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    
    // Handle errors during PDF generation
    doc.on("error", (err) => {
      req.log.error({ err }, "Error generating PDF");
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate PDF report" });
      }
    });

    doc.pipe(res);

  let currentPage = 0;
  let currentPageTitle = "Cover";

  function addPage(title: string) {
    currentPage++;
    currentPageTitle = title;
    doc.addPage();
    if (currentPage > 1) {
      drawPageHeader(doc, currentPageTitle, currentPage, totalEstPages);
    }
    drawPageFooter(doc, scanDateShort);
    doc.y = currentPage === 1 ? MARGIN : 50;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════════════════════════════
  addPage("Cover");

  // Full-bleed dark header
  doc.save()
    .fillColor(C.headerBg)
    .rect(0, 0, PAGE_W, 240)
    .fill()
    .restore();

  // Gradient accent line
  doc.save()
    .fillColor(C.accent)
    .rect(0, 0, PAGE_W, 4)
    .fill()
    .restore();

  // Logo area
  doc.save()
    .fillColor(C.accent)
    .circle(MARGIN + 20, 68, 18).fill()
    .fillColor(C.white)
    .fontSize(16).font("Helvetica-Bold")
    .text("V", MARGIN + 13, 59)
    .restore();

  doc.save()
    .fillColor(C.white)
    .fontSize(32).font("Helvetica-Bold")
    .text("VulnGuard AI", MARGIN + 48, 54)
    .fillColor(C.textLight)
    .fontSize(12).font("Helvetica")
    .text("Smart Contract Security Audit", MARGIN + 48, 90)
    .fontSize(10)
    .text("AI-Powered Vulnerability Detection & Analysis Report", MARGIN + 48, 106)
    .restore();

  // Horizontal rule inside header
  doc.save()
    .strokeColor(C.accent).opacity(0.3).lineWidth(1)
    .moveTo(MARGIN, 130).lineTo(PAGE_W - MARGIN, 130).stroke()
    .opacity(1).restore();

  // Generated date and metadata
  doc.save()
    .fillColor(C.textLight)
    .fontSize(9).font("Helvetica")
    .text(`Generated: ${scanDate}`, MARGIN, 142)
    .text(`Report Version: 1.0`, PAGE_W - MARGIN - 120, 142, { width: 120, align: "right" })
    .restore();

  doc.y = 160;

  // Report type badge
  doc.save()
    .fillColor(C.accent).opacity(0.15)
    .roundedRect(MARGIN, 160, 140, 24, 4).fill()
    .opacity(1)
    .fillColor(C.accent)
    .fontSize(9).font("Helvetica-Bold")
    .text("AUTOMATED SECURITY AUDIT", MARGIN + 8, 166)
    .restore();

  doc.y = 200;

  // Contract card - professional styling
  doc.save()
    .fillColor(C.cardBg)
    .roundedRect(MARGIN, 200, CONTENT_W, 130, 8).fill()
    .strokeColor(C.borderLight).lineWidth(1)
    .roundedRect(MARGIN, 200, CONTENT_W, 130, 8).stroke()
    .restore();

  // Left accent strip
  doc.save()
    .fillColor(riskColor)
    .roundedRect(MARGIN, 200, 4, 130, 2).fill()
    .restore();

  doc.save()
    .fillColor(C.textMuted).fontSize(8).font("Helvetica-Bold")
    .text("CONTRACT UNDER AUDIT", MARGIN + 18, 212, { characterSpacing: 0.5 })
    .fillColor(C.textPrimary)
    .fontSize(20).font("Helvetica-Bold")
    .text(scan.contract_name, MARGIN + 18, 224, { width: CONTENT_W - 120 })
    .restore();

  // Risk score circle (right side) - improved design
  const rscX = PAGE_W - MARGIN - 65, rscY = 248;
  doc.save()
    .fillColor(riskColor).opacity(0.12)
    .circle(rscX, rscY, 42).fill()
    .opacity(1)
    .fillColor(riskColor)
    .fontSize(26).font("Helvetica-Bold")
    .text(String(scan.risk_score), rscX - 26, rscY - 18, { width: 52, align: "center" })
    .fillColor(C.textMuted)
    .fontSize(8).font("Helvetica")
    .text("/ 100", rscX - 26, rscY + 10, { width: 52, align: "center" })
    .fillColor(C.textPrimary)
    .fontSize(8).font("Helvetica-Bold")
    .text("RISK SCORE", rscX - 26, rscY + 26, { width: 52, align: "center", characterSpacing: 0.3 })
    .restore();

  // Risk level indicator
  const riskLevel = scan.risk_score >= 70 ? "CRITICAL" : scan.risk_score >= 40 ? "HIGH" : scan.risk_score >= 20 ? "MEDIUM" : "LOW";
  doc.save()
    .fillColor(riskColor).opacity(0.15)
    .roundedRect(MARGIN + 18, 298, 65, 16, 3).fill()
    .opacity(1)
    .fillColor(riskColor)
    .fontSize(9).font("Helvetica-Bold")
    .text(riskLevel, MARGIN + 18, 300, { width: 65, align: "center" })
    .restore();

  // Scan details in card
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(8.5).font("Helvetica")
    .text(`Scan ID:  ${scanId}`, MARGIN + 95, 306)
    .text(`Code Hash:  ${scan.code_hash.substring(0, 24)}...`, PAGE_W - MARGIN - 220, 306, { width: 210 })
    .text(`Analysis Time:  ${(scan.analysis_time_ms / 1000).toFixed(2)}s`, MARGIN + 95, 318)
    .text(`Audit Date:  ${scanDateShort}`, PAGE_W - MARGIN - 220, 318, { width: 210 })
    .restore();

  doc.y = 334;

  // ── Severity summary boxes - enhanced ────────────────────────────────────────
  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(14).font("Helvetica-Bold")
    .text("Findings Overview", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.8);

  const boxW = (CONTENT_W - 18) / 4;
  const boxY = doc.y;

  SEVERITY_ORDER.forEach((sev, i) => {
    const bx = MARGIN + i * (boxW + 6);
    const color = C[sev];
    const count = counts[sev];
    const pct = scan.total_vulnerabilities > 0
      ? Math.round((count / scan.total_vulnerabilities) * 100)
      : 0;
    
    doc.save()
      .fillColor(color).opacity(0.08)
      .roundedRect(bx, boxY, boxW, 80, 6).fill()
      .opacity(1)
      .strokeColor(color).opacity(0.25).lineWidth(0.5)
      .roundedRect(bx, boxY, boxW, 80, 6).stroke()
      .opacity(1)
      .fillColor(color)
      .roundedRect(bx, boxY, boxW, 3, 3).fill()
      .fillColor(color)
      .fontSize(32).font("Helvetica-Bold")
      .text(String(count), bx, boxY + 12, { width: boxW, align: "center" })
      .fillColor(C.textMuted)
      .fontSize(8.5).font("Helvetica-Bold")
      .text(sev, bx, boxY + 48, { width: boxW, align: "center", characterSpacing: 0.4 })
      .fontSize(7.5)
      .text(`${pct}%`, bx, boxY + 60, { width: boxW, align: "center" })
      .restore();
  });

  doc.y = boxY + 96;

  // ── Summary paragraph ─────────────────────────────────────────────────────
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(9).font("Helvetica")
    .text(scan.summary, MARGIN, doc.y, { width: CONTENT_W, lineGap: 3 })
    .restore();
  doc.moveDown(1);

  // ── Full contract hash ────────────────────────────────────────────────────
  hr(doc);
  doc.save()
    .fillColor(C.textMuted).fontSize(7.5).font("Helvetica-Bold")
    .text("CONTRACT CODE SHA-256", MARGIN, doc.y, { characterSpacing: 0.5 })
    .restore();
  doc.moveDown(0.3);
  doc.save()
    .fillColor(C.accent).fontSize(8.5).font("Courier")
    .text(scan.code_hash, MARGIN, doc.y)
    .restore();

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1.5 — TABLE OF CONTENTS
  // ════════════════════════════════════════════════════════════════════════════
  addPage("Table of Contents");

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(18).font("Helvetica-Bold")
    .text("Table of Contents", MARGIN, doc.y)
    .restore();
  doc.moveDown(1.2);

  const tocItems = [
    { title: "Executive Summary", page: 2 },
    { title: "Risk Assessment Matrix", page: 2 },
    { title: "Vulnerability Details", page: 3 },
    { title: "Remediation Strategies", page: 3 + Math.ceil(vulns.length / 1.5) },
    { title: "Security Best Practices", page: 3 + Math.ceil(vulns.length / 1.5) + 1 },
    { title: "References & Resources", page: 3 + Math.ceil(vulns.length / 1.5) + 2 },
  ];

  tocItems.forEach((item, i) => {
    const tocY = doc.y;
    doc.save()
      .fillColor(C.accent).fontSize(10).font("Helvetica-Bold")
      .text(`${i + 1}. ${item.title}`, MARGIN, tocY)
      .fillColor(C.textMuted).fontSize(9)
      .text(`Page ${item.page}`, PAGE_W - MARGIN - 40, tocY, { width: 40, align: "right" })
      .restore();
    doc.moveDown(0.5);
  });

  doc.moveDown(0.8);
  hr(doc);

  // Audit info box
  doc.save()
    .fillColor(C.blue).opacity(0.08)
    .roundedRect(MARGIN, doc.y, CONTENT_W, 70, 6).fill()
    .opacity(1).restore();

  doc.save()
    .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
    .text("About This Audit", MARGIN + 12, doc.y + 6)
    .fillColor(C.textMuted).fontSize(8.5).font("Helvetica")
    .text("This is an automated security audit report generated by VulnGuard AI. It analyzes your smart contract code for 36+ types of vulnerabilities based on SWC (Smart Contract Weakness Classification) standards. While this tool provides valuable insights, it should be complemented with manual code review and professional security audits before mainnet deployment.", MARGIN + 12, doc.y + 18, { width: CONTENT_W - 24, lineGap: 2 })
    .restore();

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — EXECUTIVE SUMMARY WITH PIE CHART & RISK MATRIX
  // ════════════════════════════════════════════════════════════════════════════
  addPage("Executive Summary");

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(18).font("Helvetica-Bold")
    .text("Executive Summary", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.8);

  // Chart + legend side by side
  const chartY = doc.y;
  const chartCX = MARGIN + 90;
  const chartCY = chartY + 85;
  const chartR = 70;

  drawPieChart(doc, chartCX, chartCY, chartR, counts);

  // Legend to the right of chart
  const legendX = MARGIN + 180;
  let legendY = chartY + 30;

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(10).font("Helvetica-Bold")
    .text("Severity Breakdown", legendX, legendY)
    .restore();
  legendY += 20;

  SEVERITY_ORDER.forEach((sev) => {
    const color = C[sev];
    const count = counts[sev];
    const pct = scan.total_vulnerabilities > 0
      ? Math.round((count / scan.total_vulnerabilities) * 100)
      : 0;

    // Color dot
    doc.save().fillColor(color).circle(legendX + 6, legendY + 5, 5).fill().restore();

    // Bar background
    const barMaxW = 120;
    const barW = Math.round((pct / 100) * barMaxW);
    doc.save()
      .fillColor(C.borderLight)
      .roundedRect(legendX + 18, legendY + 1, barMaxW, 9, 2).fill()
      .fillColor(color).opacity(0.7)
      .roundedRect(legendX + 18, legendY + 1, Math.max(barW, 1), 9, 2).fill()
      .opacity(1).restore();

    doc.save()
      .fillColor(C.textPrimary).fontSize(8).font("Helvetica-Bold")
      .text(sev, legendX + 148, legendY)
      .fillColor(C.textMuted).fontSize(8).font("Helvetica")
      .text(`${count}  (${pct}%)`, legendX + 200, legendY)
      .restore();

    legendY += 20;
  });

  // Overall stats below legend
  legendY += 10;
  doc.save()
    .fillColor(C.textMuted).fontSize(8).font("Helvetica")
    .text(`Total Issues:  ${scan.total_vulnerabilities}`, legendX, legendY)
    .text(`Risk Score:    ${scan.risk_score} / 100`, legendX, legendY + 13)
    .text(`Audit Time:    ${(scan.analysis_time_ms / 1000).toFixed(2)}s`, legendX, legendY + 26)
    .restore();

  doc.y = chartCY + chartR + 20;
  doc.moveDown(0.5);
  hr(doc);

  // Risk Assessment Matrix
  doc.save()
    .fillColor(C.textPrimary).fontSize(11).font("Helvetica-Bold")
    .text("Risk Assessment Matrix", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  const matrixData = [
    { impact: "Funds at Risk", likelihood: vulns.filter(v => v.severity === "CRITICAL").length > 0 ? "High" : "Low", severity: "CRITICAL", recommendation: "Fix immediately before any deployment" },
    { impact: "Contract Malfunction", likelihood: vulns.filter(v => v.severity === "HIGH").length > 0 ? "Medium-High" : "Low", severity: "HIGH", recommendation: "Fix before mainnet deployment" },
    { impact: "Unexpected Behavior", likelihood: vulns.filter(v => v.severity === "MEDIUM").length > 0 ? "Medium" : "Low", severity: "MEDIUM", recommendation: "Fix before mainnet, or add monitoring" },
    { impact: "Minor Issues", likelihood: vulns.filter(v => v.severity === "LOW").length > 0 ? "Low" : "None", severity: "LOW", recommendation: "Address in future updates" },
  ];

  const matColW = (CONTENT_W - 30) / 4;
  const matY = doc.y;

  // Matrix header
  doc.save()
    .fillColor(C.headerBg2)
    .rect(MARGIN, matY, CONTENT_W, 18).fill()
    .fillColor(C.textLight).fontSize(7.5).font("Helvetica-Bold")
    .text("IMPACT", MARGIN + 6, matY + 5)
    .text("LIKELIHOOD", MARGIN + matColW + 6, matY + 5)
    .text("SEVERITY", MARGIN + matColW * 2 + 6, matY + 5)
    .text("RECOMMENDED ACTION", MARGIN + matColW * 3 + 6, matY + 5)
    .restore();
  doc.moveDown(0.9);

  matrixData.forEach((row, i) => {
    const rowY = doc.y;
    const rowBg = i % 2 === 0 ? "#f8fafc" : C.white;
    const sevColor = C[row.severity as SevKey] ?? C.textMuted;
    
    doc.save()
      .fillColor(rowBg)
      .rect(MARGIN, rowY, CONTENT_W, 16).fill()
      .fillColor(C.textPrimary).fontSize(8).font("Helvetica")
      .text(row.impact, MARGIN + 6, rowY + 4, { width: matColW - 12 })
      .text(row.likelihood, MARGIN + matColW + 6, rowY + 4, { width: matColW - 12 })
      .fillColor(sevColor).font("Helvetica-Bold")
      .text(row.severity, MARGIN + matColW * 2 + 6, rowY + 4, { width: matColW - 12 })
      .fillColor(C.textMuted).font("Helvetica").fontSize(7.5)
      .text(row.recommendation, MARGIN + matColW * 3 + 6, rowY + 2, { width: matColW - 12, ellipsis: true })
      .restore();
    doc.moveDown(0.55);

    // subtle divider
    doc.save().strokeColor(C.borderLight).lineWidth(0.3)
      .moveTo(MARGIN, doc.y).lineTo(PAGE_W - MARGIN, doc.y).stroke()
      .restore();
    doc.moveDown(0.1);
  });

  // Findings table
  doc.save()
    .fillColor(C.textPrimary).fontSize(11).font("Helvetica-Bold")
    .text("Findings Summary", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  // Table header
  const colTitle = MARGIN, colType = MARGIN + 185, colLine = MARGIN + 340, colSev = MARGIN + 410;
  doc.save()
    .fillColor(C.headerBg2)
    .rect(MARGIN, doc.y, CONTENT_W, 18).fill()
    .fillColor(C.textLight).fontSize(7.5).font("Helvetica-Bold")
    .text("TITLE", colTitle + 6, doc.y + 5)
    .text("TYPE", colType, doc.y + 5)
    .text("LINE", colLine, doc.y + 5)
    .text("SEVERITY", colSev, doc.y + 5)
    .restore();
  doc.moveDown(0.9);

  vulns.slice(0, 10).forEach((v, i) => {
    if (doc.y > PAGE_H - MARGIN - 30) {
      addPage("Executive Summary");
      doc.y = 55;
    }

    const rowY = doc.y;
    const rowBg = i % 2 === 0 ? "#f8fafc" : C.white;
    doc.save()
      .fillColor(rowBg)
      .rect(MARGIN, rowY, CONTENT_W, 16).fill()
      .fillColor(C.textPrimary).fontSize(8).font("Helvetica")
      .text(v.title, colTitle + 6, rowY + 4, { width: 172, ellipsis: true })
      .fillColor(C.textMuted).fontSize(8)
      .text(v.type, colType, rowY + 4, { width: 140, ellipsis: true })
      .text(v.affected_lines ?? (v.line_number ? `${v.line_number}` : "—"), colLine, rowY + 4, { width: 60 })
      .restore();
    sevBadge(doc, colSev, rowY + 1, v.severity);
    doc.moveDown(0.55);

    // subtle divider
    doc.save().strokeColor(C.borderLight).lineWidth(0.3)
      .moveTo(MARGIN, doc.y).lineTo(PAGE_W - MARGIN, doc.y).stroke()
      .restore();
    doc.moveDown(0.1);
  });

  if (vulns.length > 10) {
    doc.save()
      .fillColor(C.textMuted).fontSize(8.5).font("Helvetica-Italic")
      .text(`... and ${vulns.length - 10} more vulnerabilities detailed on following pages.`, MARGIN, doc.y)
      .restore();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 3+ — VULNERABILITY DETAILS
  // ════════════════════════════════════════════════════════════════════════════
  addPage("Vulnerability Details");

  doc.save()
    .fillColor(C.textPrimary).fontSize(18).font("Helvetica-Bold")
    .text("Vulnerability Details", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.4);

  doc.save()
    .fillColor(C.textMuted).fontSize(9).font("Helvetica")
    .text(`${vulns.length} ${vulns.length === 1 ? "issue" : "issues"} found — sorted by severity (Critical → Low)`, MARGIN, doc.y)
    .restore();
  doc.moveDown(0.8);

  if (vulns.length === 0) {
    doc.save()
      .fillColor(C.green).fontSize(13).font("Helvetica-Bold")
      .text("No vulnerabilities detected.", MARGIN, doc.y)
      .fillColor(C.textMuted).fontSize(9).font("Helvetica")
      .moveDown(0.4)
      .text("This contract passed all automated security checks. Manual review is still recommended before mainnet deployment.", MARGIN, doc.y, { width: CONTENT_W })
      .restore();
  }

  vulns.forEach((vuln, idx) => {
    const sevColor = C[vuln.severity as SevKey] ?? C.textMuted;

    // If not enough space, add a new page
    if (doc.y > PAGE_H - MARGIN - 200) {
      addPage("Vulnerability Details");
      doc.y = 55;
    }

    // ── Vuln card header ──────────────────────────────────────────────────────
    const cardTopY = doc.y;
    doc.save()
      .fillColor(sevColor).opacity(0.07)
      .roundedRect(MARGIN, cardTopY, CONTENT_W, 38, 6).fill()
      .opacity(1)
      .fillColor(sevColor)
      .roundedRect(MARGIN, cardTopY, 4, 38, 3).fill()
      .restore();

    // Number badge
    doc.save()
      .fillColor(sevColor).opacity(0.15)
      .circle(MARGIN + 22, cardTopY + 19, 14).fill()
      .opacity(1)
      .fillColor(sevColor)
      .fontSize(9).font("Helvetica-Bold")
      .text(String(idx + 1), MARGIN + 15, cardTopY + 14, { width: 14, align: "center" })
      .restore();

    // Title
    doc.save()
      .fillColor(C.textPrimary).fontSize(11).font("Helvetica-Bold")
      .text(vuln.title, MARGIN + 44, cardTopY + 6, { width: CONTENT_W - 120 })
      .restore();

    // Severity badge + type pill
    sevBadge(doc, PAGE_W - MARGIN - 54, cardTopY + 4, vuln.severity);

    doc.save()
      .fillColor(C.textMuted).fontSize(7.5).font("Helvetica")
      .text(vuln.type, MARGIN + 44, cardTopY + 24)
      .restore();

    // SWC + line
    const metaParts: string[] = [];
    if (vuln.swc_id) metaParts.push(`SWC: ${vuln.swc_id}`);
    if (vuln.affected_lines) metaParts.push(`Lines: ${vuln.affected_lines}`);
    else if (vuln.line_number) metaParts.push(`Line: ${vuln.line_number}`);
    if (vuln.affected_functions) metaParts.push(`Function(s): ${vuln.affected_functions}`);

    if (metaParts.length > 0) {
      doc.save()
        .fillColor(C.textMuted).fontSize(7).font("Helvetica")
        .text(metaParts.join("   ·   "), MARGIN + 44, cardTopY + 24, { width: CONTENT_W - 100, align: "right" })
        .restore();
    }

    doc.y = cardTopY + 44;

    // ── Card body ─────────────────────────────────────────────────────────────
    doc.save()
      .fillColor(C.cardBg)
      .rect(MARGIN, cardTopY + 38, CONTENT_W, 6).fill()
      .restore();

    doc.save()
      .strokeColor(C.borderLight).lineWidth(0.5)
      .roundedRect(MARGIN, cardTopY, CONTENT_W, 1000, 6)   // placeholder height; fills below
      .restore();

    const bodyX = MARGIN + 12;
    const bodyW = CONTENT_W - 24;

    // Description
    if (doc.y > PAGE_H - MARGIN - 80) { addPage("Vulnerability Details"); doc.y = 55; }
    doc.moveDown(0.4);
    sectionLabel(doc, "Description");
    doc.save()
      .fillColor(C.textPrimary).fontSize(9).font("Helvetica")
      .text(vuln.description, bodyX, doc.y, { width: bodyW, lineGap: 2 })
      .restore();
    doc.moveDown(0.6);

    // Impact
    if (vuln.impact) {
      if (doc.y > PAGE_H - MARGIN - 60) { addPage("Vulnerability Details"); doc.y = 55; }
      sectionLabel(doc, "Potential Impact");
      doc.save()
        .fillColor(sevColor).opacity(0.07)
        .roundedRect(bodyX, doc.y, bodyW, 1, 4).fill()  // will expand with text below
        .opacity(1).restore();

      const impStartY = doc.y;
      doc.save()
        .fillColor(sevColor).opacity(0.08)
        .rect(bodyX, impStartY, bodyW, 1).fill()
        .opacity(1).restore();

      doc.save()
        .fillColor(sevColor).fontSize(9).font("Helvetica")
        .text(vuln.impact, bodyX + 8, doc.y, { width: bodyW - 16, lineGap: 2 })
        .restore();
      doc.moveDown(0.6);
    }

    // Technical Risk
    if (doc.y > PAGE_H - MARGIN - 60) { addPage("Vulnerability Details"); doc.y = 55; }
    sectionLabel(doc, "Technical Risk");
    doc.save()
      .fillColor(C.textMuted).fontSize(9).font("Helvetica")
      .text(vuln.technical_risk, bodyX, doc.y, { width: bodyW, lineGap: 2 })
      .restore();
    doc.moveDown(0.6);

    // Attack Scenario
    if (vuln.attack_scenario) {
      if (doc.y > PAGE_H - MARGIN - 70) { addPage("Vulnerability Details"); doc.y = 55; }
      sectionLabel(doc, "Attack Scenario");
      const steps = vuln.attack_scenario.split(/\n|\d+\.\s+/).filter(Boolean);
      steps.forEach((step, si) => {
        if (doc.y > PAGE_H - MARGIN - 50) { addPage("Vulnerability Details"); doc.y = 55; }
        doc.save()
          .fillColor(C.CRITICAL).opacity(0.1)
          .circle(bodyX + 7, doc.y + 5, 7).fill()
          .opacity(1)
          .fillColor(C.CRITICAL)
          .fontSize(6.5).font("Helvetica-Bold")
          .text(String(si + 1), bodyX + 4, doc.y + 2)
          .fillColor(C.textPrimary).fontSize(9).font("Helvetica")
          .text(step.trim(), bodyX + 20, doc.y, { width: bodyW - 24, lineGap: 2 })
          .restore();
        doc.moveDown(0.4);
      });
      doc.moveDown(0.3);
    }

    // Gas Impact
    if (vuln.gas_impact) {
      if (doc.y > PAGE_H - MARGIN - 50) { addPage("Vulnerability Details"); doc.y = 55; }
      sectionLabel(doc, "Gas Cost Impact");
      doc.save()
        .fillColor("#92400e").fontSize(9).font("Helvetica")
        .text(vuln.gas_impact, bodyX, doc.y, { width: bodyW, lineGap: 2 })
        .restore();
      doc.moveDown(0.6);
    }

    // Recommendation
    if (doc.y > PAGE_H - MARGIN - 60) { addPage("Vulnerability Details"); doc.y = 55; }
    sectionLabel(doc, "Recommendation");
    doc.save()
      .fillColor(C.accentDark).fontSize(9).font("Helvetica-Bold")
      .text(vuln.recommendation, bodyX, doc.y, { width: bodyW, lineGap: 2 })
      .restore();
    doc.moveDown(0.6);

    // Vulnerable Code
    if (vuln.vulnerable_code) {
      sectionLabel(doc, "Vulnerable Code");
      codeBlock(doc, vuln.vulnerable_code, "⚠ VULNERABLE", "#fee2e2", "#fca5a5", "#991b1b");
    }

    // Fixed Code
    if (vuln.fixed_code) {
      sectionLabel(doc, "Suggested Fix");
      codeBlock(doc, vuln.fixed_code, "✓ FIXED", "#dcfce7", "#86efac", "#14532d");
    }

    // Divider
    doc.moveDown(0.5);
    hr(doc, undefined, "#cbd5e1");
    doc.moveDown(0.8);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FINAL PAGE — SECURITY RECOMMENDATIONS & REMEDIATION ROADMAP
  // ════════════════════════════════════════════════════════════════════════════
  addPage("Security Best Practices");

  doc.save()
    .fillColor(C.textPrimary).fontSize(18).font("Helvetica-Bold")
    .text("Security Best Practices & Remediation Roadmap", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  doc.save()
    .fillColor(C.textMuted).fontSize(9).font("Helvetica")
    .text("General best practices to apply before and after mainnet deployment:", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.8);

  const recommendations = [
    { 
      title: "Use Solidity 0.8.x+",   
      body: "Built-in arithmetic overflow/underflow protection. Avoid SafeMath on 0.8+. Stay current with compiler patches.",
      color: C.accent,
      priority: "CRITICAL"
    },
    { 
      title: "Checks-Effects-Interactions (CEI) Pattern",
      body: "Always read state, then write state, then call external contracts to prevent reentrancy attacks. Document this pattern in code comments.",
      color: C.CRITICAL,
      priority: "CRITICAL"
    },
    { 
      title: "Use OpenZeppelin Contracts", 
      body: "Leverage audited, battle-tested implementations for access control, tokens, proxy patterns, and governance. Never reinvent the wheel.",
      color: C.green,
      priority: "HIGH"
    },
    { 
      title: "No On-Chain Randomness", 
      body: "Never use block.timestamp or block.number for randomness. Miners can predict these values. Use Chainlink VRF or similar oracle instead.",
      color: C.HIGH,
      priority: "HIGH"
    },
    { 
      title: "Validate All Inputs",   
      body: "Add require() / revert() guards on every public/external function parameter and state transition. Validate array lengths, addresses, amounts.",
      color: C.MEDIUM,
      priority: "HIGH"
    },
    { 
      title: "Minimize Attack Surface", 
      body: "Mark functions internal/private unless they must be external. Remove unused code paths and dependencies. Use interface segregation.",
      color: C.accent,
      priority: "MEDIUM"
    },
    { 
      title: "Static Analysis Tools in CI/CD", 
      body: "Run Slither, Mythril, and Echidna in CI before every PR merge. Set up automated scanning. Fail builds on critical issues.",
      color: C.textMuted,
      priority: "HIGH"
    },
    { 
      title: "Professional Security Audit",
      body: "Commission a manual code review and audit from a reputable firm (Trail of Bits, Consensys, OpenZeppelin, etc.) before mainnet.",
      color: C.CRITICAL,
      priority: "CRITICAL"
    },
    { 
      title: "Bug Bounty Program",    
      body: "Launch an Immunefi or HackerOne campaign post-deployment for 6-12 months. Incentivize the research community to find issues.",
      color: C.green,
      priority: "HIGH"
    },
    {
      title: "Comprehensive Testing",
      body: "Achieve >90% code coverage with unit tests. Add integration tests, fuzzing (Echidna), and formal verification where applicable.",
      color: C.accent,
      priority: "HIGH"
    },
    {
      title: "Upgrade & Pause Mechanisms",
      body: "Implement proxy patterns for upgradeable contracts. Add pause functionality for emergencies. Use time-locks for governance actions.",
      color: C.MEDIUM,
      priority: "MEDIUM"
    },
    {
      title: "Monitoring & Incident Response",
      body: "Set up on-chain event monitoring and alerting. Have an incident response plan ready. Document all actions in immutable logs.",
      color: C.HIGH,
      priority: "HIGH"
    }
  ];

  recommendations.forEach((rec) => {
    if (doc.y > PAGE_H - MARGIN - 65) { addPage("Security Best Practices"); doc.y = 55; }
    const ry = doc.y;
    doc.save()
      .fillColor(rec.color)
      .roundedRect(MARGIN, ry, 4, 44, 2).fill()
      .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
      .text(rec.title, MARGIN + 14, ry)
      .fillColor(C.textMuted).fontSize(8).font("Helvetica")
      .text(rec.body, MARGIN + 14, ry + 13, { width: CONTENT_W - 50, lineGap: 1.5 })
      .restore();
    
    // Priority badge
    const badgeBg = rec.priority === "CRITICAL" ? C.CRITICAL : rec.priority === "HIGH" ? C.HIGH : C.MEDIUM;
    doc.save()
      .fillColor(badgeBg).opacity(0.15)
      .roundedRect(PAGE_W - MARGIN - 55, ry + 2, 50, 12, 2).fill()
      .opacity(1)
      .fillColor(badgeBg)
      .fontSize(7.5).font("Helvetica-Bold")
      .text(rec.priority, PAGE_W - MARGIN - 55, ry + 2, { width: 50, align: "center" })
      .restore();

    doc.moveDown(2.2);
  });

  // Remediation Timeline
  if (doc.y > PAGE_H - MARGIN - 120) { addPage("Security Best Practices"); doc.y = 55; }
  doc.moveDown(0.5);
  hr(doc);

  doc.save()
    .fillColor(C.textPrimary).fontSize(11).font("Helvetica-Bold")
    .text("Recommended Remediation Timeline", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.6);

  const timeline = [
    { phase: "Phase 1: Immediate (0-1 weeks)", items: ["Fix all CRITICAL issues", "Patch HIGH severity vulnerabilities", "Enable static analysis in CI/CD"] },
    { phase: "Phase 2: Short-term (1-4 weeks)", items: ["Commission professional audit", "Implement monitoring and alerting", "Set up bug bounty program"] },
    { phase: "Phase 3: Pre-launch (4-8 weeks)", items: ["Complete audit remediation", "Achieve >90% test coverage", "Conduct security training for team"] },
    { phase: "Phase 4: Ongoing", items: ["Monitor contract activity", "Respond to security reports", "Plan upgrade paths and patches"] },
  ];

  timeline.forEach((t) => {
    if (doc.y > PAGE_H - MARGIN - 60) { addPage("Security Best Practices"); doc.y = 55; }
    
    doc.save()
      .fillColor(C.accent).fontSize(9).font("Helvetica-Bold")
      .text(t.phase, MARGIN, doc.y)
      .restore();
    doc.moveDown(0.5);

    t.items.forEach((item) => {
      if (doc.y > PAGE_H - MARGIN - 40) { addPage("Security Best Practices"); doc.y = 55; }
      
      doc.save()
        .fillColor(C.textMuted).fontSize(8).font("Helvetica")
        .text(`→ ${item}`, MARGIN + 12, doc.y)
        .restore();
      doc.moveDown(0.35);
    });

    doc.moveDown(0.3);
  });

  // References
  if (doc.y > PAGE_H - MARGIN - 200) { addPage("References & Resources"); doc.y = 55; }
  doc.moveDown(1);
  hr(doc);
  doc.save()
    .fillColor(C.textPrimary).fontSize(14).font("Helvetica-Bold")
    .text("References & Resources", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.8);

  // Reference categories
  const refCategories = [
    {
      title: "Smart Contract Standards & Classification",
      refs: [
        { label: "SWC Registry (Smart Contract Weakness Classification)", url: "https://swcregistry.io/" },
        { label: "Solidity Security Considerations", url: "https://docs.soliditylang.org/en/latest/security-considerations.html" },
        { label: "Ethereum Yellow Paper & RLP", url: "https://ethereum.org/en/developers/docs/" },
      ]
    },
    {
      title: "Security Frameworks & Best Practices",
      refs: [
        { label: "OpenZeppelin Contracts - Audited Code Library", url: "https://docs.openzeppelin.com/contracts/" },
        { label: "Secureum Security Pitfalls & Best Practices", url: "https://secureum.substack.com/" },
        { label: "Web3 Security Best Practices", url: "https://www.web3security.dev/" },
      ]
    },
    {
      title: "Static Analysis & Verification Tools",
      refs: [
        { label: "Slither - Static Analysis Framework", url: "https://github.com/crytic/slither" },
        { label: "Mythril - Security Analysis Tool", url: "https://github.com/ConsenSys/mythril" },
        { label: "Echidna - Fuzzing for Solidity", url: "https://github.com/crytic/echidna" },
        { label: "Manticore - Symbolic Execution", url: "https://github.com/trailofbits/manticore" },
      ]
    },
    {
      title: "Randomness & Oracles",
      refs: [
        { label: "Chainlink VRF (Verifiable Randomness)", url: "https://docs.chain.link/vrf" },
        { label: "Chainlink Price Feeds", url: "https://docs.chain.link/data-feeds" },
      ]
    },
    {
      title: "Auditing & Bug Bounty Programs",
      refs: [
        { label: "Immunefi - Bug Bounty Platform", url: "https://immunefi.com/" },
        { label: "HackerOne - Security Research", url: "https://www.hackerone.com/" },
        { label: "Trail of Bits - Security Consulting", url: "https://www.trailofbits.com/" },
        { label: "Consensys Diligence - Audit Services", url: "https://consensys.io/diligence/" },
      ]
    },
    {
      title: "Development & Testing",
      refs: [
        { label: "Foundry - Smart Contract Development", url: "https://getfoundry.sh/" },
        { label: "Hardhat - Ethereum Development", url: "https://hardhat.org/" },
        { label: "Truffle Suite - Development Framework", url: "https://www.trufflesuite.com/" },
      ]
    }
  ];

  refCategories.forEach((category) => {
    if (doc.y > PAGE_H - MARGIN - 80) { addPage("References & Resources"); doc.y = 55; }
    
    doc.save()
      .fillColor(C.textPrimary).fontSize(10).font("Helvetica-Bold")
      .text(category.title, MARGIN, doc.y)
      .restore();
    doc.moveDown(0.5);

    category.refs.forEach((r) => {
      if (doc.y > PAGE_H - MARGIN - 40) { addPage("References & Resources"); doc.y = 55; }
      
      doc.save()
        .fillColor(C.accent).fontSize(8.5).font("Helvetica")
        .text(`• ${r.label}`, MARGIN + 12, doc.y, { continued: true })
        .fillColor(C.textMuted)
        .fontSize(7.5)
        .text(`  —  ${r.url}`, { lineGap: 1 })
        .restore();
      doc.moveDown(0.4);
    });

    doc.moveDown(0.3);
  });

  // Disclaimer
  if (doc.y > PAGE_H - MARGIN - 80) { addPage("References & Resources"); doc.y = 55; }
  doc.moveDown(0.5);
  hr(doc);
  doc.save()
    .fillColor(C.CRITICAL).opacity(0.1)
    .roundedRect(MARGIN, doc.y, CONTENT_W, 80, 6).fill()
    .opacity(1).restore();

  doc.save()
    .fillColor(C.CRITICAL).fontSize(9).font("Helvetica-Bold")
    .text("IMPORTANT DISCLAIMER", MARGIN + 12, doc.y + 6)
    .fillColor(C.textPrimary).fontSize(8.5).font("Helvetica")
    .text("This automated security audit report is provided for informational purposes only. While VulnGuard AI utilizes advanced analysis techniques, it is not a substitute for professional manual security audits. The findings in this report represent potential vulnerabilities that may or may not pose actual risks depending on your specific use case, deployment environment, and contract functionality. Always commission a professional security audit from a reputable firm before deploying smart contracts to mainnet, especially for contracts handling significant value or critical functions.", MARGIN + 12, doc.y + 18, { width: CONTENT_W - 24, lineGap: 2 })
    .restore();

  doc.end();
  } catch (err) {
    req.log.error({ err }, "Error generating PDF report");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF report" });
    }
  }
});

export default router;
