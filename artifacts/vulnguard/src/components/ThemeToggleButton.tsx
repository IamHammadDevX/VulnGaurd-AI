import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";

type ThemeToggleButtonProps = {
  className?: string;
};

export function ThemeToggleButton({ className = "" }: ThemeToggleButtonProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const initialTheme: ThemeMode = storedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((mode) => (mode === "dark" ? "light" : "dark"))}
      aria-label="Toggle light and dark mode"
      className={`inline-flex items-center justify-center rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
