"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { UploadFileIcon } from "./SvgIcons";
import { useFileUploadContext } from "@/context/FileUploadContext";

export default function DropZone() {
  const { stageFile, setOpen, uploading } = useFileUploadContext();
  const [dragging, setDragging] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

  useEffect(() => {
    const hasFiles = (event) =>
      Array.from(event.dataTransfer?.types ?? []).includes("Files");

    const onDragEnter = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragDepth((depth) => depth + 1);
      setDragging(true);
    };

    const onDragOver = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
    };

    const onDragLeave = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragDepth((depth) => {
        const next = Math.max(0, depth - 1);
        if (next === 0) setDragging(false);
        return next;
      });
    };

    const onDrop = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragDepth(0);
      setDragging(false);

      if (uploading) return;

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      if (stageFile(file)) {
        setOpen(true);
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [stageFile, setOpen, uploading]);

  if (!dragging || uploading) return null;

  return (
    <Overlay aria-hidden="true">
      <Panel>
        <UploadFileIcon />
        <p>Drop your file anywhere to upload</p>
      </Panel>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 36px 48px;
  border: 2px dashed var(--primary);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);

  svg {
    font-size: 48px;
    color: var(--primary);
  }

  p {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-1);
  }
`;
