import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "liwei-portfolio-theme";
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";
const THEME_COLORS: Record<Theme, string> = {
  dark: "#030507",
  light: "#f5f6f4",
};

type ThemePreference = {
  theme: Theme;
  manual: boolean;
};

const parseTheme = (value: string | null): Theme | null =>
  value === "light" || value === "dark" ? value : null;

const getSystemTheme = (): Theme =>
  typeof window !== "undefined" && window.matchMedia(SYSTEM_QUERY).matches
    ? "dark"
    : "light";

const readPreference = (): ThemePreference => {
  let savedTheme: Theme | null = null;

  try {
    savedTheme = parseTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // A blocked storage area should not prevent the theme from working.
  }

  return {
    theme: savedTheme ?? getSystemTheme(),
    manual: savedTheme !== null,
  };
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const color = THEME_COLORS[theme];

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.style.backgroundColor = color;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
};

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);

  useEffect(() => {
    applyTheme(preference.theme);
  }, [preference.theme]);

  useEffect(() => {
    const systemPreference = window.matchMedia(SYSTEM_QUERY);
    const handleSystemChange = (event: MediaQueryListEvent) => {
      setPreference((current) =>
        current.manual
          ? current
          : { theme: event.matches ? "dark" : "light", manual: false },
      );
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) {
        return;
      }

      try {
        if (event.storageArea && event.storageArea !== window.localStorage) {
          return;
        }
      } catch {
        return;
      }

      const savedTheme = parseTheme(event.key === null ? null : event.newValue);
      setPreference({
        theme: savedTheme ?? getSystemTheme(),
        manual: savedTheme !== null,
      });
    };

    systemPreference.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      systemPreference.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = preference.theme === "dark" ? "light" : "dark";

    setPreference({ theme: nextTheme, manual: true });
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Keep the explicit choice for this visit even when it cannot be saved.
    }
  }, [preference.theme]);

  return { theme: preference.theme, toggleTheme };
}
