"use client";

import { useFilePreview } from "@/context/FilePreviewContext";

export default function SecureFileLink({
  fileData,
  files,
  children,
  className,
  as: Component = "span",
  ...props
}) {
  const { open } = useFilePreview();

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const siblings = files?.map((item) => item.data ?? item) ?? null;
    open(fileData, siblings);
  };

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
