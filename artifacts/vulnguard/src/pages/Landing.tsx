import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid, Panel, StatsStrip } from "@/components/marketing/SaasBlocks";

const TESTIMONIALS = [
  {
    name: "Cris Sierra",
    role: "Community Reviewer",
    quote: "The product feels operational from day one. It shortens the distance between finding risk and fixing it.",
  },
  {
    name: "Shipra M",
    role: "Web3 Builder",
    quote: "A very credible developer-security experience. The design now reflects the seriousness of the problem space.",
  },
  {
    name: "Jamilu Adamu",
    role: "Smart Contract Developer",
    quote: "It gives fast, understandable feedback and helps prioritize what matters before release windows tighten.",
  },
];

const LIVE_FINDINGS = [
  { type: "Reentrancy", severity: "Critical", accent: "text-rose-300 bg-rose-500/12 border-rose-500/25", detail: "External call happens before state update" },
  { type: "Access Control", severity: "High", accent: "text-amber-300 bg-amber-500/12 border-amber-500/25", detail: "Privileged path lacks ownership check" },
  { type: "Unchecked Return", severity: "Medium", accent: "text-zinc-200 bg-white/[0.04] border-zinc-700", detail: "Transfer result is not verified before continuation" },
];

const VULNERABILITY_CLASSES = [
  "Reentrancy",
  "Access Control",
  "Integer Overflow/Underflow",
  "Unchecked External Calls",
  "Flash Loan Price Manipulation",
  "Timestamp Dependence",
  "Front-Running / TOD",
  "Unprotected Self-Destruct",
  "Denial of Service",
  "Bad Randomness",
  "Oracle Manipulation",
  "Gas Limit Issues",
];

