import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { UserPlus, Eye, EyeOff, Chrome, Moon, Sun } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { userEvents } from "@/lib/analytics";        
import { BrandLogo } from "@/components/branding/BrandLogo";

export default function Signup() {
  const [, navigate] = useLocation();
  const { signUpWithPassword, signInWithGoogle, isAuthenticated } = useAuth(); 

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass)) return "Password must contain at least one special character.";
    return null;
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
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-xs text-muted-foreground mt-1">Google or email/password with verification</p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {notice && <p className="text-xs text-green-400">{notice}</p>}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60"
        >
          <Chrome className="w-4 h-4" />
          Sign up with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase text-muted-foreground">
            <span className="bg-card px-2">or</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-input text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full pl-3 pr-10 py-2 rounded-lg bg-background border border-input text-sm"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-[2px] text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full pl-3 pr-10 py-2 rounded-lg bg-background border border-input text-sm"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-[2px] text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            Create account
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Already have an account? <Link href="/login" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
