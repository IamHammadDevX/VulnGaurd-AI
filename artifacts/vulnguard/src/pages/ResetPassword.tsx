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
            <div className="app-shell-inset app-shell-heading mb-4 inline-flex rounded-2xl p-3">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="app-shell-heading text-2xl font-semibold tracking-tight">Create a new password</h2>
            <p className="app-shell-copy mt-2 text-sm">Make it strong enough for a high-trust security workspace.</p>
          </div>

          {error && (
            <div className="flex gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="app-shell-copy text-xs font-medium">New password</label>
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="app-shell-muted absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="app-shell-muted absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="app-shell-panel-soft rounded-2xl p-4">
              <p className="app-shell-muted text-xs font-semibold uppercase tracking-[0.24em]">Password requirements</p>
              <ul className="app-shell-copy mt-3 space-y-2 text-sm">
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
            <h2 className="app-shell-heading text-2xl font-semibold tracking-tight">Password updated</h2>
            <p className="app-shell-copy mt-2 text-sm">Your credentials are ready. Redirecting to login now.</p>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
