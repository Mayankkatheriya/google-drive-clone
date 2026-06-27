"use client";

import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

export const Bone = styled.div`
  width: ${(p) => p.$w ?? "100%"};
  height: ${(p) => p.$h ?? "12px"};
  border-radius: ${(p) => p.$radius ?? "8px"};
  flex-shrink: ${(p) => (p.$shrink === false ? 0 : 1)};
  background: ${(p) =>
    p.$tone === "dark"
      ? "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 100%)"
      : "linear-gradient(90deg, var(--surface-3) 0%, var(--surface-2) 50%, var(--surface-3) 100%)"};
  background-size: 200% 100%;
  animation: ${shimmer} 1.35s ease-in-out infinite;
`;

export const Circle = styled(Bone)`
  width: ${(p) => p.$size ?? "36px"};
  height: ${(p) => p.$size ?? "36px"};
  border-radius: 50%;
`;
