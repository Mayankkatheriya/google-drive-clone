"use client";

import { useLayoutEffect, useState } from "react";

const MENU_FALLBACK_HEIGHT = 260;
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
      const menuHeight = menuEl?.offsetHeight || MENU_FALLBACK_HEIGHT;
      const gap = 6;
      const bottomOffset = getBottomOffset();

      const spaceBelow = window.innerHeight - trigger.bottom - bottomOffset;
      const flip = spaceBelow < menuHeight + gap;

      let top = flip
        ? trigger.top - menuHeight - gap
        : trigger.bottom + gap;

      top = Math.max(VIEWPORT_PADDING, top);

      if (!flip) {
        top = Math.min(top, window.innerHeight - menuHeight - bottomOffset);
      }

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
