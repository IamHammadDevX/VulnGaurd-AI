import { useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, UploadCloud, FileCode,
  Play, Trash2, Download, ExternalLink, Layers,
  AlertTriangle, KeyboardIcon, ChevronRight, RefreshCw,
  Cpu, CheckCircle2, Clock, BarChart3
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
    color: "text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20",
    badge: "VULN",
    desc: "Reentrancy · Access control · Logic error",
  },
  InsecureToken: {
    label: "InsecureToken",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20",
    badge: "VULN",
    desc: "No auth · Integer overflow · Mint exploit",
  },
  SafeContract: {
    label: "SafeBank",
    color: "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20",
    badge: "SAFE",
    desc: "ReentrancyGuard · Ownable · Checks-effects",
  },
};

const SEV_COLORS: Record<string, string> = {
  CRITICAL: "text-[#ff4444]",
  HIGH: "text-[#ff8c00]",
  MEDIUM: "text-[#ffd700]",
  LOW: "text-[#3b82f6]",
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > MAX_BYTES) {
        alert("File too large. Max size is 50 KB.");
        return;
      }
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

  const byteSize = new Blob([code]).size;
  const bytePercent = Math.min((byteSize / MAX_BYTES) * 100, 100);
  const lineCount = code ? code.split("\n").length : 0;
  const isSizeWarning = bytePercent > 80;
  const isSizeError = bytePercent >= 100;

  // Severity counts from partial (streaming) vulns
  const sevCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const v of partialVulns) {
    if (v.severity in sevCounts) sevCounts[v.severity as keyof typeof sevCounts]++;
  }

  const isShowingResults = phase === "streaming" || phase === "done" || phase === "error";

  return (
    <div className="min-h-screen flex flex-col relative pb-20">
      {/* Background */}
      <div
        className="fixed inset-0 z-[-1] opacity-30 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/cyber-bg.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* ── Header ── */}
      <header className="border-b border-white/5 glass-panel sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-[1px]">
              <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-wide glow-text">VulnGuard AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                AI-Powered Smart Contract Security Scanner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/IamHammadDevX/VulnGaurd-AI"
              target="_blank" rel="noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">

        {/* ── LEFT PANEL — Editor ── */}
        <div className="flex flex-col gap-4 lg:h-[calc(100vh-8rem)] min-h-[520px]">
          <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden border-white/10">

            {/* ── TOP TOOLBAR ── */}
            <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col gap-3">
              {/* Row 1: name + upload */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8 focus-within:border-primary/40 transition-colors">
                  <FileCode className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Contract name (optional)"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-semibold placeholder:text-muted-foreground/60 w-full"
                  />
                  {contractName && (
                    <span className="text-xs text-muted-foreground/60 font-mono shrink-0">.sol</span>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".sol" className="hidden" onChange={handleFileInputChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-sm font-medium shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload .sol</span>
                </button>
              </div>

              {/* Row 2: examples */}
              <div>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mb-2">Example Contracts</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  {Object.entries(EXAMPLE_CONTRACTS).map(([key, contract]) => {
                    const meta = EXAMPLE_META[key];
                    return (
                      <button
                        key={key}
                        onClick={() => { setContractName(contract.name); setCode(contract.code); }}
                        className={cn(
                          "flex-1 flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all",
                          meta?.color ?? "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold truncate">{meta?.label ?? contract.name}</span>
                            {meta?.badge && (
                              <span className={cn("text-[9px] font-black px-1 rounded leading-tight", meta.badge === "VULN" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400")}>
                                {meta.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-70 truncate">{meta?.desc}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 opacity-50" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── MONACO EDITOR ── */}
            <div
              {...getRootProps()}
              className={cn("flex-1 relative transition-colors duration-300 min-h-[200px]", isDragActive ? "bg-primary/5" : "bg-[#080d14]")}
            >
              <AnimatePresence>
                {isDragActive && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary pointer-events-none"
                  >
                    <UploadCloud className="w-14 h-14 text-primary mb-3 animate-bounce" />
                    <p className="text-lg font-bold text-white">Drop your .sol file here</p>
                    <p className="text-sm text-primary/70 mt-1">Max 50 KB</p>
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
                  padding: { top: 20, bottom: 20 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  wordWrap: "on",
                  folding: true,
                  lineNumbers: "on",
                  renderLineHighlight: "gutter",
                  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                }}
              />
            </div>

            {/* ── FOOTER ── */}
            <div className="p-3 border-t border-white/5 bg-black/30 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full transition-colors", isSizeError ? "bg-red-500" : isSizeWarning ? "bg-yellow-500" : "bg-primary")}
                    animate={{ width: `${bytePercent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <div className={cn("text-[11px] font-mono shrink-0", isSizeError ? "text-red-400" : isSizeWarning ? "text-yellow-400" : "text-muted-foreground")}>
                  {isSizeError && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {formatBytes(byteSize)} / 50 KB
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/60 shrink-0">
                  {lineCount.toLocaleString()} lines
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                  <KeyboardIcon className="w-3 h-3" />
                  <span className="hidden sm:inline"><kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to scan</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setCode(""); setContractName(""); }}
                    disabled={!code && !contractName}
                    className="px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400/70 hover:text-red-300 transition-colors flex items-center gap-1.5 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                  <button
                    onClick={handleScan}
                    disabled={isScanning || !code.trim() || isSizeError}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed glow-border relative overflow-hidden"
                  >
                    {isScanning
                      ? <><RefreshCw className="w-4 h-4 animate-spin" />Scanning...</>
                      : <><Play className="w-4 h-4 fill-current" />Scan Contract</>
                    }
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL — Results ── */}
        <div className="flex flex-col gap-4 min-h-[400px] lg:h-[calc(100vh-8rem)]">
          <AnimatePresence mode="wait">

            {/* ── IDLE: Empty State ── */}
            {phase === "idle" && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20">
                  <FileCode className="w-10 h-10 text-primary opacity-80" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-3">Ready for Analysis</h2>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm">
                  Paste your Solidity code or drag a .sol file, then click{" "}
                  <span className="text-primary font-semibold">Scan Contract</span> to begin the audit.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm">
                  {[
                    { icon: "🔐", label: "Reentrancy" },
                    { icon: "🔢", label: "Overflows" },
                    { icon: "🚪", label: "Access Control" },
                    { icon: "⚡", label: "Flash Loans" },
                    { icon: "🎲", label: "Randomness" },
                    { icon: "💣", label: "DoS Vectors" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/3 border border-white/5">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STREAMING / DONE / ERROR: Live Results Panel ── */}
            {isShowingResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-4 flex-1 overflow-hidden"
              >
                {/* ── Live Status Bar ── */}
                <div className="glass-panel p-4 rounded-2xl shrink-0">
                  <div className="flex flex-wrap items-center gap-4">

                    {/* Status indicator */}
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border",
                      phase === "streaming" ? "bg-primary/10 border-primary/30 text-primary animate-pulse" :
                      phase === "done" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                      "bg-red-500/10 border-red-500/30 text-red-400"
                    )}>
                      {phase === "streaming" && <Cpu className="w-3.5 h-3.5 animate-spin" />}
                      {phase === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {phase === "error" && <AlertTriangle className="w-3.5 h-3.5" />}
                      {phase === "streaming" ? "Analyzing" : phase === "done" ? "Complete" : "Error"}
                    </div>

                    {/* Stage message */}
                    <div className="flex-1 min-w-0">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={stage}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-muted-foreground truncate"
                        >
                          {stage}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    {/* Live found counter */}
                    {(phase === "streaming" || phase === "done") && (
                      <div className="flex items-center gap-3 shrink-0">
                        <motion.div
                          key={foundCount}
                          initial={{ scale: 1.3, color: "#ff4444" }}
                          animate={{ scale: 1, color: "#94a3b8" }}
                          className="text-sm font-mono font-bold text-muted-foreground"
                        >
                          <span className="text-white text-lg">{foundCount}</span> found
                        </motion.div>
                        {riskScore !== null && (
                          <div className={cn(
                            "flex items-center gap-1 text-sm font-bold",
                            riskScore >= 80 ? "text-[#ff4444]" :
                            riskScore >= 50 ? "text-[#ff8c00]" :
                            riskScore >= 20 ? "text-[#ffd700]" : "text-green-400"
                          )}>
                            <BarChart3 className="w-4 h-4" />
                            {riskScore}/100
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress bar for streaming */}
                  {phase === "streaming" && (
                    <div className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
                    </div>
                  )}
                </div>

                {/* ── Summary Bar (once meta arrives) ── */}
                {(result || (riskScore !== null && partialVulns.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center",
                        foundCount > 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                      )}>
                        {foundCount > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Risk Score</div>
                        <div className="text-2xl font-display font-bold">{riskScore ?? "…"}/100</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
                        <motion.div
                          key={sev}
                          animate={{ scale: sevCounts[sev] > 0 ? [1, 1.15, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center p-2 rounded-lg bg-white/5 min-w-[50px]"
                        >
                          <span className={cn("font-bold text-lg leading-none", SEV_COLORS[sev])}>
                            {sevCounts[sev]}
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase mt-1">{sev.slice(0, 4)}</span>
                        </motion.div>
                      ))}
                    </div>

                    {result && (
                      <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 text-sm font-bold"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                      </button>
                    )}
                  </motion.div>
                )}

                {/* ── Scrollable Content ── */}
                <div className="flex-1 overflow-y-auto scrollbar-custom rounded-2xl glass-panel flex flex-col min-h-0">
                  <div className="p-4 lg:p-5 flex flex-col gap-5">

                    {/* Summary text */}
                    {result?.summary && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                      >
                        <div className="flex items-start gap-3">
                          <Layers className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed text-slate-300">{result.summary}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Streaming: vulnerabilities appear progressively */}
                    {partialVulns.length > 0 && (
                      <div>
                        {phase === "done" && result && (
                          <div className="flex items-start gap-5 mb-4">
                            <div className="glass-panel rounded-xl p-4 w-full lg:w-auto lg:min-w-[200px]">
                              <h3 className="text-xs font-bold text-center mb-2 uppercase tracking-wider text-muted-foreground">Distribution</h3>
                              <SeverityChart vulnerabilities={partialVulns} />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-display font-bold">
                            {phase === "streaming" ? "Discovering Issues" : "Detected Issues"}
                          </h3>
                          <motion.span
                            key={partialVulns.length}
                            initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                            className="bg-white/10 px-2 py-0.5 rounded text-sm font-bold"
                          >
                            {partialVulns.length}
                          </motion.span>
                          {phase === "streaming" && (
                            <div className="flex gap-0.5 items-center ml-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-1.5 h-1.5 rounded-full bg-primary"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <AnimatePresence initial={false}>
                            {partialVulns.map((vuln) => (
                              <VulnerabilityCard
                                key={vuln.id}
                                vulnerability={vuln}
                                onGenerateFix={handleGenerateFix}
                                isGeneratingFix={isGeneratingFix}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Empty scanning state while streaming with no vulns yet */}
                    {phase === "streaming" && partialVulns.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative w-20 h-20 mb-6">
                          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                          <Shield className="absolute inset-0 m-auto w-7 h-7 text-primary animate-pulse" />
                        </div>
                        <p className="text-muted-foreground text-sm max-w-xs">
                          Claude is auditing your smart contract across 15+ vulnerability categories…
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/50">
                          <Clock className="w-3 h-3" />
                          Typically takes 15–45 seconds
                        </div>
                      </div>
                    )}

                    {/* Secure contract result */}
                    {phase === "done" && partialVulns.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                      >
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-green-500/20">
                          <ShieldCheck className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-green-500 mb-2">Secure Contract</h3>
                        <p className="text-muted-foreground max-w-md text-sm">
                          No standard vulnerabilities detected. Always conduct a manual audit before mainnet deployment.
                        </p>
                      </motion.div>
                    )}

                    {/* Error state */}
                    {phase === "error" && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                      >
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                          <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">Scan Failed</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                          Something went wrong. Please try again.
                        </p>
                        <button
                          onClick={handleScan}
                          className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                        >
                          Retry Scan
                        </button>
                      </motion.div>
                    )}

                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
