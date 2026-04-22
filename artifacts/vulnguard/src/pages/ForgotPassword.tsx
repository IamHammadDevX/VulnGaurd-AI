import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { CheckCircle2, Mail, Shield } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { AuthShell } from "@/components/layout/AuthShell";

export default function ForgotPassword() {
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
    <AuthShell
      title="Recover access without leaving the secure flow"
      subtitle="Send a reset link and continue in the same deep-security interface used throughout the product."
      backHref="/login"
      backLabel="Back to login"
    >
      {!submitted ? (
        <div className="space-y-5">
          <div>
            <div className="mb-4 inline-flex rounded-2xl border border-zinc-800 bg-white/[0.04] p-3 text-zinc-100">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Reset your password</h2>
            <p className="mt-2 text-sm text-zinc-400">Enter your email and we’ll send a secure reset link.</p>
          </div>

          {error && <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18 disabled:opacity-60"
            >
              <Mail className="h-4 w-4" />
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-zinc-100 transition-colors hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-5 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-500/25 bg-emerald-500/12">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Check your inbox</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              We sent a password reset link to <span className="font-medium text-zinc-100">{email}</span>.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-white/[0.03] p-4 text-left text-sm text-zinc-400">
            The link expires in 24 hours. If you don't see it, check spam or request another email.
          </div>
          <button
            onClick={() => {
              setEmail("");
              setSubmitted(false);
            }}
            className="w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06]"
          >
            Try another email
          </button>
          <Link
            href="/login"
            className="block rounded-2xl border border-emerald-500/30 bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/18"
          >
            Back to login
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
