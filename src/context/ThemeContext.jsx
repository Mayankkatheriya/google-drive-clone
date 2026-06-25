"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "disk-drive-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(pref) {
  const resolved = pref === "system" ? getSystemTheme() : pref;
  document.documentElement.setAttribute("data-theme", resolved);
}

const ThemeCtx = createContext({ preference: "system", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || "system";
    setPreference(stored);
    applyTheme(stored);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(STORAGE_KEY) || "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((pref) => {
    setPreference(pref);
    localStorage.setItem(STORAGE_KEY, pref);
    applyTheme(pref);
  }, []);

  return (
    <ThemeCtx.Provider value={{ preference, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
