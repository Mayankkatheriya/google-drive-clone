"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const MAX_SELECTION = 50;

const SelectionCtx = createContext({
  active: false,
  selected: [],
  toggleMode: () => {},
  exitMode: () => {},
  toggleItem: () => {},
  selectAll: () => {},
  isSelected: () => false,
  clear: () => {},
  selectedIds: [],
  maxSelection: MAX_SELECTION,
});

export function SelectionProvider({ children }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState([]);
  const selectedRef = useRef([]);

  const exitMode = useCallback(() => {
    setActive(false);
    selectedRef.current = [];
    setSelected([]);
  }, []);

  const clear = useCallback(() => {
    selectedRef.current = [];
    setSelected([]);
  }, []);

  const toggleMode = useCallback(() => {
    setActive((prev) => {
      if (prev) {
        selectedRef.current = [];
        setSelected([]);
        return false;
      }
      return true;
    });
  }, []);

  const toggleItem = useCallback((item) => {
    if (!item?.id) return;
    const prev = selectedRef.current;
    const exists = prev.find((x) => x.id === item.id);
    let next;
    if (exists) {
      next = prev.filter((x) => x.id !== item.id);
    } else if (prev.length >= MAX_SELECTION) {
      return;
    } else {
      next = [...prev, { id: item.id, data: item.data }];
    }
    selectedRef.current = next;
    setSelected(next);
  }, []);

  const selectAll = useCallback((items) => {
    const next = (items || [])
      .filter((item) => item?.id)
      .slice(0, MAX_SELECTION)
      .map((item) => ({ id: item.id, data: item.data }));
    selectedRef.current = next;
    setSelected(next);
    if (!active && next.length > 0) {
      setActive(true);
    }
  }, [active]);

  const isSelected = useCallback(
    (id) => selected.some((item) => item.id === id),
    [selected],
  );

  const selectedIds = useMemo(() => selected.map((s) => s.id), [selected]);

  useEffect(() => {
    if (pathname !== "/home" && active) {
      exitMode();
    }
  }, [pathname, active, exitMode]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (event.target.closest("input, textarea, [contenteditable='true']")) {
        return;
      }
      exitMode();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, exitMode]);

  const value = useMemo(
    () => ({
      active,
      selected,
      selectedIds,
      toggleMode,
      exitMode,
      toggleItem,
      selectAll,
      isSelected,
      clear,
      maxSelection: MAX_SELECTION,
    }),
    [
      active,
      selected,
      selectedIds,
      toggleMode,
      exitMode,
      toggleItem,
      selectAll,
      isSelected,
      clear,
    ],
  );

  return (
    <SelectionCtx.Provider value={value}>{children}</SelectionCtx.Provider>
  );
}

export function useSelection() {
  return useContext(SelectionCtx);
}
