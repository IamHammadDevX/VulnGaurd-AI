import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Building2, ChevronLeft, ChevronRight, FileCode2, MessageSquareQuote, ShieldAlert, ShieldCheck, Workflow, CheckCircle2, Zap, TrendingUp, Lock } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid, Panel, StatsStrip } from "@/components/marketing/SaasBlocks";

export default function Landing() {
  useEffect(() => {
    document.title = "Smart Contract Vulnerability Scanner | VulnGuard AI";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "VulnGuard AI is an AI-powered smart contract vulnerability scanner for Solidity. Detect security issues, get fix suggestions, and generate audit reports.");
    }
  }, []);

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
  const [codeView, setCodeView] = useState<"vulnerable" | "fixed">("vulnerable");
  const [scanInput, setScanInput] = useState("");

  const goPrev = () =>
    setActiveTestimonial((current) => (current - 1 + testimonials.length) % testimonials.length);
  const goNext = () => setActiveTestimonial((current) => (current + 1) % testimonials.length);
  
  const [scanResults, setScanResults] = useState<Array<{ type: string; severity: string; line: number; description: string }>>([
    { type: "Reentrancy", severity: "Critical", line: 45, description: "External call before state update" },
    { type: "Integer Overflow", severity: "High", line: 78, description: "Unchecked arithmetic operation" },
    { type: "Access Control", severity: "High", line: 120, description: "Missing authorization check" },
  ]);

  const handleScanContract = () => {
    // Mock scan - in production this calls the API
    setScanResults([
      { type: "Reentrancy", severity: "Critical", line: 45, description: "External call before state update" },
      { type: "Integer Overflow", severity: "High", line: 78, description: "Unchecked arithmetic operation" },
      { type: "Access Control", severity: "High", line: 120, description: "Missing authorization check" },
      { type: "Front-running", severity: "Medium", line: 156, description: "Transaction ordering dependency" },
    ]);
  };

  return (
    <MarketingShell
      eyebrow="Web3 Security Platform"
      title="Smart Contract Vulnerability Scanner – AI-Powered Web3 Security Tool"
      subtitle="Detect, understand, and fix Solidity vulnerabilities instantly. VulnGuard AI combines static analysis with LLM reasoning to identify 36+ vulnerability types before deployment."
    >
      {/* SEO: H1 with target keyword */}
      <h1 className="sr-only">Smart Contract Vulnerability Scanner – AI-Powered Web3 Security Tool</h1>

      <StatsStrip
        stats={[
          { label: "Vulnerabilities identified", value: "2M+" },
          { label: "Average scan completion", value: "< 60s" },
          { label: "Enterprise uptime", value: "99.95%" },
        ]}
      />

      {/* Hero CTA Section */}
      <section className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center lg:p-12">
        <h2 className="text-2xl font-bold leading-tight text-foreground lg:text-3xl">
          Why Smart Contract Security Matters
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
          Every year, millions of dollars in Web3 value are lost to smart contract vulnerabilities. From reentrancy attacks to integer overflows, security flaws in Solidity code can lead to catastrophic financial losses. A smart contract vulnerability scanner helps teams detect and fix security issues before they reach production.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
          VulnGuard AI brings enterprise-grade security analysis to projects of any size. Our AI-powered smart contract vulnerability scanner identifies 36+ vulnerability types, provides fix suggestions, and generates audit reports—all in minutes instead of weeks.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Zap className="mr-2 h-4 w-4" />
            Start Free Scan
          </a>
          <a
            href="/product"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-semibold transition-colors hover:border-foreground"
          >
            View Live Demo
          </a>
        </div>
      </section>

      {/* What is a Smart Contract Vulnerability Scanner Section */}
      <section className="mt-12">
        <Panel
          title="What is a Smart Contract Vulnerability Scanner?"
          description="A smart contract vulnerability scanner is an automated security tool that analyzes Solidity code to detect potential security flaws before deployment."
        >
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              A smart contract vulnerability scanner analyzes Solidity source code to identify security weaknesses, design flaws, and potential exploits. Unlike manual audits that take weeks, automated scanners provide instant feedback on your smart contract code. VulnGuard AI combines static analysis with AI reasoning to detect complex vulnerabilities that traditional tools miss.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              The best smart contract vulnerability scanner balances speed, accuracy, and actionability. VulnGuard doesn't just flag issues—it explains them in plain English and provides before/after code examples so developers can understand and fix each vulnerability quickly.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Real-time Vulnerability Detection
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">Scan contracts instantly and receive severity-rated findings with line numbers and detailed explanations.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  AI-Powered Fix Suggestions
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">Get specific fix recommendations with before/after code samples for each vulnerability found.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-blue-500" />
                  Audit Report Generation
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">Export professional PDF reports with executive summaries, vulnerability details, and remediation guidance.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  Team Collaboration
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">Share scans, assign issues, and track remediation progress across engineering teams.</p>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* Common Smart Contract Vulnerabilities Section */}
      <section className="mt-8">
        <Panel
          title="Common Smart Contract Vulnerabilities: What You Need to Know"
          description="Understanding the most critical vulnerability types helps you write safer Solidity code and catch issues early."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                title: "Reentrancy Attacks",
                description: "Occurs when a smart contract calls an external contract before updating internal state. Attackers can recursively drain funds.",
                example: "Calling transfer() before updating balances allows re-entrance.",
                fix: "Apply checks-effects-interactions pattern: update state first.",
              },
              {
                title: "Integer Overflow & Underflow",
                description: "In older Solidity versions, arithmetic operations could wrap around, causing unexpected value changes.",
                example: "uint8 max = 255; max + 1 = 0 (wraps around).",
                fix: "Use Solidity 0.8.0+ with built-in overflow protection or SafeMath library.",
              },
              {
                title: "Front-running & MEV",
                description: "Attackers observe pending transactions and submit their own transactions with higher gas to execute first.",
                example: "An attacker sees your buy order and purchases before you to profit from price impact.",
                fix: "Use commit-reveal schemes or MEV-aware patterns like private mempools.",
              },
              {
                title: "Access Control Issues",
                description: "Missing or incorrect permission checks allow unauthorized users to call sensitive functions.",
                example: "Admin functions without onlyOwner modifier can be called by anyone.",
                fix: "Use access control patterns: modifiers, OpenZeppelin AccessControl, or role-based permissions.",
              },
              {
                title: "Uninitialized Storage Variables",
                description: "Storage variables left uninitialized can have unexpected default values, leading to exploits.",
                example: "Proxy contracts pointing to implementation without initialization.",
                fix: "Always initialize state variables explicitly in constructors.",
              },
              {
                title: "Delegatecall Vulnerabilities",
                description: "Delegatecall preserves caller's context, risking storage conflicts and unauthorized state modification.",
                example: "Unsafe delegatecall in proxy patterns can allow selfdestruct of the implementation.",
                fix: "Use battle-tested proxy patterns like OpenZeppelin's UUPS or TransparentProxy.",
              },
            ].map((vuln) => (
              <motion.div
                key={vuln.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-base font-semibold text-foreground">{vuln.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{vuln.description}</p>
                <div className="mt-3 rounded-lg bg-background p-3">
                  <p className="text-xs font-mono text-muted-foreground">
                    <span className="font-semibold">Example:</span> {vuln.example}
                  </p>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Fix:</span> {vuln.fix}
                </p>
              </motion.div>
            ))}
          </div>
        </Panel>
      </section>

      {/* How VulnGuard Works Section */}
      <section className="mt-8">
        <Panel
          title="How VulnGuard AI Works: 4 Simple Steps"
          description="Smart contract vulnerability scanning made simple. From code to report in minutes."
        >
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "Paste Your Solidity Contract",
                description: "Upload or paste your Solidity smart contract code into the editor. Supports single files and multi-file projects.",
                icon: "📄",
              },
              {
                step: 2,
                title: "AI Analyzes for 36+ Vulnerability Types",
                description: "Our AI-powered scanner combines static analysis with LLM reasoning to identify vulnerabilities across all SWC categories.",
                icon: "🔍",
              },
              {
                step: 3,
                title: "Review Detailed Findings & Fixes",
                description: "See severity-rated vulnerabilities with line numbers, plain-English explanations, and AI-suggested fixes.",
                icon: "✓",
              },
              {
                step: 4,
                title: "Export Audit Report (Optional)",
                description: "Download a professional PDF report with executive summary, detailed findings, and remediation guidance.",
                icon: "📊",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.step * 0.1 }}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-lg font-bold">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted-foreground">Step {item.step}</p>
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Smart Contract Scanner Mock UI */}
      <section className="mt-8">
        <Panel
          title="Try the Smart Contract Vulnerability Scanner"
          description="Paste Solidity code and see real vulnerability detection in action."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label htmlFor="code-input" className="text-sm font-semibold">
                Solidity Smart Contract Code
              </label>
              <textarea
                id="code-input"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="pragma solidity ^0.8.0;

