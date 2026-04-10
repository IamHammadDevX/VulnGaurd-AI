import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Book, FileText, CheckCircle2, Lock } from "lucide-react";
import { useEffect } from "react";
import { engagementEvents } from "@/lib/analytics";

export default function Privacy() {
  // Track page view
  useEffect(() => {
    engagementEvents.privacyPolicyViewed();
  }, []);

  return (
    <div className="min-h-screen bg-[#0E1117] text-slate-200 overflow-hidden font-sans selection:bg-primary/30 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0E1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">VulnGuard</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Log In</a>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6 text-primary">
            <Shield className="w-4 h-4" />
            <span>Last Updated: April 8, 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert prose-slate max-w-none">
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              At VulnGuard AI, we take your privacy and the security of your smart contracts seriously. This Privacy Policy outlines how we collect, use, and protect your information when you use our Vulnerability Scanner and related services.
            </p>

            <div className="space-y-8">
              <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  1. Information We Collect
                </h2>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Account Information:</strong> Name, email address, and profile details when you sign up.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Smart Contract Data:</strong> The Solidity source code you submit for scanning. We do not use your code to train our base AI models without explicit opt-in.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Usage Data:</strong> Telemetry, error logs, and performance metrics to improve the platform.</span>
                  </li>
                </ul>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  2. How We Protect Your Data
                </h2>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  We use industry-standard encryption protocols (TLS 1.3) for data in transit and AES-256 for data at rest. Your smart contracts are processed in secure, ephemeral environments and are permanently deleted from active memory immediately after the scanning process completes, unless you explicitly save the scan history to your dashboard.
                </p>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Book className="w-6 h-6 text-primary" />
                  3. Information Sharing
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  We do not sell your personal data or source code to third parties. We may share necessary data with trusted service providers (such as OpenRouter for AI inference and Supabase for database hosting) strictly for the purpose of operating the VulnGuard platform. These providers are bound by strict confidentiality agreements.
                </p>
              </section>
            </div>
            
            <p className="mt-12 text-slate-500 text-sm text-center">
              If you have any questions about this Privacy Policy, please contact us at privacy@vulnguard.ai.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm bg-black/20 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} VulnGuard AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
