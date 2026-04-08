import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Scale, ScrollText } from "lucide-react";

export default function Terms() {
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
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-6 text-accent">
            <Scale className="w-4 h-4" />
            <span>Effective Date: April 8, 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-10 text-slate-300 leading-relaxed">
            <p className="text-lg">
              Welcome to VulnGuard AI. By accessing or using our website, services, and software provided by VulnGuard ("Service"), you agree to be bound by these Terms of Service.
            </p>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-400">
                  By registering for and/or using the Service in any manner, including but not limited to visiting or browsing the Site, you agree to these Terms of Service and all other operating rules, policies, and procedures that may be published from time to time on the Site by us, each of which is incorporated by reference.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" />
                  2. Use of the AI Scanner
                </h2>
                <p className="text-slate-400">
                  VulnGuard provides automated AI-driven analysis of Solidity smart contracts. While we strive to detect all known vulnerabilities (such as Reentrancy, Overflow, Access Control issues), our analysis is informational and probabilistic. 
                  <strong className="text-white"> We do not guarantee that your smart contract is free of all defects, bugs, or vulnerabilities.</strong> You agree to independently audit and verify your code before deploying any significant financial assets.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" />
                  3. Intellectual Property
                </h2>
                <p className="text-slate-400">
                  You retain all rights and ownership to the code you submit to VulnGuard. We claim no ownership over your smart contracts. However, by submitting code, you grant us a temporary, limited license to process and analyze the code strictly to provide the scanning service to you.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" />
                  4. Limitation of Liability
                </h2>
                <p className="text-slate-400">
                  In no event shall VulnGuard AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable under contract, tort, strict liability, negligence, or any other legal or equitable theory with respect to the Service for any lost profits, data loss, cost of procurement of substitute goods or services, or special, indirect, incidental, punitive, or consequential damages of any kind whatsoever.
                </p>
              </div>
            </div>
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
