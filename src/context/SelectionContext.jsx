"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const MAX_SELECTION = 50;

const SelectionCtx = createContext({
  active: false,
  selected: [],
  toggleMode: () => {},
  exitMode: () => {},
  toggleItem: () => {},
  isSelected: () => false,
  clear: () => {},
  selectedIds: [],
});

export function SelectionProvider({ children }) {
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

  const isSelected = useCallback(
    (id) => selected.some((item) => item.id === id),
    [selected],
  );

  const selectedIds = useMemo(() => selected.map((s) => s.id), [selected]);

  const value = useMemo(
    () => ({
      active,
      selected,
      selectedIds,
      toggleMode,
      exitMode,
      toggleItem,
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
