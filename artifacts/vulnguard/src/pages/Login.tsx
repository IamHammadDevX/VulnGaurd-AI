import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Github, Mail, KeyRound, Shield } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

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
    signInWithPassword,
    signInWithMagicLink,
    isAuthenticated,
  } = useAuth();

  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const result = await signInWithGitHub();
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
    const result = await signInWithMagicLink(email.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice("Magic link sent. Check your inbox.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card/60 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Login to VulnGuard</h1>
          <p className="text-xs text-muted-foreground mt-1">GitHub, email/password, or magic link</p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {notice && <p className="text-xs text-green-400">{notice}</p>}

        <button
          onClick={handleGitHub}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase text-muted-foreground">
            <span className="bg-card px-2">or</span>
          </div>
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            <KeyRound className="w-4 h-4" />
            Sign in with password
          </button>
        </form>

        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 disabled:opacity-60"
        >
          <Mail className="w-4 h-4" />
          Send magic link
        </button>

        <p className="text-xs text-muted-foreground text-center">
          New here? <Link href="/signup" className="text-primary hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
