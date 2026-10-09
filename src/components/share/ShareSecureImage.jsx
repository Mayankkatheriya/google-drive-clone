"use client";

import styled from "styled-components";

function contentUrl(token, accessToken) {
  const base = `/api/share-link/${token}/content`;
  return accessToken
    ? `${base}?access=${encodeURIComponent(accessToken)}`
    : base;
}

export default function ShareSecureImage({ token, accessToken, alt }) {
  return (
    <Image
      src={contentUrl(token, accessToken)}
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
