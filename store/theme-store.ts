import { create } from "zustand";

export type Theme = "dark" | "light" | "system";

export const THEME_STORAGE_KEY = "evntech-theme";

function applyTheme(theme: Theme): void {
  const prefersLight =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: light)").matches;
  const isLight = theme === "light" || (theme === "system" && prefersLight);
  document.documentElement.classList.toggle("dark", !isLight);
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "system" ? stored : "dark";
}

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  hydrate: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  // Dark is the default experience (guides/50_CANONICAL_DECISIONS.md §1.4).
  theme: "dark",
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  hydrate: () => {
    const stored = getStoredTheme();
    applyTheme(stored);
    set({ theme: stored });
  },
}));
