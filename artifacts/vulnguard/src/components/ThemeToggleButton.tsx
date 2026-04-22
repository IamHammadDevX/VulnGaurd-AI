import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getStoredThemeMode, setStoredThemeMode, type ThemeMode } from "@/lib/theme";

type ThemeToggleButtonProps = {
  className?: string;
};

export function ThemeToggleButton({ className = "" }: ThemeToggleButtonProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const initialTheme = getStoredThemeMode();
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    setStoredThemeMode(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((mode) => (mode === "dark" ? "light" : "dark"))}
      aria-label="Toggle light and dark mode"
      className={`inline-flex items-center justify-center rounded-full border border-zinc-800/80 bg-white/[0.04] p-2 text-zinc-400 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-white/[0.07] hover:text-zinc-100 ${className}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
