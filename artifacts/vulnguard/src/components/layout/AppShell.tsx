import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BarChart3, ChevronRight, FileScan, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { UserMenu } from "@/components/UserMenu";
import { TeamSwitcher } from "@/components/TeamSwitcher";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/scanner", label: "Scanner", icon: FileScan, blurb: "Run live contract analysis" },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, blurb: "Track posture and trends" },
  { href: "/teams", label: "Teams", icon: Users, blurb: "Manage reviewers and access" },
  { href: "/profile", label: "Profile", icon: ShieldCheck, blurb: "Personal security settings" },
];

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Security Command Center",
    subtitle: "Monitor scan throughput, risk posture, and remediation momentum.",
  },
  "/teams": {
    title: "Team Governance",
    subtitle: "Control roles, access, and workspace membership from one place.",
  },
  "/profile": {
    title: "Profile & Access",
    subtitle: "Keep account details and identity settings aligned with your security workflow.",
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const pageMeta = PAGE_META[location] ?? PAGE_META["/dashboard"];

  return (
    <div className="app-shell-bg min-h-screen text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" />
        <div className="app-shell-grid absolute inset-0" />
        <div className="absolute left-[8%] top-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-6rem] right-[8%] h-80 w-80 rounded-full bg-amber-500/10 blur-[140px]" />
      </div>

      <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="app-shell-sidebar hidden px-5 py-6 lg:flex lg:flex-col lg:gap-8">
          <Link href="/" className="app-shell-panel-soft rounded-2xl px-4 py-3 transition-colors hover:bg-white/[0.05]">
            <BrandLogo showTagline tagline="Deep Security Workspace" />
          </Link>

          <div className="app-shell-panel-soft rounded-[28px] p-3">
            <p className="app-shell-muted px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em]">
              Workspace
            </p>
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-300",
                      active
                        ? "border-emerald-500/30 bg-emerald-500/12 text-foreground shadow-[0_18px_50px_-38px_rgba(16,185,129,0.9)]"
                        : "border-transparent app-shell-copy hover:border-border hover:bg-white/[0.04] hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-2xl border transition-colors",
                        active
                          ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-300"
                          : "app-shell-inset app-shell-muted group-hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="app-shell-muted block truncate text-[11px]">{item.blurb}</span>
                    </span>
                    <ChevronRight className="app-shell-muted h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="app-shell-panel-soft rounded-[28px] p-4">
            <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.28em]">Operator</p>
            <div className="mt-4 flex items-center gap-3">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt=""
                  className="h-11 w-11 rounded-2xl border border-border object-cover"
                />
              ) : (
                <div className="app-shell-inset app-shell-heading grid h-11 w-11 place-items-center rounded-2xl text-sm font-semibold">
                  {(user?.firstName?.[0] ?? user?.email?.[0] ?? "V").toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="app-shell-heading truncate text-sm font-semibold">
                  {user?.firstName ?? "Security Lead"}
                </p>
                <p className="app-shell-muted truncate text-xs">{user?.email}</p>
              </div>
            </div>
            <div className="app-shell-inset app-shell-copy mt-4 rounded-2xl p-3 text-xs">
              Stable navigation and shared controls across account pages in both light and dark modes.
            </div>
          </div>
        </aside>

        <div className="min-h-screen">
          <header className="app-shell-topbar sticky top-0 z-40">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="min-w-0 flex-1">
                <div className="app-shell-muted flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] lg:hidden">
                  <BrandLogo />
                </div>
                <p className="app-shell-heading mt-1 text-xl font-semibold tracking-tight">{pageMeta.title}</p>
                <p className="app-shell-muted text-sm">{pageMeta.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="block sm:block">
                  <TeamSwitcher />
                </div>
                <ThemeToggleButton />
                <UserMenu />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-4 sm:hidden">
              {NAV_ITEMS.map((item) => {
                const active = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                      active
                        ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-300"
                        : "app-shell-button",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
