import { useCallback, useRef, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, UploadCloud, FileCode,
  Play, Trash2, Download, ExternalLink, Layers,
  AlertTriangle, KeyboardIcon, ChevronRight, RefreshCw,
  Cpu, CheckCircle2, Clock, BarChart3, Copy, Check,
  Code2, ScanLine, ListChecks, Github, Zap, Terminal,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useStreamScanner } from "@/hooks/use-stream-scanner";
import { EXAMPLE_CONTRACTS } from "@/lib/constants";
import { formatBytes, cn } from "@/lib/utils";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { SeverityChart } from "@/components/SeverityChart";

const MAX_BYTES = 50 * 1024;

const EXAMPLE_META: Record<string, { label: string; color: string; badge: string; desc: string }> = {
  VulnerableBank: {
    label: "VulnerableBank",
    color: "text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/18",
    badge: "VULN",
    desc: "Reentrancy · Access control · Logic error",
  },
  InsecureToken: {
    label: "InsecureToken",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/18",
    badge: "VULN",
    desc: "No auth · Integer overflow · Mint exploit",
  },
  SafeContract: {
    label: "SafeBank",
    color: "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/18",
    badge: "SAFE",
    desc: "ReentrancyGuard · Ownable · CEI pattern",
  },
};

const SEV_COLORS: Record<string, string> = {
  CRITICAL: "text-[#ff4444]",
  HIGH:     "text-[#ff8c00]",
  MEDIUM:   "text-[#ffd700]",
  LOW:      "text-[#3b82f6]",
};

// ── Scan steps ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "input",    label: "Input",    icon: Code2      },
  { id: "scan",     label: "Scanning", icon: ScanLine   },
  { id: "analyze",  label: "Analyzing",icon: Cpu        },
  { id: "results",  label: "Results",  icon: ListChecks },
];

type StepId = "input" | "scan" | "analyze" | "results";

// ── Mini copy button ──────────────────────────────────────────────────────────
function MiniCopy({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title={`Copy ${label ?? ""}`}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 hover:bg-white/12 border border-white/8 transition-colors"
    >
      {done
        ? <Check className="w-2.5 h-2.5 text-green-400" />
        : <Copy className="w-2.5 h-2.5 text-muted-foreground" />
      }
      {done ? "Copied" : (label ?? "Copy")}
    </button>
  );
}

// ── Progress stepper ──────────────────────────────────────────────────────────
function ScanStepper({ activeStep }: { activeStep: StepId }) {
  const activeIdx = STEPS.findIndex((s) => s.id === activeStep);

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isComplete = i < activeIdx;
        const isActive   = i === activeIdx;
        const isPending  = i > activeIdx;

        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isComplete
                    ? "hsl(142 71% 45% / 0.2)"
                    : isActive
                    ? "hsl(217 91% 60% / 0.15)"
                    : "transparent",
                  borderColor: isComplete
                    ? "hsl(142 71% 45%)"
                    : isActive
                    ? "hsl(217 91% 60%)"
                    : "rgba(255,255,255,0.12)",
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center relative",
                  isActive && "ring-2 ring-primary/20 ring-offset-1 ring-offset-background"
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isComplete ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      key="active"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Icon className="w-3.5 h-3.5 text-primary animate-pulse" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground/30" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider whitespace-nowrap",
                isComplete ? "text-green-400/70"
                  : isActive ? "text-primary"
                  : "text-muted-foreground/30"
              )}>
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1.5 relative overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={false}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 bg-green-400/60"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Scanning animation ────────────────────────────────────────────────────────
function ScanningSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
      {/* Animated shield */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border border-transparent border-t-accent/60"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        {/* Scan line sweep */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ clipPath: "circle(50%)" }}
        >
          <motion.div
            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Auditing smart contract…</p>
        <p className="text-xs text-muted-foreground max-w-[260px]">
          Claude is analyzing 15+ vulnerability categories
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
        <Clock className="w-3.5 h-3.5" />
        Typically 15–45 seconds
      </div>
    </div>
  );
}

