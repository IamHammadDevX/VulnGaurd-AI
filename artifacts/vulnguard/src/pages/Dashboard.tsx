import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Clock, BarChart3, ArrowLeft, AlertTriangle,
  ShieldCheck, ShieldAlert, Activity, FileCode, Users,
  Zap, DollarSign, Search, ChevronLeft, ChevronRight,
  ArrowUpDown, Download, Filter, X, TrendingUp,
  UserPlus, Eye, Trash2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
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
  contractHash: string;
  riskScore: number;
  status: string;
  issueCount: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  executionTime: number | null;
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

const RISK_COLOR = (score: number) => {
  if (score >= 80) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-green-400";
};

const RISK_BG = (score: number) => {
  if (score >= 80) return "bg-red-500/15 text-red-400";
  if (score >= 50) return "bg-orange-500/15 text-orange-400";
  if (score >= 25) return "bg-yellow-500/15 text-yellow-400";
  return "bg-green-500/15 text-green-400";
};

const SEV_BADGE: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
};

const ACTIVITY_ICON: Record<string, typeof Activity> = {
  scan: FileCode,
  team_scan: FileCode,
  team_join: UserPlus,
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
  delay,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
  color: string;
  subtitle?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05 }}
      className="bg-card/50 border border-white/6 rounded-xl p-4 flex items-center gap-3.5"
    >
      <div className={`p-2.5 rounded-lg bg-white/5 shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-white/10 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80 capitalize">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
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
      const r = await fetch("/api/user/dashboard/stats", { credentials: "include" });
      const data = await r.json();
      setStats(data.stats);
    } catch {}
  }, []);

  const fetchTrend = useCallback(async () => {
    try {
      const r = await fetch("/api/user/dashboard/trend", { credentials: "include" });
      const data = await r.json();
      setTrend(data.trend);
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
      const r = await fetch(`/api/user/scans?${params}`, { credentials: "include" });
      const data = await r.json();
      setScans(data.scans ?? []);
      setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {}
  }, [search, sortBy, sortDir]);

  const fetchActivity = useCallback(async () => {
    try {
      const r = await fetch("/api/user/dashboard/activity", { credentials: "include" });
      const data = await r.json();
      setActivities(data.activities ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([fetchStats(), fetchTrend(), fetchScans(), fetchActivity()]).finally(() =>
      setLoading(false),
    );
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchScans(1);
  }, [search, sortBy, sortDir, isAuthenticated]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleExport = async () => {
    try {
      const r = await fetch("/api/user/scans/export", { credentials: "include" });
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vulnguard-scans-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const toggleSort = (field: "date" | "risk") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    /* placeholder — scan deletion not implemented on backend */
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <Shield className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Sign in to view your dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Track your scan history, manage teams, and access your security reports.
          </p>
          <button
            onClick={login}
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/6 bg-card/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Scanner
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            {user?.profileImageUrl && (
              <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="text-sm text-muted-foreground">
              {user?.firstName ?? user?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName ?? "there"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's an overview of your smart contract security scans.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Section A: Statistics Cards */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Scans This Month"
                  value={stats?.totalScansThisMonth ?? 0}
                  icon={FileCode}
                  color="text-primary"
                  subtitle={`${stats?.totalScansAllTime ?? 0} all time`}
                  delay={0}
                />
                <StatCard
                  label="Vulnerabilities Found"
                  value={stats?.totalVulnerabilities ?? 0}
                  icon={AlertTriangle}
                  color="text-orange-400"
                  delay={1}
                />
                <StatCard
                  label="Avg Risk Score"
                  value={stats?.averageRiskScore ?? 0}
                  icon={Activity}
                  color={
                    (stats?.averageRiskScore ?? 0) >= 50
                      ? "text-orange-400"
                      : "text-green-400"
                  }
                  delay={2}
                />
                <StatCard
                  label="Critical Issues"
                  value={stats?.criticalIssues ?? 0}
                  icon={ShieldAlert}
                  color="text-red-400"
                  subtitle={`${stats?.highIssues ?? 0} high`}
                  delay={3}
                />
                <StatCard
                  label="Medium Issues"
                  value={stats?.mediumIssues ?? 0}
                  icon={Shield}
                  color="text-yellow-400"
                  subtitle={`${stats?.lowIssues ?? 0} low`}
                  delay={4}
                />
                <StatCard
                  label="Team Members"
                  value={stats?.teamMembers ?? 0}
                  icon={Users}
                  color="text-violet-400"
                  delay={5}
                />
                <StatCard
                  label="API Calls Used"
                  value={stats?.apiCallsUsed ?? 0}
                  icon={Zap}
                  color="text-blue-400"
                  delay={6}
                />
                <StatCard
                  label="Audit Cost Saved"
                  value={`$${((stats?.costSaved ?? 0) / 1000).toFixed(1)}k`}
                  icon={DollarSign}
                  color="text-green-400"
                  subtitle="vs. manual audit"
                  delay={7}
                />
              </div>
            </section>

            {/* Section B: Risk Trend Chart */}
            <section>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card/50 border border-white/6 rounded-xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-sm">Vulnerability Trend (30 Days)</h2>
                </div>
                <div className="p-4 h-72">
                  {trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trend}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradMedium" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradLow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                          tickFormatter={(v) => {
                            const d = new Date(v);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                          interval={4}
                          stroke="rgba(255,255,255,0.08)"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
                          stroke="rgba(255,255,255,0.08)"
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: "11px" }}
                          iconType="circle"
                          iconSize={8}
                        />
                        <Area
                          type="monotone"
                          dataKey="critical"
                          stackId="1"
                          stroke="#ef4444"
                          fill="url(#gradCritical)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="high"
                          stackId="1"
                          stroke="#f97316"
                          fill="url(#gradHigh)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="medium"
                          stackId="1"
                          stroke="#eab308"
                          fill="url(#gradMedium)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="low"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="url(#gradLow)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No scan data in the last 30 days
                    </div>
                  )}
                </div>
              </motion.div>
            </section>

            {/* Section C + D: Scans Table and Activity side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section C: Scans Table */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-card/50 border border-white/6 rounded-xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Scan History
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition px-2.5 py-1.5 rounded-lg border border-white/8 hover:border-white/15"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                      <Link
                        href="/"
                        className="text-xs text-primary hover:underline"
                      >
                        New Scan
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search contracts..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full pl-8 pr-8 py-2 bg-white/5 border border-white/8 rounded-lg text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                      />
                      {searchInput && (
                        <button
                          onClick={() => {
                            setSearchInput("");
                            setSearch("");
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-3 py-2 bg-primary/20 text-primary text-xs rounded-lg hover:bg-primary/30 transition"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 text-[11px] text-muted-foreground uppercase tracking-wider border-b border-white/4 bg-white/[0.02]">
                  <span>Contract</span>
                  <button
                    onClick={() => toggleSort("date")}
                    className="flex items-center gap-1 hover:text-white transition"
                  >
                    Date
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "date" ? "text-primary" : ""}`} />
                  </button>
                  <span className="text-center">Issues</span>
                  <button
                    onClick={() => toggleSort("risk")}
                    className="flex items-center gap-1 hover:text-white transition"
                  >
                    Risk
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "risk" ? "text-primary" : ""}`} />
                  </button>
                </div>

                {/* Table Body */}
                {scans.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <ShieldCheck className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-muted-foreground text-sm">
                      {search ? "No scans match your search" : "No scans yet. Run your first scan!"}
                    </p>
                    {!search && (
                      <Link href="/" className="inline-block text-xs text-primary hover:underline">
                        Go to Scanner
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-white/4">
                    <AnimatePresence>
                      {scans.map((scan, i) => (
                        <motion.div
                          key={scan.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 hover:bg-white/3 transition group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded bg-white/5 shrink-0">
                                {scan.riskScore >= 70 ? (
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                                )}
                              </div>
                              <p className="text-sm font-medium truncate">{scan.contractName}</p>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(scan.createdAt)}
                          </div>

                          <div className="flex items-center gap-1">
                            {scan.critical > 0 && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${SEV_BADGE.critical}`}>
                                {scan.critical}C
                              </span>
                            )}
                            {scan.high > 0 && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${SEV_BADGE.high}`}>
                                {scan.high}H
                              </span>
                            )}
                            {scan.medium > 0 && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${SEV_BADGE.medium}`}>
                                {scan.medium}M
                              </span>
                            )}
                            {scan.low > 0 && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${SEV_BADGE.low}`}>
                                {scan.low}L
                              </span>
                            )}
                            {scan.issueCount === 0 && (
                              <span className="text-[10px] text-green-400/60">Clean</span>
                            )}
                          </div>

                          <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${RISK_BG(scan.riskScore)}`}>
                            {scan.riskScore}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1}–
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => fetchScans(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => fetchScans(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                              pageNum === pagination.page
                                ? "bg-primary text-white"
                                : "hover:bg-white/5 text-muted-foreground"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => fetchScans(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Section D: Team Activity Log */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card/50 border border-white/6 rounded-xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/6">
                  <h2 className="font-semibold text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Activity Log
                  </h2>
                </div>
                {activities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs">No recent activity</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/4 max-h-[480px] overflow-y-auto">
                    {activities.map((activity, i) => {
                      const Icon = ACTIVITY_ICON[activity.type] ?? Activity;
                      const isRisky =
                        activity.meta?.riskScore != null &&
                        (activity.meta.riskScore as number) >= 70;
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="px-4 py-3 hover:bg-white/3 transition"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                isRisky ? "bg-red-500/10" : "bg-white/5"
                              }`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 ${
                                  isRisky ? "text-red-400" : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-white/80 leading-relaxed">
                                {activity.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
