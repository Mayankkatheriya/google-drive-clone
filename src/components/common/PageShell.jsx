"use client";

import styled from "styled-components";

export const Page = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  background: var(--surface);

  @media (max-width: 768px) {
    -webkit-overflow-scrolling: touch;
    scroll-padding-bottom: var(--mobile-scroll-inset);
  }
`;