// ── Idle feature grid ─────────────────────────────────────────────────────────
function IdleState() {
  const features = [
    { icon: "🔄", label: "Reentrancy" },
    { icon: "🔢", label: "Overflows" },
    { icon: "🚪", label: "Access Control" },
    { icon: "⚡", label: "Flash Loans" },
    { icon: "🎲", label: "Randomness" },
    { icon: "💣", label: "DoS Vectors" },
  ];

  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10 relative overflow-hidden"
    >
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid pointer-events-none rounded-2xl" />

      {/* Floating shield icon */}
      <motion.div
        className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <FileCode className="w-10 h-10 text-primary opacity-80" />
        <motion.div
          className="absolute -inset-1 rounded-2xl border border-primary/15"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      <h2 className="text-2xl font-display font-bold mb-2">Ready for Analysis</h2>
      <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm mb-8">
        Paste Solidity code or drag a{" "}
        <code className="text-primary font-mono text-xs">.sol</code> file, then click{" "}
        <span className="text-primary font-semibold">Scan Contract</span>
      </p>

      {/* Feature grid */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
        {features.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/6 hover:border-white/12 transition-colors cursor-default"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA hint */}
      <motion.p
        className="mt-6 text-[10px] text-muted-foreground/40 flex items-center gap-1.5"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <KeyboardIcon className="w-3 h-3" />
        Press <kbd className="font-mono px-1 py-0.5 bg-white/8 rounded text-[9px]">Ctrl</kbd>+<kbd className="font-mono px-1 py-0.5 bg-white/8 rounded text-[9px]">Enter</kbd> to scan
      </motion.p>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Home
// ════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileTab, setMobileTab] = useState<"editor" | "results">("editor");

  const {
    code, setCode,
    contractName, setContractName,
    phase, stage,
    partialVulns,
    foundCount,
    riskScore,
    result,
    isScanning,
    isGeneratingFix,
    handleScan,
    handleDownloadReport,
    handleGenerateFix,
  } = useStreamScanner();

  // When scan starts, switch to results tab on mobile
  useEffect(() => {
    if (phase === "streaming") setMobileTab("results");
  }, [phase]);

  // Ctrl+Enter to scan
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isScanning && code.trim()) {
        handleScan();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleScan, isScanning, code]);

  // Drag and drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > MAX_BYTES) { alert("File too large. Max 50 KB."); return; }
      setContractName(file.name.replace(/\.sol$/i, ""));
      const reader = new FileReader();
      reader.onload = (e) => setCode(e.target?.result as string);
      reader.readAsText(file);
    },
    [setCode, setContractName]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".sol"] },
    noClick: true,
    noKeyboard: true,
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onDrop([file]);
    e.target.value = "";
  };

  // Derived
  const byteSize    = new Blob([code]).size;
  const bytePercent = Math.min((byteSize / MAX_BYTES) * 100, 100);
  const lineCount   = code ? code.split("\n").length : 0;
  const isSizeWarning = bytePercent > 80;
  const isSizeError   = bytePercent >= 100;
  const isShowingResults = phase === "streaming" || phase === "done" || phase === "error";

  const sevCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const v of partialVulns) {
    if (v.severity in sevCounts) sevCounts[v.severity as keyof typeof sevCounts]++;
  }

  // Compute active step for breadcrumb
  const activeStep: StepId =
    phase === "idle" ? "input"
    : phase === "streaming" && partialVulns.length === 0 ? "scan"
    : phase === "streaming" ? "analyze"
    : phase === "done" || phase === "error" ? "results"
    : "input";

  const riskColor =
    (riskScore ?? 0) >= 70 ? "text-[#ff4444]"
    : (riskScore ?? 0) >= 40 ? "text-[#ff8c00]"
    : (riskScore ?? 0) >= 10 ? "text-[#ffd700]"
    : "text-green-400";

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/4 rounded-full blur-3xl" />
        <div className="cyber-grid absolute inset-0 opacity-50" />
      </div>

      {/* ── Header ── */}
      <header className="border-b border-white/6 bg-card/40 backdrop-blur-2xl sticky top-0 z-50 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent p-[1.5px] shrink-0">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base leading-tight glow-text">VulnGuard AI</span>
              <span className="text-[10px] text-muted-foreground/60 hidden sm:block leading-tight">
                Smart Contract Security Scanner
              </span>
            </div>
          </div>

          {/* Progress stepper — hidden on mobile */}
          {phase !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex flex-1 max-w-sm mx-auto"
            >
              <ScanStepper activeStep={activeStep} />
            </motion.div>
          )}

          {/* Right nav */}
          <div className="flex items-center gap-2 shrink-0">
            {result && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleDownloadReport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </motion.button>
            )}
            <a
              href="https://github.com/IamHammadDevX/VulnGaurd-AI"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-muted-foreground hover:text-white text-xs font-medium transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Mobile progress stepper strip */}
        {phase !== "idle" && (
          <div className="md:hidden px-4 pb-2.5">
            <ScanStepper activeStep={activeStep} />
          </div>
        )}
      </header>

      {/* ── Mobile Tab Bar ── */}
      <div className="lg:hidden sticky top-14 z-40 bg-background/90 backdrop-blur-xl border-b border-white/6">
        <div className="flex">
          {(["editor", "results"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all relative",
                mobileTab === tab ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              {tab === "editor"
                ? <><Terminal className="w-4 h-4" />Editor</>
                : <><ListChecks className="w-4 h-4" />Results
                    {foundCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                        {foundCount}
                      </span>
                    )}
                  </>
              }
              {mobileTab === tab && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 md:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10 pb-4">

        {/* ── LEFT PANEL — Editor ── */}
        <div className={cn(
          "flex flex-col gap-3 lg:h-[calc(100vh-5.5rem)]",
          "lg:block",
          mobileTab !== "editor" && "hidden lg:flex"
        )}>
          <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden">

            {/* Toolbar */}
            <div className="p-3 md:p-4 border-b border-white/5 bg-black/15 flex flex-col gap-3 shrink-0">

              {/* Row: name + upload */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 focus-within:border-primary/40 transition-colors min-w-0">
                  <FileCode className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Contract name (optional)"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-semibold placeholder:text-muted-foreground/50 w-full min-w-0"
                  />
                  {contractName && (
                    <span className="text-[10px] text-muted-foreground/50 font-mono shrink-0">.sol</span>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".sol" className="hidden" onChange={handleFileInputChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="touch-target flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-sm font-medium shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Upload .sol</span>
                </button>
              </div>

              {/* Example contracts — horizontally scrollable on mobile */}
              <div>
                <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest mb-2">
                  Load Example
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-custom snap-x">
                  {Object.entries(EXAMPLE_CONTRACTS).map(([key, contract]) => {
                    const meta = EXAMPLE_META[key];
                    return (
                      <button
                        key={key}
                        onClick={() => { setContractName(contract.name); setCode(contract.code); }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all shrink-0 snap-start",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          meta?.color ?? "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{meta?.label ?? contract.name}</span>
                            {meta?.badge && (
                              <span className={cn(
                                "text-[9px] font-black px-1 rounded-sm leading-tight",
                                meta.badge === "VULN" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                              )}>
                                {meta.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-60 whitespace-nowrap">{meta?.desc}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monaco editor */}
            <div
              {...getRootProps()}
              className={cn(
                "flex-1 relative min-h-[220px] transition-colors duration-300",
                isDragActive ? "bg-primary/5" : "bg-[#060b12]"
              )}
            >
              <AnimatePresence>
                {isDragActive && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-none pointer-events-none"
                  >
                    <UploadCloud className="w-12 h-12 text-primary mb-3 animate-bounce" />
                    <p className="text-base font-bold text-white">Drop your .sol file</p>
                    <p className="text-sm text-primary/60 mt-1">Max 50 KB</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <Editor
                height="100%"
                language="sol"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Chakra Petch', 'Fira Code', monospace",
                  lineHeight: 22,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  wordWrap: "on",
                  folding: true,
                  lineNumbers: "on",
                  renderLineHighlight: "gutter",
                  scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
                  overviewRulerBorder: false,
                }}
              />
            </div>

            {/* Editor footer */}
            <div className="p-3 border-t border-white/5 bg-black/25 shrink-0 flex flex-col gap-2">
              {/* Size bar */}
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", isSizeError ? "bg-red-500" : isSizeWarning ? "bg-yellow-500" : "bg-primary")}
                    animate={{ width: `${bytePercent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <div className={cn("text-[11px] font-mono shrink-0", isSizeError ? "text-red-400" : isSizeWarning ? "text-yellow-400" : "text-muted-foreground/60")}>
                  {isSizeError && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {formatBytes(byteSize)} / 50 KB
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/40 shrink-0">
                  {lineCount.toLocaleString()}L
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/30">
                  <KeyboardIcon className="w-3 h-3" />
                  <kbd className="font-mono">Ctrl+Enter</kbd> to scan
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => { setCode(""); setContractName(""); }}
                    disabled={!code && !contractName}
                    className="touch-target flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400/60 hover:text-red-300 transition-colors text-sm font-bold disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Clear</span>
                  </button>
                  <button
                    onClick={handleScan}
                    disabled={isScanning || !code.trim() || isSizeError}
                    className={cn(
                      "touch-target flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
                      !isScanning && code.trim() && !isSizeError && "glow-border-pulse"
                    )}
                  >
                    {isScanning
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Scanning…</span></>
                      : <><Zap className="w-4 h-4" /><span>Scan Contract</span></>
                    }
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL — Results ── */}
        <div className={cn(
          "flex flex-col gap-3 lg:h-[calc(100vh-5.5rem)]",
          mobileTab !== "results" && "hidden lg:flex"
        )}>
          <AnimatePresence mode="wait">

            {/* ── IDLE ── */}
            {phase === "idle" && <IdleState key="idle" />}

            {/* ── SCANNING / DONE / ERROR ── */}
            {isShowingResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden"
              >

                {/* ── Status bar ── */}
                <div className="glass-panel px-4 py-3 rounded-2xl shrink-0 flex flex-wrap items-center gap-3">
                  {/* Phase pill */}
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0",
                    phase === "streaming" ? "bg-primary/10 border-primary/25 text-primary"
                      : phase === "done" ? "bg-green-500/10 border-green-500/25 text-green-400"
                      : "bg-red-500/10 border-red-500/25 text-red-400"
                  )}>
                    {phase === "streaming" && <RefreshCw className="w-3 h-3 animate-spin" />}
                    {phase === "done" && <CheckCircle2 className="w-3 h-3" />}
                    {phase === "error" && <AlertTriangle className="w-3 h-3" />}
                    {phase === "streaming" ? "Analyzing" : phase === "done" ? "Complete" : "Error"}
                  </div>

                  {/* Stage message */}
                  <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={stage}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-muted-foreground truncate"
                      >
                        {stage}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Live counter + risk */}
                  {(phase === "streaming" || phase === "done") && (
                    <div className="flex items-center gap-3 shrink-0">
                      <motion.div
                        key={foundCount}
                        initial={{ scale: 1.25 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-mono font-bold text-muted-foreground"
                      >
                        <span className="text-white text-base">{foundCount}</span> found
                      </motion.div>
                      {riskScore !== null && (
                        <div className={cn("flex items-center gap-1 text-sm font-bold", riskColor)}>
                          <BarChart3 className="w-3.5 h-3.5" />
                          {riskScore}/100
                        </div>
                      )}
                    </div>
                  )}

                  {/* Indeterminate progress */}
                  {phase === "streaming" && (
                    <div className="w-full h-0.5 progress-bar-indeterminate" />
                  )}
                </div>

                {/* ── Summary card (appears once meta arrives) ── */}
                {(result || (riskScore !== null && partialVulns.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-4 rounded-2xl shrink-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Risk score */}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          foundCount > 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                        )}>
                          {foundCount > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Risk Score</div>
                          <div className={cn("text-2xl font-display font-bold", riskColor)}>
                            {riskScore ?? "…"}<span className="text-sm text-muted-foreground font-normal">/100</span>
                          </div>
                        </div>
                      </div>

                      {/* Severity counts */}
                      <div className="flex gap-2">
                        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
                          <motion.div
                            key={sev}
                            animate={{ scale: sevCounts[sev] > 0 ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center p-2 rounded-lg bg-white/5 min-w-[44px]"
                          >
                            <span className={cn("font-bold text-lg leading-none", SEV_COLORS[sev])}>
                              {sevCounts[sev]}
                            </span>
                            <span className="text-[8px] text-muted-foreground uppercase mt-1 tracking-wider">
                              {sev.slice(0, 4)}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-auto">
                        {result?.scanId && (
                          <MiniCopy text={result.scanId} label="ID" />
                        )}
                        {result && (
                          <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF Report</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Scrollable results ── */}
                <div className="flex-1 overflow-y-auto scrollbar-custom min-h-0 rounded-2xl glass-panel">
                  <div className="p-4 flex flex-col gap-5">

                    {/* Summary */}
                    {result?.summary && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-4 rounded-xl bg-primary/5 border border-primary/15"
                      >
                        <div className="flex items-start gap-3">
                          <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed text-slate-300">{result.summary}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Vulnerabilities */}
                    {partialVulns.length > 0 && (
                      <div>
                        {/* Distribution chart */}
                        {phase === "done" && result && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="glass-panel rounded-xl p-4 mb-4"
                          >
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                              Severity Distribution
                            </h3>
                            <SeverityChart vulnerabilities={partialVulns} />
                          </motion.div>
                        )}

                        {/* Header row */}
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-base font-display font-bold">
                            {phase === "streaming" ? "Discovering Issues" : "Detected Issues"}
                          </h3>
                          <motion.span
                            key={partialVulns.length}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="bg-white/10 px-2 py-0.5 rounded-md text-sm font-bold"
                          >
                            {partialVulns.length}
                          </motion.span>
                          {phase === "streaming" && (
                            <div className="flex gap-0.5 items-center ml-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-1.5 h-1.5 rounded-full bg-primary"
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Cards */}
                        <div className="space-y-3">
                          <AnimatePresence initial={false}>
                            {partialVulns.map((vuln, i) => (
                              <motion.div
                                key={vuln.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                              >
                                <VulnerabilityCard
                                  vulnerability={vuln}
                                  onGenerateFix={handleGenerateFix}
                                  isGeneratingFix={isGeneratingFix}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Scanning spinner (no vulns yet) */}
                    {phase === "streaming" && partialVulns.length === 0 && <ScanningSpinner />}

                    {/* Clean contract result */}
                    {phase === "done" && partialVulns.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center gap-4"
                      >
                        <motion.div
                          className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ShieldCheck className="w-10 h-10 text-green-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-display font-bold text-green-400 mb-1">Contract Looks Clean!</h3>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            No automated vulnerabilities detected. Always recommend a manual review before mainnet.
                          </p>
                        </div>
                        {result && (
                          <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-bold transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download Clean Report PDF
                          </button>
                        )}
                      </motion.div>
                    )}

                    {/* Error state */}
                    {phase === "error" && (
                      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                        <p className="text-sm text-red-300 max-w-xs">Scan failed. Please try again.</p>
                        <button
                          onClick={handleScan}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Retry Scan
                        </button>
                      </div>
                    )}

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* ── Mobile floating scan button (on editor tab only) ── */}
      <AnimatePresence>
        {mobileTab === "editor" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="lg:hidden fixed bottom-0 inset-x-0 z-50 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none"
          >
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                onClick={() => { setCode(""); setContractName(""); }}
                disabled={!code && !contractName}
                className="p-3 rounded-xl bg-card/80 border border-white/10 text-red-400/70 hover:text-red-300 disabled:opacity-25 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleScan}
                disabled={isScanning || !code.trim() || isSizeError}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/30",
                  !isScanning && code.trim() && !isSizeError && "glow-border"
                )}
              >
                {isScanning
                  ? <><RefreshCw className="w-5 h-5 animate-spin" />Scanning…</>
                  : <><Zap className="w-5 h-5" />Scan Contract</>
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
