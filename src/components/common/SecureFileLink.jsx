"use client";

import { memo, useCallback } from "react";
import { useFilePreview } from "@/context/FilePreviewContext";
import { markFileOpened } from "./firebaseApi";

function SecureFileLink({
  fileData,
  fileId,
  files,
  children,
  className,
  as: Component = "span",
  ...props
}) {
  const { open } = useFilePreview();

  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (fileId) {
        markFileOpened(fileId);
      }
      const siblings = files?.map((item) => item.data ?? item) ?? null;
      open(fileData, siblings);
    },
    [fileId, fileData, files, open]
  );

  return (
    <Component
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleClick(event);
        }
      }}
      className={className}
      style={{ cursor: "pointer", ...props.style }}
      {...props}
    >
      {children}
    </Component>
  );
}

export default memo(SecureFileLink);
