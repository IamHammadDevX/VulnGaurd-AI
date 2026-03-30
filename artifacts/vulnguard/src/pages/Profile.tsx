import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Mail, Shield, Calendar,
  FileCode, LogOut,
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  totalScans: number;
}

export default function Profile() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/user/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setProfile(data.user))
      .catch(() => {});
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
          <User className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Sign in to view your profile</h1>
          <button onClick={login} className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition">
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/6 bg-card/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              Scanner
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm font-semibold">Profile</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-white/6 rounded-xl p-6"
        >
          <div className="flex items-center gap-5">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-20 h-20 rounded-full border-2 border-primary/30" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email ?? "No email"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 border border-white/6 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <FileCode className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Total Scans</span>
            </div>
            <p className="text-3xl font-bold">{profile?.totalScans ?? 0}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card/50 border border-white/6 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Member Since</span>
            </div>
            <p className="text-lg font-medium">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 border border-white/6 rounded-xl p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Subscription</p>
              <p className="text-xs text-muted-foreground">Free tier</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            FREE
          </span>
        </motion.div>

        <div className="pt-4 border-t border-white/6">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}
