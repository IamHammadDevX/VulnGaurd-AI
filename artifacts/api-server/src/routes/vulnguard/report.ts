import { Router, type IRouter } from "express";
import PDFDocument from "pdfkit";
import { GetReportParams } from "@workspace/api-zod";
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
router.get("/report/:scanId", (req, res) => {
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
  const totalEstPages = 3 + Math.ceil(vulns.length / 2);

  const doc = new PDFDocument({ margin: 0, size: "A4", autoFirstPage: false });
  const filename = `${scan.contract_name.replace(/[^a-zA-Z0-9]/g, "_")}-audit-report.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
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
    .rect(0, 0, PAGE_W, 200)
    .fill()
    .restore();

  // Logo area
  doc.save()
    .fillColor(C.accent)
    .circle(MARGIN + 20, 58, 18).fill()
    .fillColor(C.white)
    .fontSize(16).font("Helvetica-Bold")
    .text("V", MARGIN + 13, 49)
    .restore();

  doc.save()
    .fillColor(C.white)
    .fontSize(26).font("Helvetica-Bold")
    .text("VulnGuard AI", MARGIN + 48, 44)
    .fillColor(C.textLight)
    .fontSize(10).font("Helvetica")
    .text("AI-Powered Smart Contract Security Audit Report", MARGIN + 48, 76)
    .restore();

  // Horizontal rule inside header
  doc.save()
    .strokeColor(C.accent).opacity(0.3).lineWidth(0.5)
    .moveTo(MARGIN, 104).lineTo(PAGE_W - MARGIN, 104).stroke()
    .opacity(1).restore();

  // Generated date
  doc.save()
    .fillColor(C.textLight)
    .fontSize(8).font("Helvetica")
    .text(`Generated: ${scanDate}`, MARGIN, 112)
    .restore();

  doc.y = 218;

  // Contract card
  doc.save()
    .fillColor(C.cardBg)
    .roundedRect(MARGIN, 218, CONTENT_W, 100, 8).fill()
    .strokeColor(C.borderLight).lineWidth(0.5)
    .roundedRect(MARGIN, 218, CONTENT_W, 100, 8).stroke()
    .restore();

  // Left accent strip
  doc.save()
    .fillColor(riskColor)
    .roundedRect(MARGIN, 218, 4, 100, 2).fill()
    .restore();

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(18).font("Helvetica-Bold")
    .text(scan.contract_name, MARGIN + 18, 232, { width: CONTENT_W - 120 })
    .fillColor(C.textMuted)
    .fontSize(8).font("Helvetica")
    .text("CONTRACT NAME", MARGIN + 18, 257, { characterSpacing: 0.5 })
    .restore();

  // Risk score circle (right side)
  const rscX = PAGE_W - MARGIN - 55, rscY = 248;
  doc.save()
    .fillColor(riskColor).opacity(0.12)
    .circle(rscX, rscY, 34).fill()
    .opacity(1)
    .fillColor(riskColor)
    .fontSize(20).font("Helvetica-Bold")
    .text(String(scan.risk_score), rscX - 22, rscY - 14, { width: 44, align: "center" })
    .fillColor(C.textMuted)
    .fontSize(7).font("Helvetica")
    .text("/ 100", rscX - 22, rscY + 8, { width: 44, align: "center" })
    .text("RISK SCORE", rscX - 22, rscY + 20, { width: 44, align: "center", characterSpacing: 0.3 })
    .restore();

  // Scan details row inside card
  doc.save()
    .fillColor(C.textMuted)
    .fontSize(8).font("Helvetica")
    .text(`Scan ID: ${scanId}`, MARGIN + 18, 268)
    .text(`SHA-256: ${scan.code_hash.substring(0, 32)}...`, MARGIN + 18, 280)
    .text(`Analysis Time: ${(scan.analysis_time_ms / 1000).toFixed(1)}s`, MARGIN + 18, 292)
    .restore();

  doc.y = 334;

  // ── Severity summary boxes ────────────────────────────────────────────────
  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(12).font("Helvetica-Bold")
    .text("Findings Overview", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.5);

  const boxW = (CONTENT_W - 18) / 4;
  const boxY = doc.y;

  SEVERITY_ORDER.forEach((sev, i) => {
    const bx = MARGIN + i * (boxW + 6);
    const color = C[sev];
    doc.save()
      .fillColor(color).opacity(0.08)
      .roundedRect(bx, boxY, boxW, 62, 6).fill()
      .opacity(1)
      .strokeColor(color).opacity(0.25).lineWidth(0.5)
      .roundedRect(bx, boxY, boxW, 62, 6).stroke()
      .opacity(1)
      .fillColor(color)
      .roundedRect(bx, boxY, boxW, 3, 3).fill()
      .fillColor(color)
      .fontSize(26).font("Helvetica-Bold")
      .text(String(counts[sev]), bx, boxY + 10, { width: boxW, align: "center" })
      .fillColor(C.textMuted)
      .fontSize(7.5).font("Helvetica-Bold")
      .text(sev, bx, boxY + 43, { width: boxW, align: "center", characterSpacing: 0.4 })
      .restore();
  });

  doc.y = boxY + 78;

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
    .text("CONTRACT SHA-256 HASH", MARGIN, doc.y, { characterSpacing: 0.5 })
    .restore();
  doc.moveDown(0.2);
  doc.save()
    .fillColor(C.textPrimary).fontSize(8).font("Courier")
    .text(scan.code_hash, MARGIN, doc.y)
    .restore();

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — EXECUTIVE SUMMARY WITH PIE CHART
  // ════════════════════════════════════════════════════════════════════════════
  addPage("Executive Summary");

  doc.save()
    .fillColor(C.textPrimary)
    .fontSize(18).font("Helvetica-Bold")
    .text("Executive Summary", MARGIN, doc.y)
    .restore();
  doc.moveDown(1);

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
    .text(`Audit Time:    ${(scan.analysis_time_ms / 1000).toFixed(1)}s`, legendX, legendY + 26)
    .restore();

  doc.y = chartCY + chartR + 20;
  doc.moveDown(0.5);
  hr(doc);

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

  vulns.forEach((v, i) => {
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
  // FINAL PAGE — SECURITY RECOMMENDATIONS
  // ════════════════════════════════════════════════════════════════════════════
  addPage("Security Recommendations");

  doc.save()
    .fillColor(C.textPrimary).fontSize(18).font("Helvetica-Bold")
    .text("Security Recommendations", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.5);

  doc.save()
    .fillColor(C.textMuted).fontSize(9).font("Helvetica")
    .text("General best practices to apply before mainnet deployment:", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.8);

  const recommendations = [
    { title: "Use Solidity 0.8.x+",   body: "Built-in arithmetic overflow/underflow protection. Avoid SafeMath on 0.8+.", color: C.accent },
    { title: "Checks-Effects-Interactions", body: "Always read state, then write state, then call external contracts to prevent reentrancy.", color: C.CRITICAL },
    { title: "OpenZeppelin Contracts", body: "Use audited, battle-tested implementations for access control, tokens, and proxy patterns.", color: C.green },
    { title: "No On-Chain Randomness", body: "Never use block.timestamp or block.number as randomness. Use Chainlink VRF instead.", color: C.HIGH },
    { title: "Validate All Inputs",   body: "Add require() / revert() guards on every public/external function parameter and state transition.", color: C.MEDIUM },
    { title: "Minimize Attack Surface", body: "Mark functions internal/private unless they must be external. Remove unused code paths.", color: C.accent },
    { title: "Static Analysis Tools", body: "Run Slither, Mythril, and Echidna in CI before every deploy. Add them to your PR pipeline.", color: C.textMuted },
    { title: "Professional Audit",    body: "Commission a manual audit from a reputable firm before deploying high-value contracts.", color: C.CRITICAL },
    { title: "Bug Bounty Program",    body: "Launch an Immunefi or HackerOne campaign post-deployment to surface undiscovered issues.", color: C.green },
  ];

  recommendations.forEach((rec) => {
    if (doc.y > PAGE_H - MARGIN - 55) { addPage("Security Recommendations"); doc.y = 55; }
    const ry = doc.y;
    doc.save()
      .fillColor(rec.color)
      .roundedRect(MARGIN, ry, 3, 36, 2).fill()
      .fillColor(C.textPrimary).fontSize(9).font("Helvetica-Bold")
      .text(rec.title, MARGIN + 14, ry)
      .fillColor(C.textMuted).fontSize(8.5).font("Helvetica")
      .text(rec.body, MARGIN + 14, ry + 13, { width: CONTENT_W - 20, lineGap: 2 })
      .restore();
    doc.moveDown(2.0);
  });

  // References
  if (doc.y > PAGE_H - MARGIN - 120) { addPage("Security Recommendations"); doc.y = 55; }
  doc.moveDown(0.5);
  hr(doc);
  doc.save()
    .fillColor(C.textPrimary).fontSize(10).font("Helvetica-Bold")
    .text("References & Resources", MARGIN, doc.y)
    .restore();
  doc.moveDown(0.5);

  const refs = [
    { label: "OpenZeppelin Contracts", url: "https://docs.openzeppelin.com/contracts/5.x/" },
    { label: "SWC Registry (Smart Contract Weakness Classification)", url: "https://swcregistry.io/" },
    { label: "Secureum Security Pitfalls", url: "https://secureum.substack.com/" },
    { label: "Slither Static Analyzer", url: "https://github.com/crytic/slither" },
    { label: "Mythril Security Analysis", url: "https://github.com/ConsenSys/mythril" },
    { label: "Chainlink VRF (Verifiable Randomness)", url: "https://docs.chain.link/vrf" },
    { label: "Solidity Security Considerations", url: "https://docs.soliditylang.org/en/v0.8.25/security-considerations.html" },
  ];

  refs.forEach((r) => {
    doc.save()
      .fillColor(C.accent).fontSize(8.5).font("Helvetica")
      .text(`• ${r.label}`, MARGIN, doc.y, { continued: true })
      .fillColor(C.textMuted)
      .text(`  —  ${r.url}`, { lineGap: 1 })
      .restore();
    doc.moveDown(0.35);
  });

  doc.end();
});

export default router;
