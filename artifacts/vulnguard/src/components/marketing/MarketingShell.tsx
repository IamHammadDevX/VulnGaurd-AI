import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { ArrowRight, Github, Linkedin, Menu, Twitter } from "lucide-react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { cn } from "@/lib/utils";

type MarketingShellProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: ReactNode;
};

const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/api-docs", label: "API Docs" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export function MarketingShell({ title, subtitle, eyebrow, children }: MarketingShellProps) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ctaHref = useMemo(() => (isAuthenticated ? "/scanner" : "/signup"), [isAuthenticated]);
  const ctaLabel = isAuthenticated ? "Open Workspace" : "Start Free";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#09090b_0%,#09090b_45%,#050506_100%)] text-zinc-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_30%),radial-gradient(circle_at_85%_14%,rgba(245,158,11,0.08),transparent_18%),linear-gradient(180deg,rgba(24,24,27,0.16),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.16]" />
        <div className="absolute left-[6%] top-12 h-80 w-80 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute right-[8%] top-28 h-72 w-72 rounded-full bg-amber-500/8 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-2xl border border-zinc-800 bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-zinc-800 bg-white/[0.03] p-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  location === link.href
                    ? "bg-white/[0.08] text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-100",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 lg:flex">
              {!isAuthenticated && (
                <Link href="/login" className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100">
                  Sign In
                </Link>
              )}
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-4 py-2 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/16"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ThemeToggleButton />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-white/[0.04] p-2 text-zinc-400 lg:hidden"
              aria-label="Navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-800/80 px-4 py-4 lg:hidden">
            <div className="grid gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-medium transition-colors",
                    location === link.href
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-800 bg-white/[0.03] text-zinc-300",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-300"
                >
                  Sign In
                </Link>
              )}
              <Link
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-300"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[36px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.75),rgba(9,9,11,0.72))] px-6 py-10 shadow-[0_40px_120px_-68px_rgba(0,0,0,1)] backdrop-blur-2xl sm:px-8 sm:py-12 lg:px-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(245,158,11,0.08),transparent_24%)]" />
          <div className="relative max-w-4xl">
            {eyebrow && (
              <span className="inline-flex rounded-full border border-zinc-800 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">{subtitle}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07]"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-8"
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-zinc-800/80 bg-zinc-950/72">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <BrandLogo showTagline tagline="World-class smart contract security UX" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
              Deep-security dark aesthetics for builders who need signal, speed, and trustworthy vulnerability reporting.
            </p>
            <div className="mt-5 flex items-center gap-3 text-zinc-500">
              <a href="https://github.com/IamHammadDevX/VulnGaurd-AI" target="_blank" rel="noreferrer" aria-label="GitHub" className="rounded-full border border-zinc-800 bg-white/[0.03] p-2 transition-colors hover:text-zinc-100">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://x.com/thisis_hammad" target="_blank" rel="noreferrer" aria-label="X" className="rounded-full border border-zinc-800 bg-white/[0.03] p-2 transition-colors hover:text-zinc-100">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/iamhammaddevx" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-full border border-zinc-800 bg-white/[0.03] p-2 transition-colors hover:text-zinc-100">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-200">Platform</h4>
            <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-500">
              <Link href="/product" className="hover:text-zinc-100">Product</Link>
              <Link href="/features" className="hover:text-zinc-100">Features</Link>
              <Link href="/pricing" className="hover:text-zinc-100">Pricing</Link>
              <Link href="/api-docs" className="hover:text-zinc-100">API Docs</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-200">Resources</h4>
            <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-500">
              <Link href="/support" className="hover:text-zinc-100">Support</Link>
              <Link href="/help-center" className="hover:text-zinc-100">Help Center</Link>
              <Link href="/contact" className="hover:text-zinc-100">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-200">Company</h4>
            <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-500">
              <Link href="/legal" className="hover:text-zinc-100">Legal</Link>
              <Link href="/privacy" className="hover:text-zinc-100">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-100">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
