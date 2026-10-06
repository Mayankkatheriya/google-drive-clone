"use client";

import { useLayoutEffect, useState } from "react";

const MENU_FALLBACK_HEIGHT = 280;
const MENU_MAX_HEIGHT = 320;
const VIEWPORT_PADDING = 8;
const MOBILE_BREAKPOINT = 768;

function getBottomOffset() {
  if (typeof window === "undefined") return VIEWPORT_PADDING;

  if (window.innerWidth > MOBILE_BREAKPOINT) {
    return VIEWPORT_PADDING;
  }

  const root = document.documentElement;
  const bottomNav =
    parseInt(getComputedStyle(root).getPropertyValue("--bottom-nav-height"), 10) || 60;

  return bottomNav + 72;
}

export function useMenuPlacement(triggerRef, menuRef, isOpen) {
  const [placement, setPlacement] = useState({
    top: 0,
    right: 0,
    flip: false,
    ready: false,
  });

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      setPlacement({ top: 0, right: 0, flip: false, ready: false });
      return;
    }

    const compute = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      if (!trigger) return;

      const menuEl = menuRef.current;
      const bottomOffset = getBottomOffset();
      const availableHeight = Math.max(
        160,
        Math.min(
          MENU_MAX_HEIGHT,
          window.innerHeight - VIEWPORT_PADDING - bottomOffset,
        ),
      );

      if (menuEl) {
        menuEl.style.maxHeight = `${availableHeight}px`;
      }

      const menuHeight = Math.min(
        menuEl?.offsetHeight || MENU_FALLBACK_HEIGHT,
        availableHeight,
      );
      const gap = 6;

      const spaceBelow = window.innerHeight - trigger.bottom - bottomOffset;
      const spaceAbove = trigger.top - VIEWPORT_PADDING;
      const flip =
        spaceBelow < menuHeight + gap && spaceAbove > spaceBelow;

      let top = flip
        ? trigger.top - menuHeight - gap
        : trigger.bottom + gap;

      const maxTop = window.innerHeight - menuHeight - bottomOffset;
      top = Math.min(Math.max(VIEWPORT_PADDING, top), Math.max(VIEWPORT_PADDING, maxTop));

      const right = Math.max(
        VIEWPORT_PADDING,
        window.innerWidth - trigger.right
      );

      setPlacement({ top, right, flip, ready: true });
    };

    compute();
    const raf = requestAnimationFrame(compute);

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [isOpen, triggerRef, menuRef]);

  return placement;
}
