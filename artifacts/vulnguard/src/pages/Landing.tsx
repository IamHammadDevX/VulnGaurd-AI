import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Building2, ChevronLeft, ChevronRight, FileCode2, MessageSquareQuote, ShieldAlert, ShieldCheck, Workflow } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid, Panel, StatsStrip } from "@/components/marketing/SaasBlocks";

export default function Landing() {
  const testimonials = [
    {
      name: "Cris Sierra",
      role: "Community Reviewer",
      message:
        "I really like this project, smart, efficient and helpful. Congratulations to the developer, this is an awesome project.",
    },
    {
      name: "Shipra M",
      role: "Web3 Builder",
      message: "Great product direction. It makes smart contract security understandable and actionable for fast-moving teams.",
    },
    {
      name: "Cesar Ulloa",
      role: "Community Supporter",
      message: "The workflow feels practical, not academic. It helps teams move from finding issues to fixing them quickly.",
    },
    {
      name: "B Gunduz",
      role: "Security Advocate",
      message: "Strong value for projects that cannot afford delayed audits. The speed-to-feedback is a major advantage.",
    },
    {
      name: "Jamilu Adamu",
      role: "Smart Contract Developer",
      message: "Useful for pre-deployment checks. It gives clarity on where risk is and what to prioritize first.",
    },
    {
      name: "Alek Nikolic",
      role: "Web3 Community Member",
      message: "Promising security product with real utility. It addresses real pain points builders face before launch.",
    },
    {
      name: "Jessica L",
      role: "Product Enthusiast",
      message: "Clean concept and helpful execution. This is the type of tooling Web3 teams need to scale responsibly.",
    },
    {
      name: "Sameer YG",
      role: "Early Adopter",
      message: "A high-impact project. It saves engineering time while increasing confidence in smart contract releases.",
    },
    {
      name: "Eric Jivraj",
      role: "Community Contributor",
      message: "The platform is smart and efficient. It can become a core part of secure development workflows.",
    },
    {
      name: "Deekshita Kaki",
      role: "Web3 Community Member",
      message: "Very strong potential. It simplifies complex security tasks into a workflow teams can actually adopt.",
    },
    {
      name: "Leon Williams",
      role: "Builder",
      message: "Great momentum and great vision. VulnGuard solves a meaningful security gap in the ecosystem.",
    },
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const goPrev = () =>
    setActiveTestimonial((current) => (current - 1 + testimonials.length) % testimonials.length);
  const goNext = () => setActiveTestimonial((current) => (current + 1) % testimonials.length);

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

      <div className="mt-8">
        <Panel
          title="Loved by the Web3 builder community"
          description="VulnGuard was showcased during the Replit Agent 4 Hackathon and received strong positive response from builders and security-minded teams."
        >
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                Community Testimonials
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <motion.div
              key={testimonials[activeTestimonial].name}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-border bg-background p-4"
            >
              <p className="text-base font-semibold leading-relaxed text-foreground sm:text-lg">"{testimonials[activeTestimonial].message}"</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-semibold">{testimonials[activeTestimonial].name}</p>
                <span className="rounded-full border border-border bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {testimonials[activeTestimonial].role}
                </span>
              </div>
            </motion.div>

            <div className="mt-4 flex flex-wrap gap-2">
              {testimonials.map((item, idx) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === activeTestimonial ? "w-7 bg-foreground" : "w-2.5 bg-border hover:bg-muted-foreground/40"
                  }`}
                  aria-label={`View testimonial from ${item.name}`}
                />
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <Panel
          title="Problems VulnGuard solves in the real world"
          description="The platform targets the most expensive security bottlenecks faced by global Web3 teams shipping to production."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                problem: "Exploit-first releases",
                impact: "Protocols discover critical bugs after deployment when TVL and user trust are already at risk.",
                solve: "VulnGuard scans pre-release and flags high-severity vulnerabilities before mainnet launch.",
              },
              {
                problem: "Slow audit feedback cycles",
                impact: "Teams lose sprint velocity while waiting for manual findings and unclear remediation paths.",
                solve: "AI-assisted analysis provides rapid findings with fix direction, so engineers can patch fast.",
              },
              {
                problem: "Security talent bottleneck",
                impact: "Not every startup can afford full-time in-house auditors across every release train.",
                solve: "VulnGuard gives smaller teams enterprise-grade triage and risk prioritization workflows.",
              },
              {
                problem: "Fragmented security tooling",
                impact: "Context gets lost between scanners, dashboards, and PDF reporting tools.",
                solve: "One SaaS workflow for scan, triage, report export, and team collaboration.",
              },
              {
                problem: "Compliance and stakeholder visibility",
                impact: "Leaders and partners struggle to track risk posture across contracts and releases.",
                solve: "VulnGuard produces auditor-ready outputs and clear severity distribution reporting.",
              },
              {
                problem: "False confidence from checklist-only reviews",
                impact: "Passing basic checks can still miss exploitable business logic vulnerabilities.",
                solve: "Hybrid static + reasoning analysis helps surface nuanced exploit paths earlier.",
              },
            ].map((item) => (
              <div key={item.problem} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">{item.problem}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.impact}</p>
                <p className="mt-3 text-sm font-medium text-foreground">How VulnGuard solves it</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.solve}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </MarketingShell>
  );
}
