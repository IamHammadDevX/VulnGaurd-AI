import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { AuthShell } from "@/components/layout/AuthShell";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pass)) return "Must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]+/.test(pass)) return "Must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

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
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 3000);
  };

  return (
    <AuthShell
      title="Set a new password with confidence"
      subtitle="Update credentials inside the same secure visual flow used for the rest of the platform."
      backHref="/login"
      backLabel="Back to login"
    >
      {!success ? (
        <div className="space-y-5">
          <div>
            <div className="mb-4 inline-flex rounded-2xl border border-zinc-800 bg-white/[0.04] p-3 text-zinc-100">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Create a new password</h2>
            <p className="mt-2 text-sm text-zinc-400">Make it strong enough for a high-trust security workspace.</p>
          </div>

          {error && (
            <div className="flex gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">New password</label>
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-100"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-100"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Password requirements</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li className={password.length >= 8 ? "text-emerald-300" : ""}>At least 8 characters</li>
                <li className={/[A-Z]/.test(password) ? "text-emerald-300" : ""}>One uppercase letter</li>
                <li className={/[a-z]/.test(password) ? "text-emerald-300" : ""}>One lowercase letter</li>
                <li className={/[0-9]/.test(password) ? "text-emerald-300" : ""}>One number</li>
                <li className={/[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]+/.test(password) ? "text-emerald-300" : ""}>One special character</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-5 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-500/25 bg-emerald-500/12">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Password updated</h2>
            <p className="mt-2 text-sm text-zinc-400">Your credentials are ready. Redirecting to login now.</p>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
