import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Shield, Lock, Zap, Code2, ChevronRight, CheckCircle2, ArrowRight, Play, Cpu, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "AI-Powered Analysis",
    description: "Detect Reentrancy, Overflow, and 15+ vulnerability classes automatically with cutting-edge LLMs.",
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    title: "Detailed Audit Reports",
    description: "Generate comprehensive, PDF-ready security audits with executive summaries and severity breakdowns.",
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    title: "Team Collaboration",
    description: "Work securely with role-based access control. Invite developers and auditors to manage project safety.",
    icon: Layers,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    title: "Actionable Fixes",
    description: "Don't just find bugs—fix them. Get exact before-and-after diffs and deep mitigation strategies.",
    icon: Code2,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    title: "Private & Secure",
    description: "Your smart contract code is processed securely in memory and never used for base model training.",
    icon: Lock,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    title: "Real-time Streaming",
    description: "Watch the AI analyze your contract live. Get instant feedback on line-by-line vulnerabilities.",
    icon: Cpu,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  }
];

const STEPS = [
  {
    title: "Paste Your Code",
    desc: "Drop your Solidity smart contract directly into our IDE-grade Monaco editor."
  },
  {
    title: "AI Analysis",
    desc: "Our advanced context-aware engine streams the vulnerability scan directly to your screen."
  },
  {
    title: "Get The Report",
    desc: "Review your comprehensive risk score, view actionable diffs, and download a PDF audit."
  }
];

