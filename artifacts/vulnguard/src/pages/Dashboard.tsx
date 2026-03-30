import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, Clock, BarChart3, ArrowLeft, AlertTriangle,
  ShieldCheck, ShieldAlert, Activity, FileCode,
} from "lucide-react";

interface ScanRecord {
  id: string;
  contractName: string;
  contractHash: string;
  riskScore: number;
  status: string;
  executionTime: number | null;
  createdAt: string;
}

const RISK_COLOR = (score: number) => {
  if (score >= 80) return "text-red-400 bg-red-500/15";
  if (score >= 50) return "text-orange-400 bg-orange-500/15";
  if (score >= 25) return "text-yellow-400 bg-yellow-500/15";
  return "text-green-400 bg-green-500/15";
};

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/user/scans", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setScans(data.scans ?? []);
        setLoadingScans(false);
      })
      .catch(() => setLoadingScans(false));
  }, [isAuthenticated]);

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
          <button onClick={login} className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition">
            Log in
          </button>
        </div>
      </div>
    );
  }

  const totalScans = scans.length;
  const avgRisk = totalScans > 0 ? Math.round(scans.reduce((s, sc) => s + sc.riskScore, 0) / totalScans) : 0;
  const highRiskCount = scans.filter((s) => s.riskScore >= 70).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/6 bg-card/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition text-sm">
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
            <span className="text-sm text-muted-foreground">{user?.firstName ?? user?.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.firstName ?? "there"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's an overview of your smart contract security scans.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Scans", value: totalScans, icon: FileCode, color: "text-primary" },
            { label: "Avg Risk Score", value: avgRisk, icon: Activity, color: avgRisk >= 50 ? "text-orange-400" : "text-green-400" },
            { label: "High Risk", value: highRiskCount, icon: AlertTriangle, color: "text-red-400" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/50 border border-white/6 rounded-xl p-5 flex items-center gap-4"
            >
              <div className="p-2.5 rounded-lg bg-white/5">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-card/50 border border-white/6 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Scan History
            </h2>
            <Link href="/" className="text-xs text-primary hover:underline">
              New Scan
            </Link>
          </div>
          {loadingScans ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Loading scans...</div>
          ) : scans.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">No scans yet. Run your first scan!</p>
              <Link href="/" className="inline-block text-xs text-primary hover:underline">
                Go to Scanner
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {scans.slice().reverse().map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-white/3 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
                      {scan.riskScore >= 70 ? (
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{scan.contractName}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(scan.createdAt).toLocaleDateString()} ·{" "}
                        {scan.executionTime ? `${(scan.executionTime / 1000).toFixed(1)}s` : "—"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${RISK_COLOR(scan.riskScore)}`}>
                    {scan.riskScore}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
