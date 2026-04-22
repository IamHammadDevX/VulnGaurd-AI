import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Link } from "wouter";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
};

const SIGNALS = [
  { icon: ShieldCheck, label: "Verified auth flows" },
  { icon: Workflow, label: "Shared security workspace" },
  { icon: Sparkles, label: "Calm, focused onboarding" },
];

export function AuthShell({
  title,
  subtitle,
  children,
  backHref = "/",
  backLabel = "Back to site",
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#09090b_0%,#09090b_38%,#050506_100%)] text-zinc-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-14 h-72 w-72 rounded-full bg-emerald-500/12 blur-[130px]" />
        <div className="absolute bottom-[-5rem] right-[10%] h-80 w-80 rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.16]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-xl pb-10 lg:pb-0"
        >
          <div className="mb-8 flex items-center justify-between">
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            <ThemeToggleButton />
          </div>

          <BrandLogo showTagline tagline="Trusted access to smart contract security" />
          <div className="mt-8 space-y-4">
            <span className="inline-flex rounded-full border border-zinc-800 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Secure Access
            </span>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">{subtitle}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {SIGNALS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-zinc-800/80 bg-white/[0.03] p-4 shadow-[0_20px_70px_-48px_rgba(0,0,0,1)]"
                >
                  <div className="mb-3 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-[32px] border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-[0_30px_100px_-52px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