export default function Landing() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [runDemo, setRunDemo] = useState(false);

  useEffect(() => {
    document.title = "AI Solidity Vulnerability Scanner | VulnGuard AI";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "VulnGuard AI is an AI-powered Solidity smart contract vulnerability scanner. Detect reentrancy, access control, integer overflow, and 36+ other vulnerability classes in under 60 seconds, then get AI-generated fixes and an audit-ready PDF report.",
      );
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "VulnGuard AI",
      description: "AI-powered Solidity smart contract vulnerability scanner combining deterministic SWC-registry pattern analysis with AI reasoning to detect reentrancy, access control, integer overflow, oracle manipulation, and other DeFi security risks.",
      applicationCategory: "DeveloperApplication",
      url: "https://thevulnguardai.tech",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      softwareVersion: "1.0",
      featureList: [
        "Detect 36+ vulnerability classes mapped to the SWC registry",
        "AI-generated fix suggestions with plain-English explanations",
        "PDF audit report generation",
        "Real-time scan streaming via SSE",
        "Team workspaces with role-based access",
      ],
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const heroFindingCount = useMemo(() => (runDemo ? "03" : "00"), [runDemo]);

  return (
    <MarketingShell
      eyebrow="AI Smart Contract Security Scanner"
      title="AI-powered vulnerability scanning for Solidity smart contracts"
      subtitle="Smart contract exploits are still the leading cause of losses in Web3 — and plenty of those contracts had already passed a manual review. VulnGuard AI pairs deterministic SWC-registry checks with AI reasoning to catch reentrancy, access-control, and logic bugs that audits and single-purpose scanners miss, then hands you a fix and an audit-ready report in under 60 seconds — no audit queue required."
    >
      <StatsStrip
        stats={[
          { label: "Vulnerabilities surfaced", value: "2M+" },
          { label: "Average scan completion", value: "< 60s" },
          { label: "Posture visibility", value: "36+ SWC checks" },
        ]}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                Live AI scan engine
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                From pasted Solidity to a prioritized vulnerability report — in under 60 seconds.
              </h2>
              <p className="text-base leading-7 text-zinc-400">
                Paste your contract or drag in a .sol file. VulnGuard AI runs deterministic SWC pattern checks alongside an AI model that reasons about business logic, then returns a CRITICAL → LOW ranked list with exploit context and ready-to-use fixed code.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18 sm:w-auto"
                >
                  Start free scan
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/product"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-800 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] sm:w-auto"
                >
                  Explore product
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Detection coverage", value: "36+ SWC classes" },
                  { label: "Scan speed", value: "< 60 seconds" },
                  { label: "Report output", value: "PDF + AI fixes" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-zinc-100">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_24px_80px_-50px_rgba(0,0,0,1)]">
              <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Live scan preview</p>
                  <p className="mt-1 text-sm font-medium text-zinc-100">TreasuryVault.sol</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRunDemo((value) => !value)}
                  className="w-full rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:-translate-y-0.5 sm:w-auto"
                >
                  {runDemo ? "Reset demo" : "Run demo"}
                </button>
              </div>

              <div className="mt-4 rounded-[24px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(39,39,42,0.36),rgba(9,9,11,0.95))] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Findings surfaced</p>
                    <p className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-zinc-50">{heroFindingCount}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-left sm:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Risk score</p>
                    <p className="mt-1 text-2xl font-semibold text-rose-300">{runDemo ? "87/100" : "--"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {(runDemo ? LIVE_FINDINGS : LIVE_FINDINGS.slice(0, 1)).map((finding, index) => (
                    <motion.div
                      key={finding.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className={`rounded-2xl border px-4 py-3 ${finding.accent}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold">{finding.type}</p>
                          <p className="mt-1 text-xs text-zinc-300/90">{finding.detail}</p>
                        </div>
                        <span className="w-fit rounded-full border border-current/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]">
                          {finding.severity}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-1 text-xs font-medium text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>Engine status</span>
                    <span>{runDemo ? "Fix-ready insights generated" : "Awaiting analysis request"}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={false}
                      animate={{ width: runDemo ? "100%" : "16%" }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-[linear-gradient(90deg,#10b981,#f59e0b)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <Panel
          title="Built to close the gap manual audits leave open"
          description="A scanner can't replace a full audit — but it can give you continuous coverage between them, instead of shipping blind for weeks at a time."
        >
          <div className="space-y-4">
            {[
              { icon: <ShieldAlert className="h-5 w-5 text-rose-300" />, title: "Seconds, not an audit queue", text: "Get a full vulnerability breakdown the moment you paste your contract — no booking a slot and waiting weeks for a manual review to start." },
              { icon: <Workflow className="h-5 w-5 text-emerald-300" />, title: "AI reasoning, not just pattern-matching", text: "Deterministic SWC checks catch known issue patterns. AI reasoning on top of that catches business-logic and cross-function bugs single-purpose static analyzers typically miss." },
              { icon: <FileCheck2 className="h-5 w-5 text-zinc-100" />, title: "One workspace, not five tools", text: "Scanning, AI fix generation, severity scoring, and audit-ready PDF export live in one place — not stitched together from separate tools and spreadsheets." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
                <div className="mb-3 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 p-2">{item.icon}</div>
                <p className="text-base font-semibold text-zinc-50">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <div className="mt-8 overflow-hidden rounded-[28px] border border-zinc-800/80 bg-white/[0.03] py-5">
        <p className="px-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          36+ vulnerability classes detected, mapped to the SWC registry
        </p>
        <motion.div
          className="mt-4 flex w-max gap-3 px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          {[...VULNERABILITY_CLASSES, ...VULNERABILITY_CLASSES].map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="shrink-0 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm font-medium text-zinc-300"
            >
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mt-8">
        <FeatureGrid
          features={[
            { title: "AI fix intelligence", description: "For every finding, get AI-generated remediation code and a plain-English explanation of the exploit — not just a line number and a severity tag.", icon: <Bot className="h-5 w-5" /> },
            { title: "Security dashboards", description: "Track risk score, scan history, and vulnerability trends across every contract your team has scanned, in one place.", icon: <TrendingUp className="h-5 w-5" /> },
            { title: "Team governance", description: "Invite your team with admin, editor, or viewer roles, and share scan history across one workspace instead of local results.", icon: <Building2 className="h-5 w-5" /> },
            { title: "Rapid scan loops", description: "Re-scan after every fix with live streaming results — built for teams shipping between release windows, not annual audit cycles.", icon: <TimerReset className="h-5 w-5" /> },
            { title: "Policy-ready reporting", description: "Export a polished PDF audit report with severity breakdown and per-finding detail your stakeholders can read without translation.", icon: <FileCheck2 className="h-5 w-5" /> },
            { title: "Drag-and-drop contract upload", description: "Drop in a .sol file or paste code directly into the Monaco-powered editor with full Solidity syntax highlighting.", icon: <Sparkles className="h-5 w-5" /> },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel
          title="From Solidity upload to executive-ready report in four steps"
          description="The product flow is designed to feel fast, structured, and trustworthy from first scan to remediation."
        >
          <div className="space-y-4">
            {[
              { step: "01", title: "Upload or paste your contract", text: "Paste Solidity directly or drag in a .sol file — the Monaco-powered editor highlights syntax as you go." },
              { step: "02", title: "Watch scan progress live", text: "Deterministic SWC checks and AI reasoning run together, streaming status updates in real time." },
              { step: "03", title: "Review fix-ready findings", text: "Each vulnerability is ranked CRITICAL to LOW with exploit context, vulnerable code, and an AI-generated fix side by side." },
              { step: "04", title: "Export and share", text: "Download a polished PDF audit report, or keep results in your team dashboard for the next release." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-white/[0.03] p-4 sm:flex-row">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-100">
                  {item.step}
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-50">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Built for teams that ship between audits"
          description="Most teams can't get a manual audit slot before every release. VulnGuard AI gives you continuous coverage in between, without replacing the rigor of a full audit when you need one."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: <Activity className="h-5 w-5 text-emerald-300" />, title: "Real-time scan streaming" },
              { icon: <Workflow className="h-5 w-5 text-zinc-100" />, title: "Shared team workspace" },
              { icon: <Zap className="h-5 w-5 text-amber-300" />, title: "Re-scan in seconds" },
              { icon: <ShieldCheck className="h-5 w-5 text-emerald-300" />, title: "Free scans to start" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-5">
                <div className="mb-3 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 p-2">{item.icon}</div>
                <p className="text-base font-semibold text-zinc-50">{item.title}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <Panel
          title="What builders say after adding VulnGuard AI to their workflow"
          description="Real feedback from teams running VulnGuard AI alongside their usual security process."
        >
          <div className="rounded-[28px] border border-zinc-800 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Community signal</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTestimonial((value) => (value - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="rounded-full border border-zinc-800 bg-white/[0.04] p-2 text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTestimonial((value) => (value + 1) % TESTIMONIALS.length)}
                  className="rounded-full border border-zinc-800 bg-white/[0.04] p-2 text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <motion.div
              key={TESTIMONIALS[activeTestimonial].name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-4 rounded-[24px] border border-zinc-800 bg-zinc-950/80 p-6"
            >
              <p className="text-xl font-medium leading-8 text-zinc-100">“{TESTIMONIALS[activeTestimonial].quote}”</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-50">{TESTIMONIALS[activeTestimonial].name}</p>
                  <p className="text-sm text-zinc-500">{TESTIMONIALS[activeTestimonial].role}</p>
                </div>
                <span className="w-fit rounded-full border border-zinc-800 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Verified signal
                </span>
              </div>
            </motion.div>
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <Panel
          title="Stop shipping blind between audit cycles."
          description="Run your first AI-powered Solidity vulnerability scan free — get a prioritized, fix-ready report in under 60 seconds."
        >
          <div className="flex flex-col gap-4 rounded-[28px] border border-zinc-800 bg-white/[0.03] p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xl font-semibold text-zinc-50">See your first vulnerability report in under 60 seconds.</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Paste a contract, watch the AI and SWC checks run live, and export an audit-ready PDF — free to start.</p>
            </div>
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18 sm:w-auto"
            >
              Start free scan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Panel>
      </div>
    </MarketingShell>
  );
}
