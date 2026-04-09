import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card/60 border border-white/10 rounded-2xl p-6 space-y-4">
        {/* Back Button */}
        <Link href="/login" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Back to Login
        </Link>

        {!submitted ? (
          <>
            <div className="text-center">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Reset Password</h1>
              <p className="text-xs text-muted-foreground mt-1">Enter your email to receive a reset link</p>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center animate-in">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold">Check your email</h2>
              <p className="text-xs text-muted-foreground mt-2">
                We've sent a password reset link to <span className="text-foreground font-semibold">{email}</span>
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-left">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-blue-400">💡 Tip:</span> The link expires in 24 hours. If you don't see the email, check your spam folder.
              </p>
            </div>

            <button
              onClick={() => {
                setEmail("");
                setSubmitted(false);
              }}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/8 transition-colors"
            >
              Try Another Email
            </button>

            <Link
              href="/login"
              className="block px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors text-center"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
