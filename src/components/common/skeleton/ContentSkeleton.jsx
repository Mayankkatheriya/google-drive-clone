"use client";

import FileGridSkeleton from "./FileGridSkeleton";
import FileListSkeleton from "./FileListSkeleton";

export default function ContentSkeleton({ grid = false, compact = false }) {
  if (grid) {
    return <FileGridSkeleton compact={compact} />;
  }

  return <FileListSkeleton />;
}
