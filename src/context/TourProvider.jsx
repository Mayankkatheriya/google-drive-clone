"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import "driver.js/dist/driver.css";
import { useAuth } from "@/context/AuthProvider";
import { buildTourSteps } from "@/lib/tourSteps";

const TOUR_SEEN_KEY = "disk-drive-tour-seen-v1";

const TourContext = createContext(() => {});

async function fireConfetti() {
  if (typeof window === "undefined") return;
  try {
    const confetti = (await import("canvas-confetti")).default;
    const colors = ["#1a73e8", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"];
    const fire = (particleRatio, opts) =>
      confetti({
        origin: { y: 0.7 },
        colors,
        disableForReducedMotion: true,
        particleCount: Math.floor(200 * particleRatio),
        ...opts,
      });

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  } catch {
    // confetti is a nice-to-have; ignore load errors
  }
}

export function TourProvider({ children }) {
  const pathname = usePathname();
  const { user, authReady } = useAuth();
  const runningRef = useRef(false);
  const autoStartedRef = useRef(false);

  const startTour = useCallback(async () => {
    if (runningRef.current || typeof window === "undefined") return;

    const steps = buildTourSteps();
    if (steps.length === 0) return;

    const [{ driver }] = await Promise.all([import("driver.js")]);

    runningRef.current = true;
    const lastIndex = steps.length - 1;
    let reachedEnd = false;

    const markSeen = () => {
      runningRef.current = false;
      try {
        localStorage.setItem(TOUR_SEEN_KEY, "1");
      } catch {
        // ignore storage errors
      }
      if (reachedEnd) fireConfetti();
    };

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      smoothScroll: true,
      animate: true,
      overlayColor: "rgba(15, 23, 42, 0.65)",
      stagePadding: 6,
      stageRadius: 14,
      popoverClass: "disk-drive-tour",
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Let's go 🚀",
      onHighlighted: (_el, _step, opts) => {
        if (opts?.state?.activeIndex === lastIndex) reachedEnd = true;
      },
      steps,
      onDestroyed: markSeen,
    });

    driverObj.drive();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    if (autoStartedRef.current) return;
    if (pathname !== "/home") return;

    let seen = false;
    try {
      seen = localStorage.getItem(TOUR_SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    autoStartedRef.current = true;
    const timer = setTimeout(() => {
      startTour();
    }, 1200);

    return () => clearTimeout(timer);
  }, [authReady, user, pathname, startTour]);

  return (
    <TourContext.Provider value={startTour}>{children}</TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
