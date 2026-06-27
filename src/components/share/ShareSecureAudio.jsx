"use client";

import styled from "styled-components";

export default function ShareSecureAudio({ token, title }) {
  return (
    <Audio
      src={`/api/share-link/${token}/content`}
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
