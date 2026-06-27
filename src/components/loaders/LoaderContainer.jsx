"use client";

import ContentSkeleton from "@/components/common/skeleton/ContentSkeleton";

const LoaderContainer = ({ grid = false, compact = false }) => {
  return <ContentSkeleton grid={grid} compact={compact} />;
};

export default LoaderContainer;
