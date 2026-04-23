/**
 * Professional Visual Enhancements for Enterprise-Grade Audit Reports
 * 
 * This module provides:
 * - Advanced dashboard visualizations
 * - Professional color schemes and typography
 * - Enhanced charts and graphs (risk gauges, severity distribution, trends)
 * - Beautiful table formatting with alternating rows
 * - Professional spacing and alignment
 * - SVG-based visual elements
 * - Code block highlighting with syntax-aware coloring
 */

import PDFKit from "pdfkit";

// ═══════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL COLOR PALETTE (Navy + Orange + Accent)
// ═══════════════════════════════════════════════════════════════════════════════

export const PROFESSIONAL_PALETTE = {
  // Primary Colors
  primary:        "#0B3D6E",    // Deep Navy Blue
  primaryLight:   "#1E5BA8",    // Lighter Navy
  primaryDark:    "#052D4F",    // Darker Navy
  
  // Accent Colors
  accent:         "#FF6B35",    // Energetic Orange
  accentLight:    "#FF8A5B",    // Light Orange
  accentDark:     "#E55A2B",    // Dark Orange
  
  // Semantic Colors
  critical:       "#D32F2F",    // Red
  high:           "#F97316",    // Orange-Red
  medium:         "#EAB308",    // Amber
  low:            "#22C55E",    // Green
  success:        "#10B981",    // Emerald
  warning:        "#F59E0B",    // Amber
  info:           "#3B82F6",    // Blue
  
  // Neutral Colors
  white:          "#FFFFFF",
  light:          "#F8FAFC",
  lightGray:      "#F3F4F6",
  silver:         "#E5E7EB",
  gray:           "#D1D5DB",
  darkGray:       "#6B7280",
  textPrimary:    "#111827",
  textSecondary:  "#374151",
  textMuted:      "#6B7280",
  textLight:      "#9CA3AF",
  
  // Background
  bgWhite:        "#FFFFFF",
  bgGray:         "#F9FAFB",
  bgDark:         "#0F172A",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCED VISUAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface ChartColors {
  CRITICAL: string;
  HIGH: string;
  MEDIUM: string;
  LOW: string;
}

export class ProfessionalReportDesigner {
  private palette = PROFESSIONAL_PALETTE;
  private pageWidth = 595.28;   // A4 width
  private pageHeight = 841.89;  // A4 height
  private margin = 50;
  private contentWidth = 495.28;

  /**
   * Draw an advanced professional risk gauge (0-100 scale)
   * Shows visual severity indicator with color gradient
   */
  drawRiskGauge(
    doc: PDFKit.PDFDocument,
    riskScore: number,
    x: number,
    y: number,
    width: number = 200,
    height: number = 120
  ) {
    const radius = width / 2.2;
    const centerX = x + width / 2;
    const centerY = y + height / 2 + 10;

    // Gauge background - arc from -180° to 0°
    doc.save();
    doc.fillColor(this.palette.silver).opacity(0.3);
    
    // Draw base arc background
    const startAngle = Math.PI;      // 180° (left)
    const endAngle = 0;              // 0° (right)
    
    // Background arc segments (LOW-MEDIUM-HIGH-CRITICAL)
    const segmentAngles = [
      { start: Math.PI, end: Math.PI * 0.75, color: this.palette.low, label: "LOW" },
      { start: Math.PI * 0.75, end: Math.PI * 0.5, color: this.palette.medium, label: "MEDIUM" },
      { start: Math.PI * 0.5, end: Math.PI * 0.25, color: this.palette.high, label: "HIGH" },
      { start: Math.PI * 0.25, end: 0, color: this.palette.critical, label: "CRITICAL" },
    ];

    // Draw colored arc segments
    segmentAngles.forEach(({ start, end, color }) => {
      doc.save();
      doc.fillColor(color).opacity(0.15);
      
      // Use fillAndStroke to create arc effect
      const x1 = centerX + radius * Math.cos(start);
      const y1 = centerY + radius * Math.sin(start);
      const x2 = centerX + radius * Math.cos(end);
      const y2 = centerY + radius * Math.sin(end);
      
      const largeArc = Math.abs(end - start) > Math.PI ? 1 : 0;
      const pathStr = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${centerX} ${centerY} Z`;
      
      doc.path(pathStr).fill();
      doc.restore();
    });

    // Calculate needle angle based on risk score (0-100 → 180° to 0°)
    const needleAngle = Math.PI - (riskScore / 100) * Math.PI;
    const needleX = centerX + radius * Math.cos(needleAngle);
    const needleY = centerY + radius * Math.sin(needleAngle);

    // Draw needle
    doc.save();
    const needleColor = this.getSeverityColor(riskScore);
    doc.strokeColor(needleColor).lineWidth(3);
    doc.moveTo(centerX, centerY).lineTo(needleX, needleY).stroke();
    
    // Needle hub (circle)
    doc.fillColor(needleColor);
    doc.circle(centerX, centerY, 6).fill();
    doc.restore();

    // Draw score text
    doc.save();
    doc.fillColor(needleColor).fontSize(24).font("Helvetica-Bold");
    doc.text(String(riskScore), centerX - 20, centerY - 40, { width: 40, align: "center" });
    doc.fillColor(this.palette.textMuted).fontSize(10);
    doc.text("/ 100", centerX - 20, centerY - 8, { width: 40, align: "center" });
    doc.restore();

    // Add risk level label
    doc.save();
    const riskLevel = this.getRiskLevel(riskScore);
    doc.fillColor(needleColor).fontSize(11).font("Helvetica-Bold");
    doc.text(riskLevel, centerX - 35, centerY + 25, { width: 70, align: "center" });
    doc.restore();

    // Add scale labels
    doc.save();
    doc.fillColor(this.palette.textMuted).fontSize(8);
    doc.text("LOW", x + 5, y + height - 15);
    doc.text("CRITICAL", x + width - 30, y + height - 15);
    doc.restore();
  }

  /**
   * Draw professional severity distribution chart (donut style)
   */
  drawSeverityDistribution(
    doc: PDFKit.PDFDocument,
    counts: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number },
    x: number,
    y: number,
    radius: number = 60
  ) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      this.drawCleanStatus(doc, x, y, radius);
      return;
    }

    const centerX = x + radius;
    const centerY = y + radius;
    const donutRadius = radius;
    const donutHole = radius * 0.45;

    const colors: ChartColors = {
      CRITICAL: this.palette.critical,
      HIGH: this.palette.high,
      MEDIUM: this.palette.medium,
      LOW: this.palette.low,
    };

    let startAngle = -Math.PI / 2;
    const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

    // Draw donut segments
    severities.forEach((sev) => {
      const count = counts[sev] || 0;
      if (count === 0) return;

      const sweep = (count / total) * 2 * Math.PI;
      const endAngle = startAngle + sweep;
      const largeArc = sweep > Math.PI ? 1 : 0;

      // Outer arc
      const x1 = centerX + donutRadius * Math.cos(startAngle);
      const y1 = centerY + donutRadius * Math.sin(startAngle);
      const x2 = centerX + donutRadius * Math.cos(endAngle);
      const y2 = centerY + donutRadius * Math.sin(endAngle);

      // Inner arc (reverse)
      const x3 = centerX + donutHole * Math.cos(endAngle);
      const y3 = centerY + donutHole * Math.sin(endAngle);
      const x4 = centerX + donutHole * Math.cos(startAngle);
      const y4 = centerY + donutHole * Math.sin(startAngle);

      const pathStr = 
        `M ${x1} ${y1} A ${donutRadius} ${donutRadius} 0 ${largeArc} 1 ${x2} ${y2} ` +
        `L ${x3} ${y3} A ${donutHole} ${donutHole} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      doc.save();
      doc.fillColor(colors[sev]).opacity(0.9);
      doc.path(pathStr).fill();

      // Add subtle border
      doc.strokeColor(this.palette.white).lineWidth(1).path(pathStr).stroke();
      doc.restore();

      startAngle = endAngle;
    });

    // Draw center label
    doc.save();
    doc.fillColor(this.palette.textPrimary).fontSize(18).font("Helvetica-Bold");
    doc.text(String(total), centerX - 20, centerY - 12, { width: 40, align: "center" });
    doc.fillColor(this.palette.textMuted).fontSize(8);
    doc.text("issues", centerX - 20, centerY + 8, { width: 40, align: "center" });
    doc.restore();
  }

  /**
   * Draw legend for severity distribution
   */
  drawSeverityLegend(
    doc: PDFKit.PDFDocument,
    counts: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number },
    x: number,
    y: number,
    columnWidth: number = 100
  ) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
    const colors: ChartColors = {
      CRITICAL: this.palette.critical,
      HIGH: this.palette.high,
      MEDIUM: this.palette.medium,
      LOW: this.palette.low,
    };

    let currentY = y;

    severities.forEach((sev) => {
      const count = counts[sev] || 0;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;

      // Color dot
      doc.save();
      doc.fillColor(colors[sev]);
      doc.circle(x + 8, currentY + 7, 4).fill();
      doc.restore();

      // Progress bar
      const barWidth = columnWidth - 60;
      const filledWidth = Math.max(0, Math.round((pct / 100) * barWidth));

      doc.save();
      doc.fillColor(this.palette.silver);
      doc.roundedRect(x + 18, currentY + 2, barWidth, 10, 3).fill();
      doc.fillColor(colors[sev]).opacity(0.8);
      doc.roundedRect(x + 18, currentY + 2, filledWidth, 10, 3).fill();
      doc.restore();

      // Labels
      doc.save();
      doc.fillColor(this.palette.textPrimary).fontSize(9).font("Helvetica-Bold");
      doc.text(sev, x + 100, currentY + 2);
      doc.fillColor(this.palette.textMuted).fontSize(8);
      doc.text(`${count} (${pct}%)`, x + 175, currentY + 2);
      doc.restore();

      currentY += 18;
    });
  }

  /**
   * Draw professional risk matrix (2x2 or detailed)
   */
  drawRiskMatrix(
    doc: PDFKit.PDFDocument,
    findings: Array<{ impact: string; likelihood: string; severity: string; recommendation: string }>,
    x: number,
    y: number,
    width: number
  ) {
    const startY = y;
    const colWidth = (width - 30) / 4;
    const rowHeight = 24;

    // Header row
    doc.save();
    doc.fillColor(this.palette.primary).opacity(0.9);
    doc.rect(x, startY, width, rowHeight).fill();

    const headerCols = ["IMPACT", "LIKELIHOOD", "SEVERITY", "RECOMMENDED ACTION"];
    doc.fillColor(this.palette.white).fontSize(9).font("Helvetica-Bold");
    
    headerCols.forEach((col, i) => {
      doc.text(col, x + 8 + i * colWidth, startY + 8, {
        width: colWidth - 16,
        align: "left",
      });
    });
    doc.restore();

    // Data rows
    let currentY = startY + rowHeight;

    findings.forEach((row, idx) => {
      const rowColor = idx % 2 === 0 ? this.palette.light : this.palette.white;
      const severityColor = this.getSeverityColorByName(row.severity);

      // Row background
      doc.save();
      doc.fillColor(rowColor);
      doc.rect(x, currentY, width, rowHeight).fill();

      // Alternating subtle border
      doc.strokeColor(this.palette.silver).lineWidth(0.5);
      doc.rect(x, currentY, width, rowHeight).stroke();
      doc.restore();

      // Cell content
      doc.save();
      doc.fillColor(this.palette.textPrimary).fontSize(8).font("Helvetica");
      doc.text(row.impact, x + 8, currentY + 8, { width: colWidth - 16 });
      doc.text(row.likelihood, x + 8 + colWidth, currentY + 8, { width: colWidth - 16 });

      // Severity badge in cell
      doc.fillColor(severityColor).font("Helvetica-Bold");
      doc.text(row.severity, x + 8 + colWidth * 2, currentY + 8, { width: colWidth - 16 });

      // Recommendation
      doc.fillColor(this.palette.textMuted).font("Helvetica").fontSize(7.5);
      doc.text(row.recommendation, x + 8 + colWidth * 3, currentY + 3, {
        width: colWidth - 16,
        height: rowHeight - 6,
        ellipsis: true,
      });
      doc.restore();

      currentY += rowHeight;
    });
  }

  /**
   * Draw professional findings table with better formatting
   */
  drawFindingsTable(
    doc: PDFKit.PDFDocument,
    findings: Array<{
      id: number;
      title: string;
      type: string;
      severity: string;
      cvss?: number;
      lines?: string;
    }>,
    x: number,
    y: number,
    width: number
  ) {
    const startY = y;
    const colWidths = {
      id: 25,
      title: 180,
      type: 90,
      severity: 70,
      cvss: 40,
    };
    const rowHeight = 20;

    // Header
    doc.save();
    doc.fillColor(this.palette.primary).opacity(0.9);
    doc.rect(x, startY, width, rowHeight).fill();

    doc.fillColor(this.palette.white).fontSize(8.5).font("Helvetica-Bold");
    doc.text("#", x + 6, startY + 6, { width: colWidths.id - 12 });
    doc.text("FINDING", x + colWidths.id + 6, startY + 6, { width: colWidths.title - 12 });
    doc.text("TYPE", x + colWidths.id + colWidths.title + 6, startY + 6, { width: colWidths.type - 12 });
    doc.text("SEVERITY", x + colWidths.id + colWidths.title + colWidths.type + 6, startY + 6, { width: colWidths.severity - 12 });
    doc.text("CVSS", x + width - colWidths.cvss - 6, startY + 6, { width: colWidths.cvss - 12, align: "right" });
    doc.restore();

    // Data rows
    let currentY = startY + rowHeight;

    findings.forEach((row, idx) => {
      const rowBg = idx % 2 === 0 ? this.palette.light : this.palette.white;
      const sevColor = this.getSeverityColorByName(row.severity);

      // Background
      doc.save();
      doc.fillColor(rowBg);
      doc.rect(x, currentY, width, rowHeight).fill();

      // Border
      doc.strokeColor(this.palette.silver).lineWidth(0.5);
      doc.rect(x, currentY, width, rowHeight).stroke();
      doc.restore();

      // Content
      doc.save();
      doc.fillColor(this.palette.textPrimary).fontSize(8).font("Helvetica");

      // ID
      doc.text(String(row.id), x + 6, currentY + 6, { width: colWidths.id - 12, align: "center" });

      // Title
      doc.text(row.title, x + colWidths.id + 6, currentY + 6, {
        width: colWidths.title - 12,
        ellipsis: true,
      });

      // Type
      doc.fillColor(this.palette.textMuted).fontSize(7.5);
      doc.text(row.type, x + colWidths.id + colWidths.title + 6, currentY + 6, {
        width: colWidths.type - 12,
        ellipsis: true,
      });

      // Severity badge
      doc.save();
      doc.fillColor(sevColor).opacity(0.15);
      const badgeX = x + colWidths.id + colWidths.title + colWidths.type + 6;
      doc.roundedRect(badgeX, currentY + 4, colWidths.severity - 12, 12, 2).fill();
      doc.fillColor(sevColor).font("Helvetica-Bold").fontSize(7.5);
      doc.text(row.severity, badgeX, currentY + 4, {
        width: colWidths.severity - 12,
        align: "center",
      });
      doc.restore();

      // CVSS Score
      if (row.cvss) {
        doc.save();
        doc.fillColor(this.palette.textMuted).fontSize(7.5).font("Courier");
        doc.text(row.cvss.toFixed(1), x + width - colWidths.cvss - 6, currentY + 6, {
          width: colWidths.cvss - 12,
          align: "right",
        });
        doc.restore();
      }

      doc.restore();
      currentY += rowHeight;
    });
  }

  /**
   * Draw professional code block with syntax highlighting
   */
  drawCodeBlock(
    doc: PDFKit.PDFDocument,
    code: string,
    label: string,
    type: "vulnerable" | "fixed" | "recommended",
    x: number,
    y: number,
    width: number,
    maxHeight: number = 200
  ) {
    const colors = {
      vulnerable: { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B", label: "⚠ VULNERABLE CODE" },
      fixed: { bg: "#DCFCE7", border: "#86EFAC", text: "#14532D", label: "✓ FIXED CODE" },
      recommended: { bg: "#DBEAFE", border: "#7DD3FC", text: "#0C4A6E", label: "💡 RECOMMENDED FIX" },
    };

    const style = colors[type];
    const lineCount = code.split("\n").length;
    const estimatedHeight = Math.min(lineCount * 9 + 20, maxHeight);

    // Label bar
    doc.save();
    doc.fillColor(style.bg).opacity(0.7);
    doc.roundedRect(x, y, width, 18, 3).fill();
    doc.fillColor(style.text).fontSize(8).font("Helvetica-Bold");
    doc.text(style.label, x + 8, y + 4);
    doc.restore();

    // Code background
    doc.save();
    doc.fillColor(style.bg).opacity(0.3);
    doc.roundedRect(x, y + 18, width, estimatedHeight, 3).fill();

    // Border
    doc.strokeColor(style.border).lineWidth(1);
    doc.roundedRect(x, y, width, estimatedHeight + 18, 3).stroke();
    doc.restore();

    // Code text
    doc.save();
    doc.fillColor(style.text).fontSize(7).font("Courier");

    const displayCode = code.length > 600 
      ? code.substring(0, 600) + "\n... (truncated)"
      : code;

    doc.text(displayCode, x + 8, y + 22, {
      width: width - 16,
      height: estimatedHeight - 8,
      lineGap: 1,
    });
    doc.restore();
  }

  /**
   * Draw professional summary cards (metrics)
   */
  drawMetricCard(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    subtext: string,
    x: number,
    y: number,
    width: number = 110,
    height: number = 70,
    color: string = this.palette.primary
  ) {
    // Background
    doc.save();
    doc.fillColor(color).opacity(0.08);
    doc.roundedRect(x, y, width, height, 4).fill();

    // Border
    doc.strokeColor(color).lineWidth(1).opacity(0.3);
    doc.roundedRect(x, y, width, height, 4).stroke();
    doc.restore();

    // Top accent bar
    doc.save();
    doc.fillColor(color);
    doc.roundedRect(x, y, width, 3, 2).fill();
    doc.restore();

    // Label
    doc.save();
    doc.fillColor(this.palette.textMuted).fontSize(8).font("Helvetica-Bold");
    doc.text(label, x + 6, y + 8, { width: width - 12 });
    doc.restore();

    // Value
    doc.save();
    doc.fillColor(color).fontSize(18).font("Helvetica-Bold");
    doc.text(value, x + 6, y + 20, { width: width - 12 });
    doc.restore();

    // Subtext
    doc.save();
    doc.fillColor(this.palette.textMuted).fontSize(7).font("Helvetica");
    doc.text(subtext, x + 6, y + 48, { width: width - 12, ellipsis: true });
    doc.restore();
  }

  /**
   * Draw vulnerability severity badge (inline)
   */
  drawSeverityBadge(
    doc: PDFKit.PDFDocument,
    severity: string,
    x: number,
    y: number,
    width: number = 50,
    height: number = 14
  ) {
    const color = this.getSeverityColorByName(severity);

    doc.save();
    doc.fillColor(color).opacity(0.15);
    doc.roundedRect(x, y, width, height, 3).fill();

    doc.fillColor(color).font("Helvetica-Bold").fontSize(7.5);
    doc.text(severity, x, y + 1, { width, align: "center" });
    doc.restore();
  }

  /**
   * Draw professional section header
   */
  drawSectionHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    x: number,
    y: number,
    width: number,
    withAccent: boolean = true
  ) {
    if (withAccent) {
      doc.save();
      doc.fillColor(this.palette.accent);
      doc.roundedRect(x, y, 3, 24, 2).fill();
      doc.restore();

      doc.fillColor(this.palette.textPrimary).fontSize(14).font("Helvetica-Bold");
      doc.text(title, x + 12, y + 4);
    } else {
      doc.fillColor(this.palette.textPrimary).fontSize(14).font("Helvetica-Bold");
      doc.text(title, x, y);
    }
  }

  /**
   * Draw horizontal rule (divider)
   */
  drawDivider(doc: PDFKit.PDFDocument, x: number, y: number, width: number, style: "solid" | "dashed" = "solid") {
    doc.save();
    doc.strokeColor(this.palette.silver).lineWidth(0.5);

    if (style === "dashed") {
      doc.dash(2, { space: 2 });
    }

    doc.moveTo(x, y).lineTo(x + width, y).stroke();
    doc.restore();
  }

  /**
   * Draw clean status (no vulnerabilities)
   */
  private drawCleanStatus(doc: PDFKit.PDFDocument, x: number, y: number, radius: number) {
    const centerX = x + radius;
    const centerY = y + radius;

    doc.save();
    doc.fillColor(this.palette.success).opacity(0.2);
    doc.circle(centerX, centerY, radius).fill();
    doc.fillColor(this.palette.success);
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("✓", centerX - 8, centerY - 8, { width: 16, align: "center" });
    doc.fontSize(9).font("Helvetica");
    doc.text("CLEAN", centerX - 20, centerY + 8, { width: 40, align: "center" });
    doc.restore();
  }

  /**
   * Helper: Get color by severity level
   */
  private getSeverityColorByName(severity: string): string {
    const colorMap: Record<string, string> = {
      CRITICAL: this.palette.critical,
      HIGH: this.palette.high,
      MEDIUM: this.palette.medium,
      LOW: this.palette.low,
    };
    return colorMap[severity] || this.palette.textMuted;
  }

  /**
   * Helper: Get risk level label
   */
  private getRiskLevel(score: number): string {
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 35) return "MEDIUM";
    return "LOW";
  }

  /**
   * Helper: Get color for risk score
   */
  private getSeverityColor(score: number): string {
    if (score >= 80) return this.palette.critical;
    if (score >= 60) return this.palette.high;
    if (score >= 35) return this.palette.medium;
    return this.palette.low;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS FOR REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a professional page header with title and page number
 */
export function drawProfessionalPageHeader(
  doc: PDFKit.PDFDocument,
  title: string,
  pageNum: number,
  totalPages: number,
  x: number = 50,
  y: number = 0
) {
  const width = 495.28;
  
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.primary).opacity(0.95);
  doc.rect(x, y, width + 100, 36).fill();

  doc.fillColor(PROFESSIONAL_PALETTE.white).fontSize(9).font("Helvetica-Bold");
  doc.text("VulnGuard AI Security Audit", x + 12, y + 11);

  doc.fillColor(PROFESSIONAL_PALETTE.accent).fontSize(8).font("Helvetica");
  doc.text(title, x + 180, y + 12);

  doc.fillColor(PROFESSIONAL_PALETTE.textLight).fontSize(8);
  doc.text(`Page ${pageNum} of ${totalPages}`, x + width + 60 - 40, y + 12, { width: 40, align: "right" });

  doc.restore();
}

