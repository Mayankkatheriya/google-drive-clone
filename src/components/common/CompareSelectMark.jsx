"use client";

import styled from "styled-components";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

export default function CompareSelectMark({
  selected = false,
  disabled = false,
  size = "md",
  className,
}) {
  return (
    <Mark
      className={className}
      $selected={selected}
      $disabled={disabled}
      $size={size}
      aria-hidden="true"
    >
      {selected && <CheckRoundedIcon />}
    </Mark>
  );
}

const Mark = styled.span`
  width: ${(p) => (p.$size === "sm" ? "20px" : "22px")};
  height: ${(p) => (p.$size === "sm" ? "20px" : "22px")};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid
    ${(p) =>
      p.$selected
        ? "var(--primary)"
        : p.$disabled
          ? "var(--border)"
          : "var(--text-3)"};
  background: ${(p) =>
    p.$selected ? "var(--primary)" : "var(--surface)"};
  color: #fff;
  box-shadow: ${(p) =>
    p.$selected ? "0 1px 4px rgba(37, 99, 235, 0.35)" : "none"};
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  ${(p) =>
    p.$selected &&
    `
    transform: scale(1.04);
  `}

  svg {
    font-size: ${(p) => (p.$size === "sm" ? "14px" : "16px")};
    font-weight: 700;
  }
`;
