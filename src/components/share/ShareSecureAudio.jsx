"use client";

import styled from "styled-components";

function contentUrl(token, accessToken) {
  const base = `/api/share-link/${token}/content`;
  return accessToken
    ? `${base}?access=${encodeURIComponent(accessToken)}`
    : base;
}

export default function ShareSecureAudio({ token, accessToken, title }) {
  return (
    <Audio
      src={contentUrl(token, accessToken)}
      controls
      preload="metadata"
      controlsList="nodownload noplaybackrate noremoteplayback"
      aria-label={title}
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

const Audio = styled.audio`
  display: block;
  width: calc(100% - 24px);
  margin: 20px 12px;
  user-select: none;
  -webkit-user-select: none;
`;