const TESTIMONIALS = [
  {
    quote: "VulnGuard caught a critical cross-function reentrancy bug our team missed. It easily saved us millions in secured TVL.",
    name: "Alex R.",
    role: "Lead Smart Contract Dev",
    initials: "AR",
    color: "bg-blue-500"
  },
  {
    quote: "The actionable fixes and before/after diffs drastically speed up our audit times. A must-have for Web3 builders.",
    name: "Sarah K.",
    role: "Security Researcher",
    initials: "SK",
    color: "bg-emerald-500"
  },
  {
    quote: "We require every PR to pass a VulnGuard scan. The team features make integrating it into our workflow seamless.",
    name: "James T.",
    role: "CTO, DeFi Protocol",
    initials: "JT",
    color: "bg-purple-500"
  }
];

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const { isAuthenticated } = useAuth();
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="min-h-screen bg-[#0E1117] text-slate-200 overflow-hidden font-sans selection:bg-primary/30">
      
      {/* 1. Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0E1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white hidden sm:block">VulnGuard</span>
            </a>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
             <a href="#features" className="hover:text-white transition-colors">Features</a>
             <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
             <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 hidden sm:block">Log In</a>
                </Link>
                <Link href="/signup">
                  <a className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
                    Start Scanning
                  </a>
                </Link>
              </>
            ) : (
              <Link href="/">
                <a className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
                  Scanner
                </a>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Background Ambience */}
        <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <motion.div style={{ y: y2 }} className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        {/* 2. Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 text-primary backdrop-blur-md"
            >
              <Shield className="w-4 h-4" />
              <span>Next-Gen Web3 Security Tooling</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-5xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]"
            >
              Ship smart contracts <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                with absolute confidence.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              VulnGuard is the AI-native analysis engine that detects zero-days, generates exact code patches, and secures your deployments before they hit the blockchain.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {!isAuthenticated ? (
                <>
                  <Link href="/signup">
                    <a className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                      Start Free Scan
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Link>
                  <Link href="/login">
                    <a className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 fill-current" /> View Demo
                    </a>
                  </Link>
                </>
              ) : (
                <Link href="/">
                  <a className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    Go to Scanner
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Hero IDE Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-24 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#161B22] p-2 shadow-2xl hover:border-primary/30 transition-colors duration-500 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="bg-[#0D1117] rounded-xl overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161B22]/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-md">
                  <Code2 className="w-3.5 h-3.5 text-primary" /> VulnerableBank.sol
                </div>
                <div className="w-16" /> {/* spacer to center title roughly */}
              </div>
              <div className="p-6 md:p-8 font-mono text-sm md:text-base text-slate-300 overflow-x-auto relative">
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse shadow-lg backdrop-blur-sm">
                    <Shield className="w-4 h-4" /> High Risk: CEI Violation
                  </div>
                </div>
                <pre className="pr-32">
                  <code>
                    <span className="text-[#FF7B72]">pragma</span> <span className="text-[#79C0FF]">solidity</span> <span className="text-[#A5D6FF]">^0.8.0</span>;<br/><br/>
                    <span className="text-[#FF7B72]">contract</span> <span className="text-[#D2A8FF]">VulnerableBank</span> {"{\n"}
                    {"  "}<span className="text-[#FF7B72]">mapping</span>(address =&gt; uint) <span className="text-[#FF7B72]">public</span> balances;<br/><br/>
                    {"  "}<span className="text-[#FF7B72]">function</span> <span className="text-[#D2A8FF]">withdraw</span>() <span className="text-[#FF7B72]">public</span> {"{\n"}
                    <span className="text-[#8B949E] italic">    // ⚠️ Flaw: state update occurs after external call</span><br/>
                    {"    "}uint bal = balances[msg.sender];<br/>
                    {"    "}require(bal &gt; 0);<br/>
                    <span className="bg-red-500/20 px-1 rounded inline-block w-fit relative group">
                      {"    "}(bool sent, ) = msg.sender.<span className="text-[#D2A8FF]">call</span>{"{"}value: bal{"}"}(<span className="text-[#A5D6FF]">""</span>);
                      <div className="absolute -top-10 left-full ml-4 w-48 bg-[#0E1117] border border-red-500/50 p-2 rounded-md text-xs text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        External call before state update enables reentrancy.
                      </div>
                    </span><br/>
                    {"    "}require(sent, <span className="text-[#A5D6FF]">"Failed"</span>);<br/>
                    {"    "}balances[msg.sender] = 0;<br/>
                    {"  }\n"}
                    {"}"}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3. Steps / How it works */}
        <section id="how-it-works" className="py-24 bg-[#0A0D13]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Security simplified.</h2>
               <p className="text-slate-400 text-lg max-w-2xl mx-auto">From source code to resolution in three incredibly fast steps.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8">
               {STEPS.map((step, idx) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                    key={step.title}
                    className="relative p-8 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center text-center hover:bg-white/[0.08] transition-colors"
                 >
                   <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold mb-6 border border-primary/30">
                     {idx + 1}
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                   <p className="text-slate-400 leading-relaxed text-sm">{step.desc}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Built for scale. Built for safety.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Everything you need to audit, fix, and collaborate on your organization's smart contracts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn("p-8 rounded-3xl bg-[#12161A] border hover:-translate-y-1 transition-transform duration-300", feat.border)}
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feat.bg)}>
                    <Icon className={cn("w-7 h-7", feat.color)} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feat.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feat.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* 5. Testimonials */}
        <section id="testimonials" className="py-24 bg-gradient-to-b from-[#0E1117] to-[#0A0D13]">
           <div className="max-w-7xl mx-auto px-6">
             <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-16">Trusted by top security teams</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {TESTIMONIALS.map((test, index) => (
                 <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-white/5 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors"
                 >
                   <p className="text-slate-300 text-lg italic mb-8 leading-relaxed">"{test.quote}"</p>
                   <div className="flex items-center gap-4">
                     <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-white", test.color)}>
                        {test.initials}
                     </div>
                     <div>
                       <h4 className="text-white font-bold">{test.name}</h4>
                       <p className="text-slate-400 text-sm">{test.role}</p>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </div>
        </section>

        {/* 6. CTA Section */}
        <section className="py-32 relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/10 blur-[100px] pointer-events-none" />
           <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to secure your code?</h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Join thousands of developers auditing their Web3 projects with VulnGuard AI today.
              </p>
              <Link href="/signup">
                <a className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                   Scan Free Now <ChevronRight className="w-5 h-5" />
                </a>
              </Link>
           </div>
        </section>

      </main>

      {/* 7. Footer */}
      <footer className="border-t border-white/10 bg-[#0A0D13]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="md:col-span-1">
              <Link href="/">
                <a className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl text-white">VulnGuard</span>
                </a>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed pr-4">
                The most advanced AI-powered vulnerability scanner for Solidity smart contracts. Build with peace of mind.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-primary transition-colors text-sm">Features</a></li>
                <li><Link href="/login"><a className="text-slate-400 hover:text-primary transition-colors text-sm">Sign In</a></Link></li>
                <li><Link href="/signup"><a className="text-slate-400 hover:text-primary transition-colors text-sm">Registration</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/support"><a className="text-slate-400 hover:text-primary transition-colors text-sm">Help Center</a></Link></li>
                <li><Link href="/contact"><a className="text-slate-400 hover:text-primary transition-colors text-sm">Contact Us</a></Link></li>
                <li><a href="https://github.com/IamHammadDevX/VulnGaurd-AI" className="text-slate-400 hover:text-primary transition-colors text-sm">API Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy"><a className="text-slate-400 hover:text-primary transition-colors text-sm">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="text-slate-400 hover:text-primary transition-colors text-sm">Terms of Service</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <p>© {new Date().getFullYear()} VulnGuard AI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0 pb-4 md:pb-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
