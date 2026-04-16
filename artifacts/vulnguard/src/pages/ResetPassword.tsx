import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Shield, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

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
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass)) return "Must contain at least one special character.";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 space-y-4">
        {!success ? (
          <>
            <div className="text-center">
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Create New Password</h1>
              <p className="text-xs text-muted-foreground mt-1">Enter your new password below</p>
            </div>

            {error && (
              <div className="flex gap-2 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full pl-3 pr-10 py-2 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/20 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full pl-3 pr-10 py-2 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/20 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Password requirements:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li className={password.length >= 8 ? "text-green-400" : ""}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? "text-green-400" : ""}>
                    ✓ One uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(password) ? "text-green-400" : ""}>
                    ✓ One lowercase letter (a-z)
                  </li>
                  <li className={/[0-9]/.test(password) ? "text-green-400" : ""}>
                    ✓ One number (0-9)
                  </li>
                  <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password) ? "text-green-400" : ""}>
                    ✓ One special character (!@#$%^&*, etc.)
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60 transition-colors"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center animate-in">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold">Password Reset Successful!</h2>
              <p className="text-xs text-muted-foreground mt-2">
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
