import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { UserPlus, Shield } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

export default function Signup() {
  const [, navigate] = useLocation();
  const { signUpWithPassword, isAuthenticated } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card/60 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-xs text-muted-foreground mt-1">Email/password with verification</p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {notice && <p className="text-xs text-green-400">{notice}</p>}

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              />
            </div>
          </div>

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

          <div>
            <label className="text-xs text-muted-foreground">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            Create account
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
