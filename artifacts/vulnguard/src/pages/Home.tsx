import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, UploadCloud, FileCode, Play, Trash2, Download, ExternalLink, RefreshCw, Layers } from "lucide-react";
import { useScanner } from "@/hooks/use-scanner";
import { EXAMPLE_CONTRACTS } from "@/lib/constants";
import { formatBytes, cn } from "@/lib/utils";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { SeverityChart } from "@/components/SeverityChart";

export default function Home() {
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 50000) {
        alert("File too large. Max size is 50KB.");
        return;
      }
      setContractName(file.name.replace('.sol', ''));
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, [setCode, setContractName]);

  const { getRootProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/plain': ['.sol'] },
    noClick: true,
    noKeyboard: true
  });

  return (
    <div className="min-h-screen flex flex-col relative pb-20">
      {/* Background Image / Texture overlay */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/cyber-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
              <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Smart Contract Security Scanner</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* LEFT PANEL - Editor */}
        <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] min-h-[600px]">
          <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden border-white/10">
            
            {/* Editor Toolbar */}
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/20">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Contract Name (Optional)" 
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="bg-transparent border-none outline-none text-lg font-bold placeholder:text-muted-foreground w-full focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0 hide-scrollbar">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mr-2">Examples:</span>
                {Object.values(EXAMPLE_CONTRACTS).map((contract) => (
                  <button
                    key={contract.name}
                    onClick={() => {
                      setContractName(contract.name);
                      setCode(contract.code);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium whitespace-nowrap transition-all"
                  >
                    {contract.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div 
              {...getRootProps()} 
              className={cn(
                "flex-1 relative transition-colors duration-300",
                isDragActive ? "bg-primary/5" : "bg-[#0d0d12]"
              )}
            >
              {isDragActive && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary">
                  <UploadCloud className="w-16 h-16 text-primary mb-4 animate-bounce" />
                  <p className="text-xl font-bold text-white">Drop Solidity file here</p>
                </div>
              )}
              
              <Editor
                height="100%"
                language="sol"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'Chakra Petch',
                  lineHeight: 24,
                  padding: { top: 24, bottom: 24 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                }}
              />
            </div>

            {/* Editor Footer Actions */}
            <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-mono">
                {formatBytes(new Blob([code]).size)} / 50 KB
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCode("")}
                  className="px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
                
                <button
                  onClick={handleScan}
                  disabled={isScanning || !code.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-border relative overflow-hidden group"
                >
                  {isScanning && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                  )}
                  {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  {isScanning ? "Scanning..." : "Scan Contract"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL - Results */}
        <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* Empty State */}
            {!currentResult && !isScanning && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 glass-panel rounded-2xl flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <FileCode className="w-10 h-10 text-primary opacity-80" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-3">Ready for Analysis</h2>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Paste your Solidity code or drag a .sol file into the editor, then click Scan to begin the AI-powered vulnerability audit.
                </p>
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
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <Shield className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-xl font-display font-bold mb-2">Analyzing Smart Contract...</h2>
                <p className="text-muted-foreground text-sm">Our AI is checking for reentrancy, overflows, and 15+ other vectors.</p>
                <div className="w-64 h-1.5 bg-white/5 rounded-full mt-8 overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
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
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      currentResult.total_vulnerabilities > 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {currentResult.total_vulnerabilities > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Risk Score</div>
                      <div className="text-2xl font-display font-bold">{currentResult.risk_score}/100</div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-4">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 min-w-[60px]">
                      <span className="text-severity-critical font-bold text-lg leading-none">{currentResult.vulnerabilities.filter(v => v.severity === 'CRITICAL').length}</span>
                      <span className="text-[10px] text-muted-foreground uppercase mt-1">Crit</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 min-w-[60px]">
                      <span className="text-severity-high font-bold text-lg leading-none">{currentResult.vulnerabilities.filter(v => v.severity === 'HIGH').length}</span>
                      <span className="text-[10px] text-muted-foreground uppercase mt-1">High</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 min-w-[60px]">
                      <span className="text-severity-medium font-bold text-lg leading-none">{currentResult.vulnerabilities.filter(v => v.severity === 'MEDIUM').length}</span>
                      <span className="text-[10px] text-muted-foreground uppercase mt-1">Med</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 text-sm font-bold ml-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export JSON</span>
                  </button>
                </div>

                {/* Main Scrollable Results Area */}
                <div className="flex-1 overflow-y-auto scrollbar-custom rounded-2xl glass-panel p-4 lg:p-6 flex flex-col gap-6">
                  
                  {/* Summary Text */}
                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-primary-foreground">
                    <div className="flex items-start gap-3">
                      <Layers className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed text-slate-300">
                        {currentResult.summary}
                      </p>
                    </div>
                  </div>

                  {currentResult.vulnerabilities.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                        <div className="lg:col-span-1 glass-panel rounded-xl p-4">
                          <h3 className="text-sm font-bold text-center mb-2 uppercase tracking-wider text-muted-foreground">Distribution</h3>
                          <SeverityChart vulnerabilities={currentResult.vulnerabilities} />
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                          <h3 className="text-lg font-display font-bold flex items-center gap-2">
                            Detected Issues <span className="bg-white/10 px-2 py-0.5 rounded text-sm">{currentResult.total_vulnerabilities}</span>
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
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-green-500 mb-2">Secure Contract</h3>
                      <p className="text-muted-foreground max-w-md">
                        Great job! No standard vulnerabilities were detected in this smart contract. 
                        Always remember to conduct manual audits before deploying to mainnet.
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
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
