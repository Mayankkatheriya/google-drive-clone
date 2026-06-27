"use client";

import styled from "styled-components";

export default function ShareSecureImage({ token, alt }) {
  return (
    <Image
      src={`/api/share-link/${token}/content`}
      alt={alt}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

const Image = styled.img`
  display: block;
  width: 100%;
  max-height: min(72vh, 680px);
  object-fit: contain;
  background: var(--surface-2);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
`;
