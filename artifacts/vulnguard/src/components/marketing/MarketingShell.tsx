import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { Github, Linkedin, Moon, Sun, Twitter } from "lucide-react";
import { BrandLogo } from "@/components/branding/BrandLogo";

type MarketingShellProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: ReactNode;
};

const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/features", label: "Features" },
  { href: "/api-docs", label: "API Documentation" },
  { href: "/pricing", label: "Pricing" },
  { href: "/support", label: "Support" },
  { href: "/help-center", label: "Help Center" },
  { href: "/contact", label: "Contact Us" },
  { href: "/legal", label: "Legal" },
];

export function MarketingShell({ title, subtitle, eyebrow, children }: MarketingShellProps) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const initialTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const ctaHref = useMemo(() => (isAuthenticated ? "/dashboard" : "/signup"), [isAuthenticated]);
  const ctaLabel = isAuthenticated ? "Dashboard" : "Start Free";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-foreground/10 blur-[110px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-foreground/5 blur-[90px]" />
        <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-foreground/5 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-4 text-xs font-medium text-muted-foreground lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground ${location === link.href ? "text-foreground" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
              aria-label="Toggle light and dark mode"
              className="rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {!isAuthenticated && (
              <Link href="/login" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block">
                Sign In
              </Link>
            )}
            <Link href={ctaHref} className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-12"
        >
          {eyebrow && (
            <span className="mb-4 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </span>
          )}
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>
        </motion.div>

        {children}
      </main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <BrandLogo textClassName="text-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Enterprise-grade security intelligence for web3 teams shipping high-stakes products.
            </p>
            <div className="mt-4 flex items-center gap-3 text-muted-foreground">
              <a href="https://github.com/IamHammadDevX/VulnGaurd-AI" target="_blank" rel="noreferrer" aria-label="GitHub" className="rounded-md border border-border bg-background p-2 transition-colors hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://x.com/thisis_hammad" target="_blank" rel="noreferrer" aria-label="X" className="rounded-md border border-border bg-background p-2 transition-colors hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/iamhammaddevx" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-md border border-border bg-background p-2 transition-colors hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/product" className="hover:text-foreground">Product</Link>
              <Link href="/features" className="hover:text-foreground">Features</Link>
              <Link href="/api-docs" className="hover:text-foreground">API Documentation</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Support</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/support" className="hover:text-foreground">Support</Link>
              <Link href="/help-center" className="hover:text-foreground">Help Center</Link>
              <Link href="/contact" className="hover:text-foreground">Contact Us</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/legal" className="hover:text-foreground">Legal</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
