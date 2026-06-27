"use client";

import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";

const spring = { type: "spring", stiffness: 520, damping: 32 };
const swap = { type: "spring", stiffness: 480, damping: 30 };

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.line
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ x1: 12, y1: 7, x2: 12, y2: 7 }}
        animate={{ x1: 5, y1: 7, x2: 19, y2: 7 }}
        transition={spring}
      />
      <motion.line
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ opacity: 0, x1: 12, y1: 12, x2: 12, y2: 12 }}
        animate={{ opacity: 1, x1: 5, y1: 12, x2: 19, y2: 12 }}
        transition={{ ...spring, delay: 0.04 }}
      />
      <motion.line
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ x1: 12, y1: 17, x2: 12, y2: 17 }}
        animate={{ x1: 5, y1: 17, x2: 19, y2: 17 }}
        transition={{ ...spring, delay: 0.08 }}
      />
    </svg>
  );
}

/** Closed → ☰ · Open → MenuOpen (Material drawer icon) */
export function SidebarToggleIcon({ open = true }) {
  return (
    <IconBox>
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <MotionIcon
            key="open"
            initial={{ opacity: 0, scale: 0.85, x: 5 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -5 }}
            transition={swap}
          >
            <MenuOpenRoundedIcon style={{ fontSize: 22 }} />
          </MotionIcon>
        ) : (
          <MotionIcon
            key="closed"
            initial={{ opacity: 0, scale: 0.85, x: -5 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 5 }}
            transition={swap}
          >
            <HamburgerIcon />
          </MotionIcon>
        )}
      </AnimatePresence>
    </IconBox>
  );
}

const IconBox = styled.span`
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MotionIcon = styled(motion.span)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
`;
