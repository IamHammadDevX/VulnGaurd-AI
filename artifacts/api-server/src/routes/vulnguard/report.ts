import { Router, type IRouter } from "express";
import PDFDocument from "pdfkit";
import { GetReportParams } from "@workspace/api-zod";
import { getScan } from "./store.js";

const router: IRouter = Router();

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

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

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const filename = `${scan.contract_name.replace(/[^a-zA-Z0-9]/g, "_")}-audit-report.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc
    .fillColor("#0f172a")
    .rect(0, 0, doc.page.width, 120)
    .fill()
    .fillColor("#3b82f6")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("VulnGuard AI", 50, 35)
    .fillColor("#94a3b8")
    .fontSize(11)
    .font("Helvetica")
    .text("AI-Powered Smart Contract Security Audit Report", 50, 65)
    .fillColor("#475569")
    .fontSize(9)
    .text(`Generated: ${new Date(scan.timestamp).toUTCString()}`, 50, 87);

  doc.moveDown(3);

  doc
    .fillColor("#1e293b")
    .roundedRect(50, 140, doc.page.width - 100, 90, 6)
    .fill()
    .fillColor("#f1f5f9")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(scan.contract_name, 70, 155)
    .fillColor("#94a3b8")
    .fontSize(10)
    .font("Helvetica")
    .text(`Scan ID: ${scanId}`, 70, 175)
    .text(`Analysis Time: ${(scan.analysis_time_ms / 1000).toFixed(1)}s`, 70, 190);

  const riskColor = scan.risk_score >= 70 ? "#ef4444" : scan.risk_score >= 40 ? "#f97316" : "#22c55e";
  doc
    .fillColor(riskColor)
    .fontSize(28)
    .font("Helvetica-Bold")
    .text(`${scan.risk_score}/100`, doc.page.width - 160, 150, { width: 110, align: "right" })
    .fillColor("#94a3b8")
    .fontSize(9)
    .font("Helvetica")
    .text("Risk Score", doc.page.width - 160, 183, { width: 110, align: "right" });

  doc.moveDown(2);

  const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  (scan.vulnerabilities as Array<{ severity: string }>).forEach((v) => {
    if (v.severity in counts) counts[v.severity]++;
  });

  const summaryY = 250;
  doc
    .fillColor("#0f172a")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Executive Summary", 50, summaryY);

  const boxX = [50, 175, 300, 425];
  const labels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  labels.forEach((sev, i) => {
    doc
      .fillColor("#1e293b")
      .roundedRect(boxX[i], summaryY + 20, 115, 55, 4)
      .fill()
      .fillColor(SEVERITY_COLORS[sev] ?? "#94a3b8")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(String(counts[sev]), boxX[i] + 8, summaryY + 26)
      .fillColor("#94a3b8")
      .fontSize(8)
      .font("Helvetica")
      .text(sev, boxX[i] + 8, summaryY + 54);
  });

  doc.moveDown(1).moveDown(1).moveDown(1).moveDown(1);

  const totalY = summaryY + 90;
  doc
    .fillColor("#334155")
    .fontSize(10)
    .font("Helvetica")
    .text(`Total Vulnerabilities: ${scan.total_vulnerabilities}   |   Overall Risk Score: ${scan.risk_score}/100`, 50, totalY);

  doc.moveDown(0.5);

  doc
    .fillColor("#475569")
    .fontSize(9)
    .font("Helvetica")
    .text(scan.summary, 50, doc.y, { width: doc.page.width - 100, lineGap: 3 });

  doc.addPage();

  doc
    .fillColor("#0f172a")
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Vulnerability Details", 50, 50)
    .moveDown(0.5);

  if (scan.total_vulnerabilities === 0) {
    doc
      .fillColor("#22c55e")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("No vulnerabilities detected.", 50, doc.y)
      .fillColor("#475569")
      .fontSize(10)
      .font("Helvetica")
      .moveDown(0.5)
      .text(
        "This contract passed all automated security checks. Manual review is still recommended before mainnet deployment.",
        { width: doc.page.width - 100 }
      );
  } else {
    const vulns = scan.vulnerabilities as Array<{
      id: number;
      severity: string;
      type: string;
      title: string;
      line_number: number | null;
      description: string;
      technical_risk: string;
      recommendation: string;
      vulnerable_code: string | null;
      fixed_code: string | null;
    }>;

    vulns.forEach((vuln, idx) => {
      if (doc.y > doc.page.height - 180) {
        doc.addPage();
      }

      const severityColor = SEVERITY_COLORS[vuln.severity] ?? "#94a3b8";
      const cardY = doc.y;

      doc
        .fillColor("#1e293b")
        .roundedRect(50, cardY, doc.page.width - 100, 14, 3)
        .fill()
        .fillColor(severityColor)
        .rect(50, cardY, 5, 14)
        .fill()
        .fillColor("#f1f5f9")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${idx + 1}. ${vuln.title}`, 62, cardY + 3, { width: doc.page.width - 170 })
        .fillColor(severityColor)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(vuln.severity, doc.page.width - 110, cardY + 4, { width: 60, align: "right" });

      doc.moveDown(0.8);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica")
        .text(`Type: ${vuln.type}${vuln.line_number ? `  |  Line: ${vuln.line_number}` : ""}`, 55, doc.y);

      doc.moveDown(0.4);

      doc
        .fillColor("#475569")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Description:", 55, doc.y)
        .font("Helvetica")
        .fillColor("#334155")
        .text(vuln.description, 55, doc.y, { width: doc.page.width - 110, lineGap: 2 });

      doc.moveDown(0.4);

      doc
        .fillColor("#475569")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Technical Risk:", 55, doc.y)
        .font("Helvetica")
        .fillColor("#334155")
        .text(vuln.technical_risk, 55, doc.y, { width: doc.page.width - 110, lineGap: 2 });

      doc.moveDown(0.4);

      doc
        .fillColor("#475569")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Recommendation:", 55, doc.y)
        .font("Helvetica")
        .fillColor("#334155")
        .text(vuln.recommendation, 55, doc.y, { width: doc.page.width - 110, lineGap: 2 });

      if (vuln.fixed_code) {
        if (doc.y > doc.page.height - 100) doc.addPage();
        doc.moveDown(0.4);
        doc
          .fillColor("#475569")
          .fontSize(9)
          .font("Helvetica-Bold")
          .text("Suggested Fix:", 55, doc.y)
          .fillColor("#1e4620")
          .fontSize(7.5)
          .font("Courier")
          .text(
            vuln.fixed_code.substring(0, 500) + (vuln.fixed_code.length > 500 ? "\n..." : ""),
            55,
            doc.y,
            { width: doc.page.width - 110, lineGap: 1 }
          );
      }

      doc.moveDown(1.2);
    });
  }

  doc
    .addPage()
    .fillColor("#0f172a")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Security Recommendations", 50, 50)
    .moveDown(0.5)
    .fillColor("#475569")
    .fontSize(10)
    .font("Helvetica")
    .list(
      [
        "Always use the latest stable version of Solidity (0.8.x+) for built-in overflow protection.",
        "Import and use OpenZeppelin's audited contracts for access control and reentrancy guards.",
        "Follow the Checks-Effects-Interactions pattern in all state-changing functions.",
        "Never use block.timestamp or block.number as a source of randomness.",
        "Conduct a manual security audit before deploying to mainnet.",
        "Use static analysis tools like Slither, Mythril, and Echidna in your CI pipeline.",
        "Consider formal verification for high-value contracts.",
        "Set up a bug bounty program after deployment.",
      ],
      { bulletRadius: 2, textIndent: 15, lineGap: 4, width: doc.page.width - 100 }
    )
    .moveDown(1)
    .fillColor("#94a3b8")
    .fontSize(9)
    .text("References:", 50, doc.y)
    .fillColor("#3b82f6")
    .text("• OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/", 55, doc.y)
    .text("• SWC Registry: https://swcregistry.io/", 55, doc.y)
    .text("• Secureum: https://secureum.substack.com/", 55, doc.y)
    .text("• Slither: https://github.com/crytic/slither", 55, doc.y);

  doc
    .fillColor("#94a3b8")
    .fontSize(8)
    .font("Helvetica")
    .text(
      `VulnGuard AI Audit Report  •  ${new Date(scan.timestamp).toLocaleDateString()}  •  For security questions, consult a professional auditor.`,
      50,
      doc.page.height - 40,
      { width: doc.page.width - 100, align: "center" }
    );

  doc.end();
});

export default router;
