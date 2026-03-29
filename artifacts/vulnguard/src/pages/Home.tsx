import { useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, UploadCloud, FileCode,
  Play, Trash2, Download, ExternalLink, RefreshCw, Layers,
  AlertTriangle, KeyboardIcon, ChevronRight
} from "lucide-react";
import { useScanner } from "@/hooks/use-scanner";
import { EXAMPLE_CONTRACTS } from "@/lib/constants";
import { formatBytes, cn } from "@/lib/utils";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { SeverityChart } from "@/components/SeverityChart";

const MAX_BYTES = 50 * 1024; // 50 KB

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

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    code,
    setCode,
    contractName,
    setContractName,
    currentResult,
    isScanning,
    isGeneratingFix,
    handleScan,
    handleDownloadReport,
    handleGenerateFix,
  } = useScanner();

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

  return (
    <div className="min-h-screen flex flex-col relative pb-20">
      {/* Background texture */}
      <div
        className="fixed inset-0 z-[-1] opacity-30 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/cyber-bg.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Header */}
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
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">

        {/* ── LEFT PANEL — Editor ───────────────────────────────── */}
        <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] min-h-[600px]">
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
                {/* File upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".sol"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload .sol file"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-sm font-medium shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload .sol</span>
                </button>
              </div>

              {/* Row 2: example contracts */}
              <div>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mb-2">
                  Example Contracts
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  {Object.entries(EXAMPLE_CONTRACTS).map(([key, contract]) => {
                    const meta = EXAMPLE_META[key];
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setContractName(contract.name);
                          setCode(contract.code);
                        }}
                        className={cn(
                          "flex-1 flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all",
                          meta?.color ?? "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold truncate">{meta?.label ?? contract.name}</span>
                            {meta?.badge && (
                              <span className={cn(
                                "text-[9px] font-black px-1 rounded leading-tight",
                                meta.badge === "VULN" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                              )}>
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
              className={cn(
                "flex-1 relative transition-colors duration-300",
                isDragActive ? "bg-primary/5" : "bg-[#080d14]"
              )}
            >
              {/* Drag overlay */}
              <AnimatePresence>
                {isDragActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-none pointer-events-none"
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
              {/* Size progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full transition-colors",
                      isSizeError ? "bg-red-500" : isSizeWarning ? "bg-yellow-500" : "bg-primary"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${bytePercent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <div className={cn(
                  "text-[11px] font-mono shrink-0",
                  isSizeError ? "text-red-400" : isSizeWarning ? "text-yellow-400" : "text-muted-foreground"
                )}>
                  {isSizeError && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {formatBytes(byteSize)} / 50 KB
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/60 shrink-0">
                  {lineCount.toLocaleString()} lines
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between gap-3">
                {/* Keyboard hint */}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                  <KeyboardIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    <kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to scan
                  </span>
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
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed glow-border relative overflow-hidden group"
                  >
                    {isScanning && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                    )}
                    {isScanning
                      ? <RefreshCw className="w-4 h-4 animate-spin" />
                      : <Play className="w-4 h-4 fill-current" />
                    }
                    {isScanning ? "Scanning..." : "Scan Contract"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL — Results ─────────────────────────────── */}
        <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* Empty State */}
            {!currentResult && !isScanning && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20">
                  <FileCode className="w-10 h-10 text-primary opacity-80" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-3">Ready for Analysis</h2>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm">
                  Paste your Solidity code or drag a .sol file into the editor, then click{" "}
                  <span className="text-primary font-semibold">Scan Contract</span> to begin the AI-powered vulnerability audit.
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

            {/* Scanning State */}
            {isScanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center p-8"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                  <Shield className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-xl font-display font-bold mb-2">Analyzing Smart Contract...</h2>
                <p className="text-muted-foreground text-sm">
                  Checking for reentrancy, overflows, and 15+ vulnerability vectors.
                </p>
                <div className="w-64 h-1.5 bg-white/5 rounded-full mt-8 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full animate-[progress_2s_ease-in-out_infinite]"
                    style={{ width: "50%" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Results State */}
            {currentResult && !isScanning && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col gap-4 overflow-hidden"
              >
                {/* Summary Bar */}
                <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        currentResult.total_vulnerabilities > 0
                          ? "bg-red-500/10 text-red-500"
                          : "bg-green-500/10 text-green-500"
                      )}
                    >
                      {currentResult.total_vulnerabilities > 0
                        ? <ShieldAlert className="w-6 h-6" />
                        : <ShieldCheck className="w-6 h-6" />
                      }
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Risk Score
                      </div>
                      <div className="text-2xl font-display font-bold">
                        {currentResult.risk_score}/100
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
                      const count = currentResult.vulnerabilities.filter(
                        (v) => v.severity === sev
                      ).length;
                      const colors: Record<string, string> = {
                        CRITICAL: "text-severity-critical",
                        HIGH: "text-severity-high",
                        MEDIUM: "text-severity-medium",
                        LOW: "text-severity-low",
                      };
                      return (
                        <div
                          key={sev}
                          className="flex flex-col items-center p-2 rounded-lg bg-white/5 min-w-[50px]"
                        >
                          <span className={cn("font-bold text-lg leading-none", colors[sev])}>
                            {count}
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase mt-1">
                            {sev.slice(0, 4)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 text-sm font-bold ml-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </button>
                </div>

                {/* Scrollable Results */}
                <div className="flex-1 overflow-y-auto scrollbar-custom rounded-2xl glass-panel p-4 lg:p-6 flex flex-col gap-6">
                  {/* Summary text */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Layers className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed text-slate-300">{currentResult.summary}</p>
                    </div>
                  </div>

                  {currentResult.vulnerabilities.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      <div className="lg:col-span-1 glass-panel rounded-xl p-4">
                        <h3 className="text-xs font-bold text-center mb-2 uppercase tracking-wider text-muted-foreground">
                          Distribution
                        </h3>
                        <SeverityChart vulnerabilities={currentResult.vulnerabilities} />
                      </div>
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-display font-bold flex items-center gap-2">
                          Detected Issues{" "}
                          <span className="bg-white/10 px-2 py-0.5 rounded text-sm">
                            {currentResult.total_vulnerabilities}
                          </span>
                        </h3>
                        {currentResult.vulnerabilities.map((vuln) => (
                          <VulnerabilityCard
                            key={vuln.id}
                            vulnerability={vuln}
                            onGenerateFix={handleGenerateFix}
                            isGeneratingFix={isGeneratingFix}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-green-500 mb-2">
                        Secure Contract
                      </h3>
                      <p className="text-muted-foreground max-w-md text-sm">
                        No standard vulnerabilities detected. Always conduct a manual audit before mainnet deployment.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(200%); } }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