contract Example {
  mapping(address => uint256) public balances;
  
  function withdraw(uint256 amount) external {
    // Vulnerable to reentrancy
    (bool ok, ) = msg.sender.call{value: amount}('');
    require(ok);
    balances[msg.sender] -= amount;
  }
}"
                className="mt-2 h-64 w-full rounded-lg border border-border bg-slate-100 p-4 font-mono text-sm dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={handleScanContract}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-6 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Scan Contract
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold">Vulnerability Report</p>
              <div className="mt-2 space-y-3 max-h-80 overflow-y-auto rounded-lg border border-border bg-background p-4">
                {scanResults.length > 0 ? (
                  scanResults.map((result, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border px-4 py-3 text-sm ${
                        result.severity === "Critical"
                          ? "border-red-500/40 bg-red-500/10"
                          : result.severity === "High"
                            ? "border-orange-500/40 bg-orange-500/10"
                            : "border-yellow-500/40 bg-yellow-500/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{result.type}</p>
                        <span
                          className={`rounded px-2 py-1 text-xs font-bold ${
                            result.severity === "Critical"
                              ? "bg-red-500/20 text-red-700 dark:text-red-300"
                              : result.severity === "High"
                                ? "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                                : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                          }`}
                        >
                          {result.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Line {result.line}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{result.description}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Scan results will appear here...</p>
                )}
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* Code Example Section */}
      <section className="mt-8">
        <Panel
          title="Real Solidity Vulnerability Example: Reentrancy Attack"
          description="See how VulnGuard detects a classic reentrancy vulnerability and suggests the fix."
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>
                <p className="text-sm font-semibold">VulnerableBank.sol</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full border border-border bg-card p-1 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setCodeView("vulnerable")}
                    className={`rounded-full px-2.5 py-1 transition-colors ${
                      codeView === "vulnerable" ? "bg-red-500/20 text-red-700 dark:text-red-300" : "text-muted-foreground"
                    }`}
                  >
                    Vulnerable
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeView("fixed")}
                    className={`rounded-full px-2.5 py-1 transition-colors ${
                      codeView === "fixed" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
                    }`}
                  >
                    Fixed
                  </button>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    codeView === "vulnerable"
                      ? "border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {codeView === "vulnerable" ? "High Severity: Reentrancy" : "Patched: CEI Applied"}
                </span>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[2fr_1fr]">
              <div className="overflow-x-auto border-r border-border bg-slate-100 dark:bg-slate-950">
                <div className="min-w-[700px] p-4 font-mono text-[12px] leading-6 sm:text-[13px]">
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">1</span>
                    <span><span className="text-fuchsia-700 dark:text-fuchsia-300">pragma</span> <span className="text-sky-700 dark:text-sky-300">solidity</span> <span className="text-amber-700 dark:text-amber-300">^0.8.20</span>;</span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">2</span>
                    <span> </span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">3</span>
                    <span><span className="text-fuchsia-700 dark:text-fuchsia-300">contract</span> <span className="text-cyan-700 dark:text-cyan-300">VulnerableBank</span> {'{'}</span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">4</span>
                    <span>  <span className="text-fuchsia-700 dark:text-fuchsia-300">mapping</span>(<span className="text-sky-700 dark:text-sky-300">address</span> =&gt; <span className="text-sky-700 dark:text-sky-300">uint256</span>) <span className="text-fuchsia-700 dark:text-fuchsia-300">public</span> balances;</span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">5</span>
                    <span> </span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">6</span>
                    <span>  <span className="text-fuchsia-700 dark:text-fuchsia-300">function</span> <span className="text-cyan-700 dark:text-cyan-300">withdraw</span>() <span className="text-fuchsia-700 dark:text-fuchsia-300">external</span> {'{'}</span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">7</span>
                    <span>    <span className="text-sky-700 dark:text-sky-300">uint256</span> amount = balances[msg.sender];</span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">8</span>
                    <span>    <span className="text-cyan-700 dark:text-cyan-300">require</span>(amount &gt; <span className="text-amber-700 dark:text-amber-300">0</span>, <span className="text-emerald-700 dark:text-emerald-300">&quot;No funds&quot;</span>);</span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">9</span>
                    <span> </span>
                  </div>
                  {codeView === "vulnerable" ? (
                    <>
                      <div className="grid grid-cols-[34px_1fr] rounded-md bg-red-500/12 text-slate-600 dark:text-slate-300">
                        <span className="select-none text-right pr-3 text-red-600 dark:text-red-300">10</span>
                        <span><span className="text-red-700 dark:text-red-300">// VULNERABILITY: External call before state update</span></span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] rounded-md bg-red-500/12 text-slate-600 dark:text-slate-300">
                        <span className="select-none text-right pr-3 text-red-600 dark:text-red-300">11</span>
                        <span>    (<span className="text-fuchsia-700 dark:text-fuchsia-300">bool</span> ok,) = msg.sender.call{'{'} <span className="text-fuchsia-700 dark:text-fuchsia-300">value</span>: amount {'}'}(<span className="text-emerald-700 dark:text-emerald-300">&quot;&quot;</span>);</span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                        <span className="select-none text-right pr-3">12</span>
                        <span>    <span className="text-cyan-700 dark:text-cyan-300">require</span>(ok, <span className="text-emerald-700 dark:text-emerald-300">&quot;Transfer failed&quot;</span>);</span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                        <span className="select-none text-right pr-3">13</span>
                        <span> </span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                        <span className="select-none text-right pr-3">14</span>
                        <span>    balances[msg.sender] = <span className="text-amber-700 dark:text-amber-300">0</span>;</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-[34px_1fr] rounded-md bg-emerald-500/12 text-slate-600 dark:text-slate-300">
                        <span className="select-none text-right pr-3 text-emerald-700 dark:text-emerald-300">10</span>
                        <span><span className="text-emerald-700 dark:text-emerald-300">// FIXED: Update state first (checks-effects-interactions)</span></span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] rounded-md bg-emerald-500/12 text-slate-600 dark:text-slate-300">
                        <span className="select-none text-right pr-3 text-emerald-700 dark:text-emerald-300">11</span>
                        <span>    balances[msg.sender] = <span className="text-amber-700 dark:text-amber-300">0</span>;</span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] rounded-md bg-emerald-500/12 text-slate-600 dark:text-slate-300">
                        <span className="select-none text-right pr-3 text-emerald-700 dark:text-emerald-300">12</span>
                        <span>    (<span className="text-fuchsia-700 dark:text-fuchsia-300">bool</span> ok,) = msg.sender.call{'{'} <span className="text-fuchsia-700 dark:text-fuchsia-300">value</span>: amount {'}'}(<span className="text-emerald-700 dark:text-emerald-300">&quot;&quot;</span>);</span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                        <span className="select-none text-right pr-3">13</span>
                        <span>    <span className="text-cyan-700 dark:text-cyan-300">require</span>(ok, <span className="text-emerald-700 dark:text-emerald-300">&quot;Transfer failed&quot;</span>);</span>
                      </div>
                      <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                        <span className="select-none text-right pr-3">14</span>
                        <span> </span>
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">15</span>
                    <span>  {'}'}</span>
                  </div>
                  <div className="grid grid-cols-[34px_1fr] text-slate-500 dark:text-slate-400">
                    <span className="select-none text-right pr-3">16</span>
                    <span>{'}'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {codeView === "vulnerable" ? (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
                    <p className="font-semibold text-red-700 dark:text-red-300">Vulnerability Details</p>
                    <p className="mt-1 text-red-700/90 dark:text-red-200/90">External interaction happens before internal state update, enabling recursive drain attacks.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">Fixed Implementation</p>
                    <p className="mt-1 text-emerald-700/90 dark:text-emerald-200/90">State is updated before the external call, preventing reentrancy recursion paths.</p>
                  </div>
                )}
                <div className="rounded-xl border border-border bg-background p-3 text-sm">
                  <p className="font-semibold">How VulnGuard Helps</p>
                  <p className="mt-1 text-muted-foreground">
                    Our smart contract vulnerability scanner automatically detects this pattern and suggests the CEI (Checks-Effects-Interactions) fix.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* Features Section */}
      <section className="mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">VulnGuard AI Features for Smart Contract Security</h2>
          <p className="mt-2 text-base text-muted-foreground">Comprehensive tools to detect, understand, and fix smart contract vulnerabilities.</p>
        </div>
        <FeatureGrid
          features={[
            {
              title: "AI-Powered Vulnerability Detection",
              description: "Detects 36+ vulnerability types including reentrancy, integer overflow, access control issues, and front-running attacks.",
              icon: <Bot className="h-5 w-5" />,
            },
            {
              title: "Real-Time Code Scanning",
              description: "Scan smart contracts in seconds with instant feedback on security issues and severity ratings.",
              icon: <Zap className="h-5 w-5" />,
            },
            {
              title: "Before & After Code Fixes",
              description: "Get specific fix suggestions with code examples showing vulnerable and patched versions side-by-side.",
              icon: <FileCode2 className="h-5 w-5" />,
            },
            {
              title: "Audit Report Generation",
              description: "Export professional PDF reports with executive summary, detailed findings, and remediation guidance.",
              icon: <TrendingUp className="h-5 w-5" />,
            },
            {
              title: "GitHub Integration",
              description: "Integrate scanning into your CI/CD pipeline to catch vulnerabilities before they reach production.",
              icon: <Workflow className="h-5 w-5" />,
            },
            {
              title: "Team Collaboration",
              description: "Share scans, assign issues, track remediation progress, and manage security across teams.",
              icon: <Building2 className="h-5 w-5" />,
            },
          ]}
        />
      </section>

      {/* Use Cases Section */}
      <section className="mt-8">
        <Panel
          title="Who Uses VulnGuard AI Smart Contract Scanner"
          description="The best smart contract vulnerability scanner for every Web3 team."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                audience: "👨‍💻 Smart Contract Developers",
                use: "Catch vulnerabilities during development before peer review or deployment.",
                benefit: "Faster iteration, fewer security reworks, faster time to launch.",
              },
              {
                audience: "🚀 Web3 Startups",
                use: "Scan contracts pre-launch without waiting weeks for external auditors.",
                benefit: "Ship faster, reduce audit costs, gain investor confidence through early testing.",
              },
              {
                audience: "🔍 Security Auditors & Firms",
                use: "Use VulnGuard to speed up triage, find issues faster, document findings.",
                benefit: "Increase audit throughput, focus on complex business logic, export professional reports.",
              },
              {
                audience: "🏛️ Enterprise & Protocols",
                use: "Integrate into CI/CD for continuous security monitoring of multiple contracts.",
                benefit: "Consistent security standards, team governance, audit trail of all scans.",
              },
              {
                audience: "📚 Security Researchers",
                use: "Analyze smart contract codebases for vulnerability patterns and examples.",
                benefit: "Identify exploit patterns, benchmark scanning tools, contribute to Web3 security.",
              },
              {
                audience: "🎓 Students & Learners",
                use: "Learn Solidity security by understanding real vulnerability examples and fixes.",
                benefit: "Build secure coding habits early, understand SWC registry, level up security skills.",
              },
            ].map((item) => (
              <motion.div
                key={item.audience}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-base font-bold">{item.audience}</h3>
                <p className="mt-2 text-sm text-muted-foreground"><span className="font-semibold">Use:</span> {item.use}</p>
                <p className="mt-2 text-sm text-muted-foreground"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Benefit:</span> {item.benefit}</p>
              </motion.div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Comparison Section */}
      <section className="mt-8">
        <Panel
          title="VulnGuard AI vs Other Smart Contract Vulnerability Scanners"
          description="How the best smart contract vulnerability scanner compares to the competition."
        >
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-card text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  <th className="px-4 py-3 font-semibold">VulnGuard AI</th>
                  <th className="px-4 py-3 font-semibold">SolidityScan</th>
                  <th className="px-4 py-3 font-semibold">MetaTrust</th>
                  <th className="px-4 py-3 font-semibold">Open-Source Tools</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Speed (contract scan)", "< 60 seconds", "2-5 minutes", "1-10 minutes", "Varies (10s-hours)"],
                  ["AI-Powered Fixes", "✓ Yes, automatic", "✗ Limited", "✗ No", "✗ No"],
                  ["Vulnerability Types", "36+ SWC", "~20 patterns", "~15 patterns", "Varies by tool"],
                  ["PDF Audit Reports", "✓ Built-in", "✓ Yes", "✓ Yes", "✗ Manual"],
                  ["GitHub Integration", "✓ Native CI/CD", "✓ Yes", "✓ Enterprise", "✗ Custom setup"],
                  ["Team Features", "✓ Collaboration & governance", "Limited", "✓ Enterprise-heavy", "✗ DIY"],
                  ["Pricing", "Freemium + SaaS tiers", "Higher, limited free", "Premium/Enterprise", "Free but high ops"],
                  ["Learning Resources", "✓ Integrated explanations", "Documentation", "Minimal", "Community-based"],
                ].map((row, i) => (
                  <motion.tr
                    key={row[0]}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3 font-medium">{row[0]}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{row[1]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[3]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[4]}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      {/* Trust Elements / Testimonials */}
      <section className="mt-8">
        <Panel
          title="Trusted by the Web3 Developer Community"
          description="Built by developers, for developers. Trusted by teams shipping secure smart contracts."
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { stat: "2M+", label: "Vulnerabilities Identified" },
              { stat: "< 60s", label: "Average Scan Time" },
              { stat: "36+", label: "Vulnerability Types" },
              { stat: "99.95%", label: "Enterprise Uptime" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{item.stat}</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Final CTA Section */}
      <section className="mt-12 rounded-3xl border border-border bg-gradient-to-br from-primary/15 to-primary/5 p-8 text-center lg:p-16">
        <h2 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
          Smart Contract Security. Simplified.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
          Stop shipping vulnerable smart contracts. VulnGuard AI detects 36+ vulnerability types, provides AI-powered fixes, and generates professional audit reports—all in seconds.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-8 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Scanning Free
          </a>
          <a
            href="/blog/smart-contract-security"
            className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 font-semibold transition-colors hover:border-foreground"
          >
            Read Smart Contract Security Guide
          </a>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          No credit card required. Start scanning immediately. Learn more in our{" "}
          <a href="/blog/top-vulnerabilities" className="underline hover:no-underline">
            guide to top vulnerabilities
          </a>
          .
        </p>
      </section>

      {/* Footer Links - Internal SEO Links */}
      <section className="mt-12 border-t border-border pt-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-foreground">Learn</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="/blog/smart-contract-security" className="text-muted-foreground hover:text-foreground">
                  Smart Contract Security Best Practices
                </a>
              </li>
              <li>
                <a href="/blog/top-vulnerabilities" className="text-muted-foreground hover:text-foreground">
                  Top Smart Contract Vulnerabilities
                </a>
              </li>
              <li>
                <a href="/help-center" className="text-muted-foreground hover:text-foreground">
                  Help Center & Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="/product" className="text-muted-foreground hover:text-foreground">
                  Platform Features
                </a>
              </li>
              <li>
                <a href="/api-docs" className="text-muted-foreground hover:text-foreground">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/support" className="text-muted-foreground hover:text-foreground">
                  Customer Support
                </a>
              </li>
              <li>
                <a href="/legal" className="text-muted-foreground hover:text-foreground">
                  Legal & Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}