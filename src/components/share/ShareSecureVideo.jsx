"use client";

import styled from "styled-components";

export default function ShareSecureVideo({ token, title }) {
  return (
    <Video
      src={`/api/share-link/${token}/content`}
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
