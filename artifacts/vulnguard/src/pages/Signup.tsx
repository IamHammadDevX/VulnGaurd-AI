import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Chrome, Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { userEvents } from "@/lib/analytics";
import { AuthShell } from "@/components/layout/AuthShell";

export default function Signup() {
  const [, navigate] = useLocation();
  const { signUpWithPassword, signInWithGoogle, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]+/.test(pass)) return "Password must contain at least one special character.";
    return null;
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    userEvents.signup("google");
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    userEvents.signup("email");
    const result = await signUpWithPassword({
      email: email.trim(),
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setNotice("Signup successful. Check your email for verification.");
  };

  return (
    <AuthShell
      title="Create a secure VulnGuard account"
      subtitle="Start scanning faster with the same dark, premium experience across onboarding and the product workspace."
      backHref="/"
      backLabel="Back to homepage"
    >
      <div className="space-y-5">
        <div>
          <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Create account</p>
          <h2 className="app-shell-heading mt-2 text-2xl font-semibold tracking-tight">Launch your security workspace</h2>
          <p className="app-shell-copy mt-2 text-sm">Use Google or create credentials with email verification.</p>
        </div>

        {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        {notice && <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="app-shell-button flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold duration-300 hover:-translate-y-0.5 disabled:opacity-60"
        >
          <Chrome className="h-4 w-4" />
          Sign up with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="app-shell-muted relative flex justify-center text-[10px] font-semibold uppercase tracking-[0.24em]">
            <span className="app-shell-panel-strong px-3">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="app-shell-copy text-xs font-medium">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/30"
              />
            </div>
            <div>
              <label className="app-shell-copy text-xs font-medium">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/30"
              />
            </div>
          </div>

          <div>
            <label className="app-shell-copy text-xs font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="app-shell-copy text-xs font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 pr-11 text-sm outline-none transition-colors focus:border-emerald-500/30"
                required
              />
              <button
                type="button"
                className="app-shell-muted absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="app-shell-copy text-xs font-medium">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="app-shell-input mt-2 w-full rounded-2xl px-4 py-3 pr-11 text-sm outline-none transition-colors focus:border-emerald-500/30"
                required
              />
              <button
                type="button"
                className="app-shell-muted absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            Create account
          </button>
        </form>

        <p className="app-shell-muted text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground transition-colors hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
