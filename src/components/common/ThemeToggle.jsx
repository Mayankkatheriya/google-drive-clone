"use client";

import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import Tooltip from "./Tooltip";

const SIZES = {
  sm: { w: 44, h: 22 },
  md: { w: 52, h: 26 },
};

const riseSpring = { type: "spring", stiffness: 380, damping: 22, mass: 0.8 };
const skyEase = { duration: 0.55, ease: [0.4, 0, 0.2, 1] };

const twinkle = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1); }
`;

const spinRays = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const STARS = [
  { top: "22%", left: "18%", delay: "0s", size: 1.5 },
  { top: "55%", left: "32%", delay: "0.4s", size: 1 },
  { top: "18%", left: "52%", delay: "0.8s", size: 1.5 },
  { top: "48%", left: "68%", delay: "0.2s", size: 1 },
  { top: "28%", left: "82%", delay: "0.6s", size: 1.5 },
];

export function ThemeToggle({ size = "md" }) {
  const { isDark, toggleTheme } = useTheme();
  const dim = SIZES[size] ?? SIZES.md;
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <Tooltip label={isDark ? "Light mode" : "Dark mode"}>
      <ToggleBtn
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
      <Track
        $size={size}
        animate={{
          background: isDark
            ? "linear-gradient(180deg, #0c1222 0%, #1a2744 55%, #243352 100%)"
            : "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #fef3c7 100%)",
          boxShadow: isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.35)"
            : "inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(251,191,36,0.2)",
        }}
        transition={skyEase}
      >
        <Horizon
          animate={{
            opacity: isDark ? 0.15 : 0.35,
            background: isDark
              ? "linear-gradient(180deg, transparent, rgba(30,41,59,0.8))"
              : "linear-gradient(180deg, transparent, rgba(251,191,36,0.35))",
          }}
          transition={skyEase}
        />

        {STARS.map((star, i) => (
          <Star
            key={i}
            $size={star.size}
            style={{ top: star.top, left: star.left, animationDelay: star.delay }}
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
            transition={{ duration: 0.4, delay: isDark ? i * 0.05 : 0 }}
          />
        ))}

        <Cloud
          $size={size}
          style={{ left: "8%", top: "58%" }}
          animate={{ opacity: isDark ? 0 : 0.85, x: isDark ? -6 : 0 }}
          transition={{ duration: 0.45 }}
        />
        <Cloud
          $size={size}
          $small
          style={{ left: "28%", top: "68%" }}
          animate={{ opacity: isDark ? 0 : 0.6, x: isDark ? -4 : 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        />

        <SunWrap
          $size={size}
          animate={{
            x: isDark ? dim.w * 0.38 : 0,
            y: isDark ? dim.h * 0.55 : 0,
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.35 : 1,
          }}
          transition={riseSpring}
        >
          <SunRays $active={!isDark} $size={iconSize} />
          <SunCore $size={iconSize} />
        </SunWrap>

        <MoonWrap
          $size={size}
          animate={{
            x: isDark ? 0 : -dim.w * 0.38,
            y: isDark ? 0 : dim.h * 0.55,
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.35,
          }}
          transition={riseSpring}
        >
          <MoonBody $size={iconSize} />
          <MoonStar $delay="0s" style={{ top: -1, right: -4 }} $active={isDark} />
          <MoonStar $delay="0.3s" style={{ top: 4, right: -7 }} $small $active={isDark} />
        </MoonWrap>
      </Track>
    </ToggleBtn>
    </Tooltip>
  );
}

const ToggleBtn = styled(motion.button)`
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  border-radius: 999px;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
`;

const Track = styled(motion.div)`
  position: relative;
  width: ${(p) => (p.$size === "sm" ? "44px" : "52px")};
  height: ${(p) => (p.$size === "sm" ? "22px" : "26px")};
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Horizon = styled(motion.div)`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
`;

const Star = styled(motion.span)`
  position: absolute;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: #fff;
  z-index: 2;
  animation: ${twinkle} 2s ease-in-out infinite;
  pointer-events: none;
`;

const Cloud = styled(motion.span)`
  position: absolute;
  z-index: 2;
  width: ${(p) => (p.$small ? 8 : 11)}px;
  height: ${(p) => (p.$small ? 3 : 4)}px;
  border-radius: 999px;
  background: rgba(255, 255, 255, ${(p) => (p.$small ? 0.7 : 0.85)});
  pointer-events: none;

  &::before,
  &::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: inherit;
  }

  &::before {
    width: ${(p) => (p.$small ? 4 : 5)}px;
    height: ${(p) => (p.$small ? 4 : 5)}px;
    top: -2px;
    left: 1px;
  }

  &::after {
    width: ${(p) => (p.$small ? 3 : 5)}px;
    height: ${(p) => (p.$small ? 3 : 5)}px;
    top: -1px;
    right: 0;
  }
`;

const SunWrap = styled(motion.div)`
  position: absolute;
  z-index: 4;
  left: ${(p) => (p.$size === "sm" ? "4px" : "5px")};
  bottom: ${(p) => (p.$size === "sm" ? "3px" : "4px")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SunRays = styled.div`
  position: absolute;
  width: ${(p) => p.$size + 8}px;
  height: ${(p) => p.$size + 8}px;
  animation: ${(p) => (p.$active ? spinRays : "none")} 8s linear infinite;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-conic-gradient(
      from 0deg,
      rgba(251, 191, 36, 0.55) 0deg 8deg,
      transparent 8deg 22deg
    );
    border-radius: 50%;
    mask: radial-gradient(circle, transparent 42%, black 44%);
    -webkit-mask: radial-gradient(circle, transparent 42%, black 44%);
  }
`;

const SunCore = styled.div`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fef08a 0%, #fbbf24 55%, #f59e0b 100%);
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.5);
`;

const MoonWrap = styled(motion.div)`
  position: absolute;
  z-index: 4;
  right: ${(p) => (p.$size === "sm" ? "4px" : "5px")};
  bottom: ${(p) => (p.$size === "sm" ? "3px" : "4px")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MoonBody = styled.div`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #f1f5f9 0%, #cbd5e1 100%);
  box-shadow: 0 0 5px rgba(203, 213, 225, 0.4);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    background: #1a2744;
    top: -8%;
    right: -18%;
  }
`;

const MoonStar = styled.span`
  position: absolute;
  width: ${(p) => (p.$small ? 2 : 3)}px;
  height: ${(p) => (p.$small ? 2 : 3)}px;
  border-radius: 50%;
  background: #fff;
  animation: ${(p) => (p.$active ? twinkle : "none")} 1.8s ease-in-out infinite;
  animation-delay: ${(p) => p.$delay};
  pointer-events: none;
`;
