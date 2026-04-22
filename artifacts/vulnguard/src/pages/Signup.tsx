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
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Create account</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">Launch your security workspace</h2>
          <p className="mt-2 text-sm text-zinc-400">Use Google or create credentials with email verification.</p>
        </div>

        {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        {notice && <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] disabled:opacity-60"
        >
          <Chrome className="h-4 w-4" />
          Sign up with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            <span className="bg-zinc-950 px-3">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-400">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 pr-11 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-100"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 pr-11 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-100"
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

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-100 transition-colors hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
