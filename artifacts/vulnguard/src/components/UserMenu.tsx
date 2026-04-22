import { useState, useRef, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { User, BarChart3, Users, LogOut, LogIn, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/15"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Log in</span>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="app-shell-button flex items-center gap-2 rounded-full px-2 py-1.5"
      >
        {user?.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="h-7 w-7 rounded-full border border-border object-cover" />
        ) : (
          <span className="app-shell-inset app-shell-copy grid h-7 w-7 place-items-center rounded-full">
            <User className="h-3.5 w-3.5" />
          </span>
        )}
        <span className="app-shell-copy hidden max-w-[120px] truncate text-xs font-medium sm:inline">
          {user?.firstName ?? user?.email ?? "User"}
        </span>
        <ChevronDown className="app-shell-muted h-3 w-3" />
      </button>

      {open && (
        <div className="app-shell-panel-strong absolute right-0 top-full z-[99] mt-2 w-56 overflow-hidden rounded-3xl py-2">
          <div className="border-b border-border px-4 py-3">
            <p className="app-shell-heading truncate text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
            <p className="app-shell-muted truncate text-xs">{user?.email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="app-shell-copy flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition hover:bg-white/[0.04]"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="app-shell-copy flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition hover:bg-white/[0.04]"
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </Link>
          <Link
            href="/teams"
            onClick={() => setOpen(false)}
            className="app-shell-copy flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition hover:bg-white/[0.04]"
          >
            <Users className="w-3.5 h-3.5" />
            Teams
          </Link>
          <div className="mt-1 border-t border-border">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
