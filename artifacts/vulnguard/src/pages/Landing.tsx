import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Lock, Zap, Code2, ChevronRight, UserPlus, LogIn, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "AI-Powered Scanning",
    description: "Detect Reentrancy, Overflow, and access control issues automatically with advanced AI analysis.",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Comprehensive Reports",
    description: "Get detailed vulnerability reports, risk severity breakdowns, and actionable mitigation steps.",
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Secure by Design",
    description: "Analyze smart contracts confidently ensuring your code stays uncompromised.",
    icon: Lock,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0E1117] text-slate-200 overflow-hidden font-sans selection:bg-primary/30">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0E1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">VulnGuard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Log In</a>
            </Link>
            <Link href="/signup">
              <a className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                Sign Up
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] pointer-events-none opacity-50" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 text-primary"
          >
            <Shield className="w-4 h-4" />
            <span>Next-Gen Smart Contract Security</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Secure your Web3 future with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              intelligent analysis
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            VulnGuard detects vulnerabilities, generates patches, and secures your smart contracts using state-of-the-art AI technology. Ensure your code is flawless before deployment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <a className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                Get Started for Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Link>
            <Link href="/login">
              <a className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2">
                Log In to Account
              </a>
            </Link>
          </motion.div>
        </div>

        {/* Floating Code UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#161B22] p-2 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="bg-[#0D1117] rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto text-xs font-mono text-slate-400 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5" /> main.sol
              </div>
            </div>
            <div className="p-6 font-mono text-sm text-slate-300 overflow-x-auto relative">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                  <Shield className="w-3.5 h-3.5" /> Reentrancy Detected
                </div>
              </div>
              <pre>
                <code>
                  <span className="text-pink-400">pragma</span> <span className="text-blue-400">solidity</span> <span className="text-green-400">^0.8.0</span>;<br/><br/>
                  <span className="text-pink-400">contract</span> VulnerableBank {"{\n"}
                  {"  "}mapping(address =&gt; uint) <span className="text-pink-400">public</span> balances;<br/><br/>
                  {"  "}<span className="text-pink-400">function</span> withdraw() <span className="text-pink-400">public</span> {"{\n"}
                  {"    "}<span className="text-slate-500">// Vulnerability here: state change after transfer</span><br/>
                  {"    "}uint bal = balances[msg.sender];<br/>
                  {"    "}require(bal &gt; 0);<br/>
                  {"    "}(bool sent, ) = msg.sender.call{"{"}value: bal{"}"}("");<br/>
                  {"    "}require(sent, "Failed");<br/>
                  {"    "}balances[msg.sender] = 0;<br/>
                  {"  }\n"}
                  {"}"}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Features Grids */}
        <div className="mt-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-colors"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", feat.bg)}>
                  <Icon className={cn("w-6 h-6", feat.color)} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feat.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-slate-300">VulnGuard</span>
          </div>
          <p>© {new Date().getFullYear()} VulnGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
