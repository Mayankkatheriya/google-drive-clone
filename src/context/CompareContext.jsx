"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  canCompareFile,
  canComparePair,
} from "@/lib/compareFiles";

const CompareCtx = createContext({
  active: false,
  selected: [],
  modalOpen: false,
  hint: null,
  toggleMode: () => {},
  exitMode: () => {},
  toggleFile: () => {},
  isSelected: () => false,
  openCompare: () => {},
  closeCompare: () => {},
  canCompareNow: false,
});

export function CompareProvider({ children }) {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [hint, setHint] = useState(null);
  const selectedRef = useRef([]);
  const busyRef = useRef(false);
  const lastToggleRef = useRef({ id: null, at: 0 });
  const hintTimerRef = useRef(null);

  const clearHintLater = useCallback(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setHint(null);
      hintTimerRef.current = null;
    }, 2800);
  }, []);

  const applySelection = useCallback(
    (next, nextHint = null) => {
      selectedRef.current = next;
      setSelected(next);
      setHint(nextHint);
      if (nextHint) clearHintLater();
      else if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    },
    [clearHintLater],
  );

  const exitMode = useCallback(() => {
    setActive(false);
    selectedRef.current = [];
    setSelected([]);
    setModalOpen(false);
    setHint(null);
    lastToggleRef.current = { id: null, at: 0 };
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
  }, []);

  const toggleMode = useCallback(() => {
    setActive((prev) => {
      if (prev) {
        selectedRef.current = [];
        setSelected([]);
        setModalOpen(false);
        setHint(null);
        lastToggleRef.current = { id: null, at: 0 };
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
        return false;
      }
      return true;
    });
  }, []);

  const releaseBusy = useCallback(() => {
    queueMicrotask(() => {
      busyRef.current = false;
    });
  }, []);

  const toggleFile = useCallback(
    (file) => {
      if (busyRef.current) return;

      const now = Date.now();
      if (
        lastToggleRef.current.id === file.id &&
        now - lastToggleRef.current.at < 400
      ) {
        return;
      }
      lastToggleRef.current = { id: file.id, at: now };

      const contentType = file.data?.contentType ?? "";
      if (!canCompareFile(contentType)) return;

      busyRef.current = true;

      const prev = selectedRef.current;
      const exists = prev.find((item) => item.id === file.id);

      if (exists) {
        applySelection(
          prev.filter((item) => item.id !== file.id),
          null,
        );
        releaseBusy();
        return;
      }

      if (prev.length >= 2) {
        releaseBusy();
        return;
      }

      if (
        prev.length === 1 &&
        !canComparePair(prev[0].data.contentType, contentType)
      ) {
        applySelection(prev, "Pick two files of the same type (both images or both PDFs).");
        releaseBusy();
        return;
      }

      applySelection([...prev, { id: file.id, data: file.data }], null);
      releaseBusy();
    },
    [applySelection, releaseBusy],
  );

  const isSelected = useCallback(
    (id) => selected.some((item) => item.id === id),
    [selected],
  );

  const openCompare = useCallback(() => {
    const current = selectedRef.current;
    if (current.length !== 2) return;
    if (
      !canComparePair(
        current[0].data.contentType,
        current[1].data.contentType,
      )
    ) {
      return;
    }
    setModalOpen(true);
  }, []);

  const closeCompare = useCallback(() => {
    setModalOpen(false);
  }, []);

  const canCompareNow =
    selected.length === 2 &&
    canComparePair(selected[0].data.contentType, selected[1].data.contentType);

  const value = useMemo(
    () => ({
      active,
      selected,
      modalOpen,
      hint,
      toggleMode,
      exitMode,
      toggleFile,
      isSelected,
      openCompare,
      closeCompare,
      canCompareNow,
    }),
    [
      active,
      selected,
      modalOpen,
      hint,
      toggleMode,
      exitMode,
      toggleFile,
      isSelected,
      openCompare,
      closeCompare,
      canCompareNow,
    ],
  );

  return <CompareCtx.Provider value={value}>{children}</CompareCtx.Provider>;
}

export function useCompare() {
  return useContext(CompareCtx);
}
