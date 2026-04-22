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
      className={`app-shell-button inline-flex items-center justify-center rounded-full p-2 ${className}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
