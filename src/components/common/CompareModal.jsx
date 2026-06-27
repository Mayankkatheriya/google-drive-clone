"use client";

import dynamic from "next/dynamic";
import { useCompare } from "@/context/CompareContext";

const CompareModalContent = dynamic(
  () => import("./CompareModalContent"),
  { ssr: false },
);

export default function CompareModal() {
  const { modalOpen } = useCompare();

  if (!modalOpen) return null;

  return <CompareModalContent />;
}
