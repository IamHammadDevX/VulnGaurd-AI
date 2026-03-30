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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/20 text-primary text-xs font-bold transition-colors"
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
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors"
      >
        {user?.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="w-5 h-5 rounded-full" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline max-w-[100px] truncate">
          {user?.firstName ?? user?.email ?? "User"}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-white/10 rounded-xl shadow-xl z-[99] py-1 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/6">
            <p className="text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition"
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </Link>
          <Link
            href="/teams"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition"
          >
            <Users className="w-3.5 h-3.5" />
            Teams
          </Link>
          <div className="border-t border-white/6 mt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 w-full transition"
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
