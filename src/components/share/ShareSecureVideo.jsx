"use client";

import styled from "styled-components";

function contentUrl(token, accessToken) {
  const base = `/api/share-link/${token}/content`;
  return accessToken
    ? `${base}?access=${encodeURIComponent(accessToken)}`
    : base;
}

export default function ShareSecureVideo({ token, accessToken, title }) {
  return (
    <Video
      src={contentUrl(token, accessToken)}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload noplaybackrate noremoteplayback"
      disablePictureInPicture
      aria-label={title}
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

const Video = styled.video`
  display: block;
  width: 100%;
  max-height: min(72vh, 680px);
  background: #000;
  user-select: none;
  -webkit-user-select: none;
`;
