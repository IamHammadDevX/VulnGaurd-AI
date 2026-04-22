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

export default function Landing() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [runDemo, setRunDemo] = useState(false);

  useEffect(() => {
    document.title = "Smart Contract Vulnerability Scanner | VulnGuard AI";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "VulnGuard AI is an AI-powered smart contract vulnerability scanner for Solidity. Detect 36+ vulnerability types, get AI fix suggestions, and generate audit reports in minutes.",
      );
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "VulnGuard AI",
      description: "AI-powered smart contract vulnerability scanner for Solidity smart contract security analysis and Web3 blockchain security.",
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
        "Detect 36+ vulnerability types",
        "AI-powered fix suggestions",
        "PDF audit report generation",
        "GitHub CI/CD integration",
        "Team collaboration tools",
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
      eyebrow="Web3 Security Platform"
      title="Deep-security UX for smart contract teams that ship under pressure"
      subtitle="VulnGuard AI combines deterministic analysis, AI reasoning, and enterprise-grade reporting in a single security workspace designed like a premium product."
    >
      <h1 className="sr-only">Smart Contract Vulnerability Scanner - AI-Powered Web3 Security Tool</h1>

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
                Skiper-style command surface
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                Turn raw contract code into an executive security signal.
              </h2>
              <p className="text-base leading-7 text-zinc-400">
                The landing experience now mirrors the product: dark, deliberate, and built around clear vulnerability signal. Show teams risk, remediation, and proof of velocity in one screen.
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
                  { label: "Signal clarity", value: "Agency-grade" },
                  { label: "Scan delivery", value: "Live streamed" },
                  { label: "Report export", value: "Audit ready" },
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
          title="Security leadership signal, not just scan output"
          description="Every surface is now optimized to present risk with more confidence, less clutter, and clearer next actions."
        >
          <div className="space-y-4">
            {[
              { icon: <ShieldAlert className="h-5 w-5 text-rose-300" />, title: "Critical-first prioritization", text: "Rose, amber, and emerald accents establish immediate vulnerability hierarchy." },
              { icon: <Workflow className="h-5 w-5 text-emerald-300" />, title: "Consistent motion system", text: "Entrance animations and elastic hovers make the product feel premium without becoming noisy." },
              { icon: <FileCheck2 className="h-5 w-5 text-zinc-100" />, title: "Report-friendly clarity", text: "Cards, metrics, and summaries are arranged to read like a polished security narrative." },
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

      <div className="mt-8">
        <FeatureGrid
          features={[
            { title: "AI fix intelligence", description: "Generate clear remediation suggestions with higher-trust structure and better readability for engineers.", icon: <Bot className="h-5 w-5" /> },
            { title: "Security dashboards", description: "Translate complex posture data into animated cards and trend surfaces your team can act on quickly.", icon: <TrendingUp className="h-5 w-5" /> },
            { title: "Team governance", description: "Move from solo scans to team operations without losing the speed and clarity of the product surface.", icon: <Building2 className="h-5 w-5" /> },
            { title: "Rapid scan loops", description: "Keep scan initiation, progress, and results inside one responsive interface with clear status states.", icon: <TimerReset className="h-5 w-5" /> },
            { title: "Policy-ready reporting", description: "Give stakeholders exportable evidence and structured summaries without leaving the platform.", icon: <FileCheck2 className="h-5 w-5" /> },
            { title: "Always-on motion polish", description: "Skiper-inspired transitions make the entire experience feel intentional instead of template-driven.", icon: <Sparkles className="h-5 w-5" /> },
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
              { step: "01", title: "Upload or paste your contract", text: "Start with a clean editor surface that prioritizes focus and code readability." },
              { step: "02", title: "Watch scan progress live", text: "Dynamic status states communicate analysis, risk scoring, and issue discovery in real time." },
              { step: "03", title: "Review fix-ready findings", text: "Each vulnerability is grouped into high-signal cards with better emphasis on severity and impact." },
              { step: "04", title: "Export and share", text: "Move from detection to audit evidence with reporting that looks polished enough for stakeholders." },
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
          title="Built for teams operating in release windows"
          description="The aesthetic is calmer, but the product signal is sharper. Risk, progress, and action paths stay visible at every step."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: <Activity className="h-5 w-5 text-emerald-300" />, title: "Live vulnerability telemetry" },
              { icon: <Workflow className="h-5 w-5 text-zinc-100" />, title: "Team-friendly navigation" },
              { icon: <Zap className="h-5 w-5 text-amber-300" />, title: "Rapid scan launch loops" },
              { icon: <ShieldCheck className="h-5 w-5 text-emerald-300" />, title: "Calm, trusted dark theme" },
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
          title="Trusted by fast-moving builders who still care about polish"
          description="The product story now feels as premium as the scanning capability behind it."
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
          title="Upgrade the way your security product feels"
          description="The scanner, dashboard, auth, and support experiences now share one dark visual language with stronger motion, better hierarchy, and more credible polish."
        >
          <div className="flex flex-col gap-4 rounded-[28px] border border-zinc-800 bg-white/[0.03] p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xl font-semibold text-zinc-50">Run your first scan in the redesigned workspace.</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">See the new dashboard, live status island, animated cards, and unified navigation system in action.</p>
            </div>
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18 sm:w-auto"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Panel>
      </div>
    </MarketingShell>
  );
}