/**
 * Create a professional page footer
 */
export function drawProfessionalPageFooter(
  doc: PDFKit.PDFDocument,
  scanDate: string,
  x: number = 50,
  y: number = 791.89,
  width: number = 495.28
) {
  doc.save();
  doc.strokeColor(PROFESSIONAL_PALETTE.silver).lineWidth(0.5);
  doc.moveTo(x, y).lineTo(x + width, y).stroke();

  doc.fillColor(PROFESSIONAL_PALETTE.textLight).fontSize(7).font("Helvetica");
  doc.text(
    `VulnGuard AI Automated Security Report  •  ${scanDate}  •  Confidential - Use for authorized security assessment only`,
    x, y + 6, { width, align: "center" }
  );

  doc.restore();
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return `$${Math.max(0, Math.round(amount)).toLocaleString("en-US")}`;
}

/**
 * Format time duration
 */
export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

/**
 * Draw ASCII progress bar (for trend visualization)
 */
export function drawProgressBar(
  doc: PDFKit.PDFDocument,
  percentage: number,
  x: number,
  y: number,
  width: number = 150,
  height: number = 8
) {
  const filledWidth = (percentage / 100) * width;

  // Background
  doc.save();
  doc.fillColor(PROFESSIONAL_PALETTE.silver);
  doc.roundedRect(x, y, width, height, 2).fill();

  // Filled portion
  const color = percentage >= 80 ? PROFESSIONAL_PALETTE.critical
    : percentage >= 60 ? PROFESSIONAL_PALETTE.high
    : percentage >= 35 ? PROFESSIONAL_PALETTE.medium
    : PROFESSIONAL_PALETTE.low;

  doc.fillColor(color);
  doc.roundedRect(x, y, filledWidth, height, 2).fill();

  // Text
  doc.fillColor(PROFESSIONAL_PALETTE.white).fontSize(6).font("Helvetica-Bold");
  doc.text(`${Math.round(percentage)}%`, x + width / 2 - 8, y + 1);

  doc.restore();
}

/**
 * Helper: Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
}
