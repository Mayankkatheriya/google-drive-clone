"use client";

import { useFocus } from "@/context/FocusContext";

export default function FocusLayoutGate({ children }) {
  const { active } = useFocus();
  if (active) return null;
  return children;
}
