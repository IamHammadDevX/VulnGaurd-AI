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
    <div className="app-shell-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-14 h-72 w-72 rounded-full bg-emerald-500/12 blur-[130px]" />
        <div className="absolute bottom-[-5rem] right-[10%] h-80 w-80 rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="app-shell-grid absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-xl pb-10 lg:pb-0"
        >
          <div className="mb-8 flex items-center justify-between">
            <Link href={backHref} className="app-shell-copy inline-flex items-center gap-2 text-sm transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            <ThemeToggleButton />
          </div>

          <BrandLogo showTagline tagline="Trusted access to smart contract security" />
          <div className="mt-8 space-y-4">
            <span className="app-shell-chip app-shell-muted inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
              Secure Access
            </span>
            <h1 className="app-shell-heading max-w-lg text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="app-shell-copy max-w-xl text-base leading-7 sm:text-lg">{subtitle}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {SIGNALS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="app-shell-panel-soft rounded-2xl p-4"
                >
                  <div className="app-shell-inset app-shell-heading mb-3 inline-flex rounded-2xl p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="app-shell-copy text-sm font-medium">{item.label}</p>
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
          <div className="app-shell-panel-strong rounded-[32px] p-6 sm:p-8">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
