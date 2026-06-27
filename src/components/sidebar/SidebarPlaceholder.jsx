"use client";

import styled from "styled-components";

export default function SidebarPlaceholder() {
  return <Aside aria-hidden="true" />;
}

const Aside = styled.aside`
  width: 256px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);

  @media (max-width: 768px) {
    display: none;
  }
`;
