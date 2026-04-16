import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Github, Mail, KeyRound, Eye, EyeOff, Chrome, Moon, Sun } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { userEvents } from "@/lib/analytics";
import { BrandLogo } from "@/components/branding/BrandLogo";

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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(getMessage(query));

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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Link href="/home" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Back to homepage
          </Link>
          <button
            type="button"
            onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
            aria-label="Toggle light and dark mode"
            className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-2 w-fit">
            <BrandLogo />
          </div>
          <h1 className="text-xl font-bold">Login to VulnGuard AI</h1>
          <p className="text-xs text-muted-foreground mt-1">GitHub, Google, email/password, or magic link</p>
        </div>

        {error && <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
        {notice && <p className="text-xs text-green-500 bg-green-500/10 p-2 rounded">{notice}</p>}

        <div className="space-y-2">
          <button
            onClick={handleGitHub}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60"
          >
            <Github className="w-4 h-4" />
            Continue with GitHub
          </button>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase text-muted-foreground">
            <span className="bg-card px-2">or</span>
          </div>
        </div>

        <form onSubmit={handlePasswordLogin} className="space-y-3" autoComplete="off">
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input text-sm"
              required
              autoComplete="off"
              name="login-email"
            />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs text-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full pl-3 pr-10 py-2 rounded-lg bg-background border border-input text-sm"
                required
                autoComplete="new-password"
                name="login-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-[2px] text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60 mt-4"
          >
            <KeyRound className="w-4 h-4" />
            Sign in with password
          </button>
        </form>

        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-background border border-input text-sm font-medium hover:bg-muted/40 disabled:opacity-60"
        >
          <Mail className="w-4 h-4" />
          Send magic link
        </button>

        <p className="text-xs text-muted-foreground text-center">
          New here? <Link href="/signup" className="text-foreground hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
