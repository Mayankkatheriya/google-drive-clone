"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const FOCUS_ACTIVE_KEY = "driveFocusActive";
const FOCUS_FILTER_KEY = "driveFocusFilter";
const FOCUS_FILTERS_IDS = new Set(["all", "pdf", "image", "starred"]);

const FocusCtx = createContext({
  active: false,
  filter: "all",
  toggleMode: () => {},
  exitMode: () => {},
  setFilter: () => {},
});

function readStoredFilter() {
  if (typeof window === "undefined") return "all";
  const saved = localStorage.getItem(FOCUS_FILTER_KEY);
  return FOCUS_FILTERS_IDS.has(saved) ? saved : "all";
}

export function FocusProvider({ children }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [filter, setFilterState] = useState("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedActive = localStorage.getItem(FOCUS_ACTIVE_KEY) === "true";
    const savedFilter = readStoredFilter();
    setFilterState(savedFilter);
    if (savedActive && pathname === "/home") {
      setActive(true);
    }
    setHydrated(true);
  }, [pathname]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.toggleAttribute("data-focus-mode", active);
    return () => {
      document.documentElement.removeAttribute("data-focus-mode");
    };
  }, [active, hydrated]);

  useEffect(() => {
    if (pathname !== "/home" && active) {
      setActive(false);
      localStorage.setItem(FOCUS_ACTIVE_KEY, "false");
    }
  }, [pathname, active]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (event.target.closest("input, textarea, [contenteditable='true']")) {
        return;
      }
      setActive(false);
      localStorage.setItem(FOCUS_ACTIVE_KEY, "false");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  const exitMode = useCallback(() => {
    setActive(false);
    localStorage.setItem(FOCUS_ACTIVE_KEY, "false");
  }, []);

  const toggleMode = useCallback(() => {
    setActive((prev) => {
      const next = !prev;
      localStorage.setItem(FOCUS_ACTIVE_KEY, String(next));
      return next;
    });
  }, []);

  const setFilter = useCallback((nextFilter) => {
    if (!FOCUS_FILTERS_IDS.has(nextFilter)) return;
    setFilterState(nextFilter);
    localStorage.setItem(FOCUS_FILTER_KEY, nextFilter);
  }, []);

  const value = useMemo(
    () => ({
      active: hydrated ? active : false,
      filter,
      toggleMode,
      exitMode,
      setFilter,
    }),
    [active, filter, toggleMode, exitMode, setFilter, hydrated],
  );

  return <FocusCtx.Provider value={value}>{children}</FocusCtx.Provider>;
}

export function useFocus() {
  return useContext(FocusCtx);
}
