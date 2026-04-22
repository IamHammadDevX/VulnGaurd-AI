export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

export function setStoredThemeMode(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyThemeMode(mode);
}

export function initializeThemeMode() {
  applyThemeMode(getStoredThemeMode());
}

