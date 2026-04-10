import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, LifeBuoy, FileQuestion, MessageSquare, BookOpen, ChevronRight } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useEffect, useState } from "react";
import { engagementEvents } from "@/lib/analytics";

export default function Support() {
  const { isAuthenticated } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Track page view
  useEffect(() => {
    engagementEvents.documentationViewed("support_page");
  }, []);
  
  const faqs = [
    {
      q: "How accurate is the AI Scanner?",
      a: "Our scanner utilizes state-of-the-art LLMs (like Claude 3.7 Sonnet) trained on extensive security databases. While highly accurate in spotting known vulnerability patterns, it should be used as a supplementary tool alongside manual audits."
    },
    {
      q: "Are my smart contracts kept confidential?",
      a: "Yes. Smart contracts are processed entirely in memory or stored securely if you choose to save the scan report. We do not use your code to train our base AI models without explicit opt-in."
    },
    {
      q: "Can I download my scan as a PDF report?",
      a: "Absolutely. Once a scan is complete, you can generate and download a comprehensive PDF report from your dashboard that details vulnerabilities, severities, and AI-suggested fixes."
    },
    {
      q: "Do you support languages other than Solidity?",
      a: "Currently, our platform is heavily optimized for Solidity (Ethereum/EVM compatibility). Support for Vyper, Rust, and Move (Solana/Near) is on our roadmap."
    }
  ];

  const handleFaqClick = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
    if (expandedFaq !== index) {
      engagementEvents.faqViewed(faqs[index].q);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1117] text-slate-200 overflow-hidden font-sans selection:bg-primary/30 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0E1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">VulnGuard</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Link href="/login">
                <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Log In</a>
              </Link>
            ) : (
              <Link href="/">
                <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Scanner</a>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 px-6 max-w-5xl mx-auto w-full relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 relative z-10"
        >
          <div className="inline-flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <LifeBuoy className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">How can we help?</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Search our knowledge base or browse our categories to find exactly what you need.
            </p>
            <div className="w-full max-w-xl relative">
              <input 
                type="text" 
                placeholder="Search for articles, features, or tutorials..." 
                className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <BookOpen className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-white mb-2">Getting Started</h3>
            <p className="text-sm text-slate-400">Learn how to run your first smart contract scan and interpret the dashboard.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <FileQuestion className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-white mb-2">Vulnerability Guide</h3>
            <p className="text-sm text-slate-400">Detailed explanations of Reentrancy, Overflow, and mitigation techniques.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <MessageSquare className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-white mb-2">Community Discord</h3>
            <p className="text-sm text-slate-400">Join our Discord community to discuss Web3 security with fellow developers.</p>
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="bg-[#12161E] border border-white/5 rounded-3xl p-8 md:p-12 relative z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleFaqClick(i)}
                className="text-left space-y-3 p-4 rounded-lg border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <h4 className="text-lg font-semibold text-white flex items-start gap-2">
                  <span className="text-primary mt-1">✦</span>
                  {faq.q}
                </h4>
                {expandedFaq === i && (
                  <p className="text-slate-400 text-sm leading-relaxed pl-6">{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm bg-black/20 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center">
          <p>© {new Date().getFullYear()} VulnGuard AI. All rights reserved.</p>
          <div className="flex gap-4 mt-4">
             <Link href="/contact"><a className="hover:text-primary transition-colors">Contact Us</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}