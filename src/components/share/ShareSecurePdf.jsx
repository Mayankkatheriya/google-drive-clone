"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

export default function ShareSecurePdf({ token, title }) {
  const wrapRef = useRef(null);
  const pagesRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      try {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (cancelled || !wrapRef.current || !pagesRef.current) return;

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjs.getDocument({
          url: `/api/share-link/${token}/content`,
        }).promise;

        if (cancelled || !wrapRef.current || !pagesRef.current) return;

        const containerWidth = Math.max(wrapRef.current.clientWidth - 32, 320);
        pagesRef.current.replaceChildren();

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled || !pagesRef.current) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / baseViewport.width;
          const outputScale = window.devicePixelRatio || 1;
          const viewport = page.getViewport({ scale: scale * outputScale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${Math.floor(baseViewport.width * scale)}px`;
          canvas.style.maxWidth = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.setAttribute("role", "img");
          canvas.setAttribute("aria-label", `${title} page ${pageNum}`);
          canvas.draggable = false;
          canvas.oncontextmenu = (event) => event.preventDefault();

          pagesRef.current.appendChild(canvas);

          await page.render({ canvasContext: context, viewport }).promise;
        }

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [token, title]);

  if (error) {
    return <StateText>Unable to load PDF preview.</StateText>;
  }

  return (
    <ViewerWrap ref={wrapRef} onContextMenu={(event) => event.preventDefault()}>
      {loading && <LoadingOverlay>Loading PDF…</LoadingOverlay>}
      <Pages ref={pagesRef} />
    </ViewerWrap>
  );
}

const ViewerWrap = styled.div`
  position: relative;
  max-height: min(72vh, 680px);
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  user-select: none;
  -webkit-user-select: none;
`;

const Pages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  background: #fff;
  min-height: 240px;
`;

const LoadingOverlay = styled.p`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  background: rgba(255, 255, 255, 0.92);
  font-size: 0.86rem;
  color: var(--text-3);
`;

const StateText = styled.p`
  padding: 48px 16px;
  text-align: center;
  font-size: 0.86rem;
  color: var(--text-3);
`;
