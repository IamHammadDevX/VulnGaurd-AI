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
    <div className="app-shell-bg relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" />
        <div className="app-shell-grid absolute inset-0" />
        <div className="absolute left-[6%] top-12 h-80 w-80 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute right-[8%] top-28 h-72 w-72 rounded-full bg-amber-500/8 blur-[130px]" />
      </div>

      <header className="app-shell-topbar sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="app-shell-panel-soft rounded-2xl px-3 py-2 transition-colors hover:bg-white/[0.05]">
            <BrandLogo />
          </Link>

          <nav className="app-shell-panel-soft hidden items-center gap-1 rounded-full p-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  location === link.href
                    ? "bg-white/[0.08] text-foreground"
                    : "app-shell-copy hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 lg:flex">
              {!isAuthenticated && (
                <Link href="/login" className="app-shell-copy text-sm font-medium transition-colors hover:text-foreground">
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
              className="app-shell-button inline-flex items-center justify-center rounded-full p-2 lg:hidden"
              aria-label="Navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border px-4 py-4 lg:hidden">
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
                      : "app-shell-panel-soft app-shell-copy",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="app-shell-panel-soft app-shell-copy rounded-2xl px-4 py-3 text-sm font-medium"
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
          className="app-shell-panel relative overflow-hidden rounded-[36px] px-6 py-10 sm:px-8 sm:py-12 lg:px-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(245,158,11,0.08),transparent_24%)]" />
          <div className="relative max-w-4xl">
            {eyebrow && (
              <span className="app-shell-chip app-shell-muted inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                {eyebrow}
              </span>
            )}
            <h1 className="app-shell-heading mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="app-shell-copy mt-5 max-w-3xl text-base leading-7 sm:text-lg">{subtitle}</p>

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
                className="app-shell-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold duration-300 hover:-translate-y-0.5"
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

      <footer className="app-shell-topbar border-t-0">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <BrandLogo showTagline tagline="World-class smart contract security UX" />
            <p className="app-shell-muted mt-4 max-w-sm text-sm leading-6">
              Deep-security dark aesthetics for builders who need signal, speed, and trustworthy vulnerability reporting.
            </p>
            <div className="app-shell-muted mt-5 flex items-center gap-3">
              <a href="https://github.com/IamHammadDevX/VulnGaurd-AI" target="_blank" rel="noreferrer" aria-label="GitHub" className="app-shell-button rounded-full p-2 transition-colors hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://x.com/thisis_hammad" target="_blank" rel="noreferrer" aria-label="X" className="app-shell-button rounded-full p-2 transition-colors hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/iamhammaddevx" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="app-shell-button rounded-full p-2 transition-colors hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="app-shell-heading text-sm font-semibold">Platform</h4>
            <div className="app-shell-muted mt-4 flex flex-col gap-2 text-sm">
              <Link href="/product" className="hover:text-foreground">Product</Link>
              <Link href="/features" className="hover:text-foreground">Features</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/api-docs" className="hover:text-foreground">API Docs</Link>
            </div>
          </div>

          <div>
            <h4 className="app-shell-heading text-sm font-semibold">Resources</h4>
            <div className="app-shell-muted mt-4 flex flex-col gap-2 text-sm">
              <Link href="/support" className="hover:text-foreground">Support</Link>
              <Link href="/help-center" className="hover:text-foreground">Help Center</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="app-shell-heading text-sm font-semibold">Company</h4>
            <div className="app-shell-muted mt-4 flex flex-col gap-2 text-sm">
              <Link href="/legal" className="hover:text-foreground">Legal</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
