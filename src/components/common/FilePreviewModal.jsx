"use client";

import dynamic from "next/dynamic";
import { useFilePreview } from "@/context/FilePreviewContext";

const FilePreviewModalContent = dynamic(
  () => import("./FilePreviewModalContent"),
  { ssr: false }
);

export default function FilePreviewModal() {
  const { file, open } = useFilePreview();

  if (!open || !file) {
    return null;
  }

  return <FilePreviewModalContent />;
}
