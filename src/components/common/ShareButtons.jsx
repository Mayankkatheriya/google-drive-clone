"use client";

import dynamic from "next/dynamic";

const ShareButtonsInner = dynamic(() => import("./ShareButtonsInner"), {
  ssr: false,
});

export default function ShareButtons({
  url,
  filename,
  layout = "bar",
  fileData,
}) {
  if (!url) return null;
  return (
    <ShareButtonsInner
      url={url}
      filename={filename}
      layout={layout}
      fileData={fileData}
    />
  );
}
