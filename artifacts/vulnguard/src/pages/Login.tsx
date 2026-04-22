import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Chrome, Eye, EyeOff, Github, KeyRound, Mail } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { userEvents } from "@/lib/analytics";
import { AuthShell } from "@/components/layout/AuthShell";

function getMessage(query: URLSearchParams): string {
  if (query.get("verified") === "1") {
    return "Email verified. You can sign in now.";
  }
  if (query.get("magic") === "sent") {
    return "Magic link sent. Check your inbox.";
  }
  return "";
}

export default function Login() {
  const [, navigate] = useLocation();
  const {
    signInWithGitHub,
    signInWithGoogle,
    signInWithPassword,
    signInWithMagicLink,
    isAuthenticated,
  } = useAuth();

  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(getMessage(query));

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleGitHub = async () => {
    setError("");
    setLoading(true);
    userEvents.login("github");
    const result = await signInWithGitHub();
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    userEvents.login("google");
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    userEvents.login("email");
    const result = await signInWithPassword(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate("/dashboard");
  };

  const handleMagicLink = async () => {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);
    userEvents.login("magic-link");
    const result = await signInWithMagicLink(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setNotice("Magic link sent. Check your inbox.");
  };

  return (
    <AuthShell
      title="Sign in to your vulnerability workspace"
      subtitle="Access scan history, teams, and reports through a calmer, higher-trust security experience."
      backHref="/"
      backLabel="Back to homepage"
    >
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Welcome back</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Choose your sign-in method</h2>
          <p className="mt-2 text-sm text-zinc-400">GitHub, Google, email/password, or a one-time magic link.</p>
        </div>

        {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        {notice && <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <div className="grid gap-3">
          <button
            onClick={handleGitHub}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] disabled:opacity-60"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] disabled:opacity-60"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            <span className="bg-zinc-950 px-3">or use email</span>
          </div>
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
              required
              autoComplete="off"
              name="login-email"
            />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-zinc-300 transition-colors hover:text-zinc-50">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 pr-11 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
                required
                autoComplete="new-password"
                name="login-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-100"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18 disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            Sign in with password
          </button>
        </form>

        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:opacity-60"
        >
          <Mail className="h-4 w-4" />
          Send magic link
        </button>

        <p className="text-center text-sm text-zinc-500">
          New here?{" "}
          <Link href="/signup" className="font-medium text-zinc-100 transition-colors hover:text-emerald-300">
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
