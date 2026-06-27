"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "disk-drive-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function normalizePreference(value) {
  if (value === "dark") return "dark";
  if (value === "light") return "light";
  return getSystemTheme();
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

const ThemeCtx = createContext({
  theme: "light",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = normalizePreference(localStorage.getItem(STORAGE_KEY));
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = useCallback((next) => {
    const value = next === "dark" ? "dark" : "light";
    setThemeState(value);
    localStorage.setItem(STORAGE_KEY, value);
    applyTheme(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider
      value={{ theme, isDark: theme === "dark", setTheme, toggleTheme }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
