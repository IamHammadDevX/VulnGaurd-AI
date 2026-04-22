import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Clock,
  Download,
  FileCode,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardStats {
  totalScansThisMonth: number;
  totalScansAllTime: number;
  totalVulnerabilities: number;
  averageRiskScore: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  teamMembers: number;
  apiCallsUsed: number;
  costSaved: number;
}

interface TrendPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  avgRisk: number;
}

interface ScanRecord {
  id: string;
  contractName: string;
  riskScore: number;
  issueCount: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

const SEVERITY_BADGES: Record<string, string> = {
  critical: "border-rose-500/25 bg-rose-500/12 text-rose-300",
  high: "border-amber-500/25 bg-amber-500/12 text-amber-300",
  medium: "border-zinc-700 bg-white/[0.04] text-zinc-200",
  low: "border-emerald-500/25 bg-emerald-500/12 text-emerald-300",
};

const ACTIVITY_ICON: Record<string, typeof Activity> = {
  scan: FileCode,
  team_scan: FileCode,
  team_join: UserPlus,
};

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Activity;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="rounded-[28px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-5 shadow-[0_30px_90px_-52px_rgba(0,0,0,1)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-50">{value}</p>
          {hint && <p className="mt-2 text-sm text-zinc-500">{hint}</p>}
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl border border-current/10 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 text-xs text-zinc-100 shadow-[0_24px_80px_-48px_rgba(0,0,0,1)] backdrop-blur-xl">
      <p className="mb-2 font-semibold text-zinc-300">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="capitalize text-zinc-400">{entry.name}</span>
          <span className="font-semibold text-zinc-100">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "risk">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [searchInput, setSearchInput] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/user/dashboard/stats", { credentials: "include" });
      const data = await response.json();
      setStats(data.stats);
    } catch {}
  }, []);

  const fetchTrend = useCallback(async () => {
    try {
      const response = await fetch("/api/user/dashboard/trend", { credentials: "include" });
      const data = await response.json();
      setTrend(Array.isArray(data?.trend) ? data.trend : []);
    } catch {}
  }, []);

  const fetchScans = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sortBy,
        sortDir,
      });

      if (search) params.set("search", search);
      const response = await fetch(`/api/user/scans?${params}`, { credentials: "include" });
      const data = await response.json();
      setScans(data.scans ?? []);
      setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {}
  }, [search, sortBy, sortDir]);

  const fetchActivity = useCallback(async () => {
    try {
      const response = await fetch("/api/user/dashboard/activity", { credentials: "include" });
      const data = await response.json();
      setActivities(data.activities ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    Promise.all([fetchStats(), fetchTrend(), fetchScans(), fetchActivity()]).finally(() => {
      setLoading(false);
    });
  }, [isAuthenticated, fetchStats, fetchTrend, fetchScans, fetchActivity]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchScans(1);
  }, [search, sortBy, sortDir, isAuthenticated, fetchScans]);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/user/scans/export", { credentials: "include" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `vulnguard-scans-${new Date().toISOString().split("T")[0]}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-sm rounded-[32px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-zinc-200" />
          <h2 className="mt-4 text-2xl font-semibold text-zinc-50">Sign in to view your dashboard</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Track scan history, manage teams, and access your security reports.
          </p>
          <button
            onClick={login}
            className="mt-6 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all hover:-translate-y-0.5"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Executive summary</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Welcome back, {user?.firstName ?? "security lead"}.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
            Your scan command center now presents risk and activity in a calmer, more premium dashboard. Review posture at a glance and drill into scan history when needed.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Month-to-date scans</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-50">{stats?.totalScansThisMonth ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Average risk</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">{stats?.averageRiskScore ?? 0}/100</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Critical findings</p>
              <p className="mt-2 text-2xl font-semibold text-rose-300">{stats?.criticalIssues ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Quick actions</p>
          <div className="mt-5 space-y-3">
            <Link
              href="/scanner"
              className="flex items-center justify-between rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-4 text-sm font-semibold text-emerald-200 transition-all hover:-translate-y-0.5"
            >
              <span>Run a new security scan</span>
              <Zap className="h-4 w-4" />
            </Link>
            <Link
              href="/teams"
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-zinc-100 transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]"
            >
              <span>Review team access</span>
              <Users className="h-4 w-4" />
            </Link>
            <button
              onClick={handleExport}
              className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-zinc-100 transition-all hover:-translate-y-0.5 hover:bg-white/[0.05]"
            >
              <span>Export scan history</span>
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Scans all time" value={stats?.totalScansAllTime ?? 0} hint="Historical runs" icon={FileCode} accent="bg-emerald-500/12 text-emerald-300" delay={0.02} />
        <MetricCard label="Vulnerabilities found" value={stats?.totalVulnerabilities ?? 0} hint="Across all scans" icon={AlertTriangle} accent="bg-amber-500/12 text-amber-300" delay={0.06} />
        <MetricCard label="Team members" value={stats?.teamMembers ?? 0} hint="Active workspace users" icon={Users} accent="bg-white/[0.06] text-zinc-100" delay={0.1} />
        <MetricCard label="Audit cost saved" value={`$${((stats?.costSaved ?? 0) / 1000).toFixed(1)}k`} hint="Versus manual audit cycles" icon={ShieldCheck} accent="bg-emerald-500/12 text-emerald-300" delay={0.14} />
      </section>

      <section className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Trend monitor</p>
            <h2 className="text-xl font-semibold text-zinc-50">Vulnerability trend in the last 30 days</h2>
          </div>
        </div>

        <div className="mt-6 h-[320px]">
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="criticalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="highFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mediumFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4d4d8" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#d4d4d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(161,161,170,0.9)", fontSize: 11 }}
                  stroke="rgba(255,255,255,0.08)"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  interval={4}
                />
                <YAxis tick={{ fill: "rgba(161,161,170,0.9)", fontSize: 11 }} stroke="rgba(255,255,255,0.08)" allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#a1a1aa" }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#f43f5e" fill="url(#criticalFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="url(#highFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="#d4d4d8" fill="url(#mediumFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="low" stackId="1" stroke="#10b981" fill="url(#lowFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-zinc-800 text-sm text-zinc-500">
              No scan data in the last 30 days
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 border-b border-zinc-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Scan history</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-50">Recent contracts and risk posture</h2>
            </div>
            <Link
              href="/scanner"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-800 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-100 transition-all hover:-translate-y-0.5 hover:bg-white/[0.06] sm:w-auto"
            >
              New scan
              <Zap className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:px-8">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
                className="w-full rounded-full border border-zinc-800 bg-white/[0.03] py-3 pl-11 pr-11 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSearch(searchInput)}
              className="w-full rounded-full border border-emerald-500/30 bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-200 transition-all hover:-translate-y-0.5 sm:w-auto"
            >
              Search
            </button>
            <button
              onClick={handleExport}
              className="w-full rounded-full border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-100 transition-all hover:-translate-y-0.5 hover:bg-white/[0.06] sm:w-auto"
            >
              Export CSV
            </button>
          </div>

          <div className="hidden grid-cols-[1.5fr_0.7fr_0.9fr_0.7fr] gap-4 border-y border-zinc-800 bg-white/[0.03] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500 sm:grid sm:px-8">
            <span>Contract</span>
            <button onClick={() => {
              if (sortBy === "date") setSortDir((value) => (value === "desc" ? "asc" : "desc"));
              else {
                setSortBy("date");
                setSortDir("desc");
              }
            }} className="flex items-center gap-1">
              Date
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <span>Issues</span>
            <button onClick={() => {
              if (sortBy === "risk") setSortDir((value) => (value === "desc" ? "asc" : "desc"));
              else {
                setSortBy("risk");
                setSortDir("desc");
              }
            }} className="flex items-center gap-1">
              Risk
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          {scans.length === 0 ? (
            <div className="px-6 py-16 text-center sm:px-8">
              <ShieldCheck className="mx-auto h-10 w-10 text-zinc-600" />
              <p className="mt-4 text-sm text-zinc-400">{search ? "No scans match your search." : "No scans yet. Run your first scan to populate this workspace."}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {scans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.35 }}
                  className="grid gap-3 px-6 py-4 sm:grid-cols-[1.5fr_0.7fr_0.9fr_0.7fr] sm:items-center sm:px-8"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950">
                        {scan.riskScore >= 70 ? (
                          <ShieldAlert className="h-4 w-4 text-rose-300" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-100 sm:whitespace-normal sm:break-words">{scan.contractName}</p>
                        <p className="text-xs text-zinc-500">{scan.issueCount} total issues surfaced</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 sm:text-left">{formatDate(scan.createdAt)}</p>
                  <div className="flex flex-wrap gap-2">
                    {scan.critical > 0 && <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${SEVERITY_BADGES.critical}`}>{scan.critical} critical</span>}
                    {scan.high > 0 && <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${SEVERITY_BADGES.high}`}>{scan.high} high</span>}
                    {scan.medium > 0 && <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${SEVERITY_BADGES.medium}`}>{scan.medium} medium</span>}
                    {scan.low > 0 && <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${SEVERITY_BADGES.low}`}>{scan.low} low</span>}
                    {scan.issueCount === 0 && <span className="rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2 py-1 text-[11px] font-semibold text-emerald-300">Clean</span>}
                  </div>
                  <div className="sm:text-right">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
                      scan.riskScore >= 80
                        ? "border-rose-500/25 bg-rose-500/12 text-rose-300"
                        : scan.riskScore >= 50
                        ? "border-amber-500/25 bg-amber-500/12 text-amber-300"
                        : scan.riskScore >= 25
                        ? "border-zinc-700 bg-white/[0.04] text-zinc-200"
                        : "border-emerald-500/25 bg-emerald-500/12 text-emerald-300"
                    }`}>
                      {scan.riskScore}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl">
          <div className="border-b border-zinc-800 px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Activity stream</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-50">Latest security events</h2>
          </div>

          {activities.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Clock className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-4 text-sm text-zinc-400">No recent activity</p>
            </div>
          ) : (
            <div className="max-h-[640px] divide-y divide-zinc-800 overflow-y-auto scrollbar-custom">
              {activities.map((activity, index) => {
                const Icon = ACTIVITY_ICON[activity.type] ?? Activity;
                const isRisky = activity.meta?.riskScore != null && Number(activity.meta.riskScore) >= 70;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.35 }}
                    className="px-6 py-4"
                  >
                    <div className="flex gap-3">
                      <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${
                        isRisky
                          ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
                          : "border-zinc-800 bg-zinc-950 text-zinc-200"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-6 text-zinc-300">{activity.message}</p>
                        <p className="mt-2 text-xs text-zinc-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
