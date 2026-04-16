import { motion } from "framer-motion";
import { Bot, Building2, FileCode2, ShieldAlert, ShieldCheck, Workflow } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid, Panel, StatsStrip } from "@/components/marketing/SaasBlocks";

export default function Landing() {
  return (
    <MarketingShell
      eyebrow="VulnGuard Platform"
      title="Ship web3 products with security confidence"
      subtitle="A full-stack SaaS security platform for vulnerability detection, prioritization, and remediation at engineering speed."
    >
      <StatsStrip
        stats={[
          { label: "Vulnerabilities identified", value: "2M+" },
          { label: "Average scan completion", value: "< 60s" },
          { label: "Enterprise uptime", value: "99.95%" },
        ]}
      />

      <div className="mt-8">
        <FeatureGrid
          features={[
            {
              title: "AI-guided risk analysis",
              description: "Combines static analysis and model reasoning to identify high-impact vulnerabilities before deployment.",
              icon: <Bot className="h-5 w-5" />,
            },
            {
              title: "Pipeline-native workflow",
              description: "Run scans in CI and gate merges based on clear policy thresholds and severity rules.",
              icon: <Workflow className="h-5 w-5" />,
            },
            {
              title: "Auditor-ready reports",
              description: "Export findings and remediation summaries for leadership, compliance, and external review.",
              icon: <FileCode2 className="h-5 w-5" />,
            },
            {
              title: "Team governance",
              description: "Scoped access controls and project isolation for multi-team SaaS deployments.",
              icon: <Building2 className="h-5 w-5" />,
            },
            {
              title: "Coverage at scale",
              description: "Consistent scan performance for growth-stage products and enterprise codebases.",
              icon: <ShieldCheck className="h-5 w-5" />,
            },
          ]}
        />
      </div>

      <div className="mt-8">
        <Panel
          title="How VulnGuard detects real Solidity vulnerabilities"
          description="This is the same style of issue the platform detects in seconds, with precise fix guidance and severity scoring."
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">VulnerableBank.sol</p>
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                High Severity: Reentrancy
              </span>
            </div>
            <div className="grid gap-0 lg:grid-cols-[2fr_1fr]">
              <pre className="overflow-x-auto border-r border-border p-4 text-xs leading-6 text-muted-foreground lg:text-sm">
{`pragma solidity ^0.8.20;

contract VulnerableBank {
  mapping(address => uint256) public balances;

  function withdraw() external {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "No funds");

    // Unsafe external call before state update
    (bool ok,) = msg.sender.call{ value: amount }("");
    require(ok, "Transfer failed");

    balances[msg.sender] = 0;
  }
}`}
              </pre>
              <div className="space-y-3 p-4">
                <div className="rounded-xl border border-border bg-card p-3 text-sm">
                  <p className="font-semibold">Detected issue</p>
                  <p className="mt-1 text-muted-foreground">External interaction happens before internal state update, enabling recursive drains.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-sm">
                  <p className="font-semibold">Suggested fix</p>
                  <p className="mt-1 text-muted-foreground">Apply checks-effects-interactions: set balance to zero before the external call.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-sm">
                  <p className="font-semibold">Business impact</p>
                  <p className="mt-1 text-muted-foreground">Potential total value locked drain in production environments.</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <Panel
          title="Competitive Snapshot (2026)"
          description="Sourced from the Competitive Analysis Report and translated into execution-focused product criteria."
        >
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-card text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Platform</th>
                  <th className="px-4 py-3 font-semibold">Speed</th>
                  <th className="px-4 py-3 font-semibold">AI Fix Suggestions</th>
                  <th className="px-4 py-3 font-semibold">Team Features</th>
                  <th className="px-4 py-3 font-semibold">Pricing Position</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["VulnGuard AI", "Instant-first", "Yes", "Built-in", "Accessible SaaS tiers"],
                  ["SolidityScan", "Moderate", "Limited", "Mature", "Higher than budget tiers"],
                  ["MetaTrust", "Moderate", "Partial", "Enterprise-heavy", "Premium"],
                  ["MythX", "N/A", "N/A", "N/A", "Service ended"],
                  ["Open-source stack", "Varies", "No", "DIY", "Free but high operational overhead"],
                ].map((row, i) => (
                  <motion.tr
                    key={row[0]}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3 font-medium">{row[0]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[3]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[4]}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: <ShieldCheck className="h-5 w-5" />,
            title: "Why VulnGuard is best for execution",
            text: "It closes the loop from detection to fix, so engineering teams do not get stuck at warning-only outputs.",
          },
          {
            icon: <ShieldAlert className="h-5 w-5" />,
            title: "Built for speed and confidence",
            text: "Fast scan turnaround means security checks can run inside normal PR and release velocity.",
          },
          {
            icon: <Building2 className="h-5 w-5" />,
            title: "SaaS product quality at every page",
            text: "Unified UX, real routing, modern visuals, and full light/dark parity across all customer-facing pages.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 inline-flex rounded-lg border border-border bg-background p-2">{item.icon}</div>
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </MarketingShell>
  );
}
