"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";

const SHOW_DELAY = 420;
const HIDE_DELAY = 60;
const GAP = 8;
const VIEWPORT_PAD = 8;

function assignRef(ref, node) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

function mergeRefs(...refs) {
  return (node) => refs.forEach((ref) => assignRef(ref, node));
}

function mergeHandler(existing, next) {
  if (!existing) return next;
  if (!next) return existing;
  return (event) => {
    existing(event);
    next(event);
  };
}

export default function Tooltip({
  label,
  children,
  placement = "top",
  onlyIfTruncated = false,
  disabled = false,
  wrap = false,
  iconOnly = false,
}) {
  const tooltipId = useId();
  const triggerRef = useRef(null);
  const tipRef = useRef(null);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const [visible, setVisible] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement });

  const active =
    !disabled &&
    Boolean(label) &&
    (!onlyIfTruncated || truncated);

  const checkTruncation = useCallback(() => {
    const el = triggerRef.current;
    if (!el || !onlyIfTruncated) return;
    setTruncated(
      el.scrollWidth > el.clientWidth + 1 ||
        el.scrollHeight > el.clientHeight + 1,
    );
  }, [onlyIfTruncated]);

  useLayoutEffect(() => {
    if (!onlyIfTruncated) return;
    checkTruncation();
    const el = triggerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(checkTruncation);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onlyIfTruncated, checkTruncation, label, children]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    const rect = trigger.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let nextPlacement = placement;
    let top;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    if (placement === "bottom") {
      top = rect.bottom + GAP;
      if (top + tipRect.height > window.innerHeight - VIEWPORT_PAD) {
        nextPlacement = "top";
        top = rect.top - tipRect.height - GAP;
      }
    } else {
      top = rect.top - tipRect.height - GAP;
      if (top < VIEWPORT_PAD) {
        nextPlacement = "bottom";
        top = rect.bottom + GAP;
      }
    }

    left = Math.max(
      VIEWPORT_PAD,
      Math.min(left, window.innerWidth - tipRect.width - VIEWPORT_PAD),
    );
    top = Math.max(
      VIEWPORT_PAD,
      Math.min(top, window.innerHeight - tipRect.height - VIEWPORT_PAD),
    );

    setCoords({ top, left, placement: nextPlacement });
  }, [placement]);

  useLayoutEffect(() => {
    if (!visible) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible, updatePosition]);

  const clearTimers = () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  };

  const show = () => {
    if (!active) return;
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), SHOW_DELAY);
  };

  const hide = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
  };

  useEffect(() => () => clearTimers(), []);

  if (!label) return children;

  const handlers = {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  };

  const a11y =
    typeof label === "string"
      ? { "aria-describedby": visible ? tooltipId : undefined }
      : {};

  let trigger = children;

  if (isValidElement(children) && !wrap) {
    trigger = cloneElement(children, {
      ref: mergeRefs(triggerRef, children.ref),
      ...handlers,
      onMouseEnter: mergeHandler(children.props.onMouseEnter, show),
      onMouseLeave: mergeHandler(children.props.onMouseLeave, hide),
      onFocus: mergeHandler(children.props.onFocus, show),
      onBlur: mergeHandler(children.props.onBlur, hide),
      ...a11y,
      ...(iconOnly &&
      typeof label === "string" &&
      !children.props["aria-label"]
        ? { "aria-label": label }
        : {}),
    });
  } else {
    trigger = (
      <TriggerWrap
        ref={triggerRef}
        {...handlers}
        {...a11y}
      >
        {children}
      </TriggerWrap>
    );
  }

  return (
    <>
      {trigger}
      {visible &&
        active &&
        typeof document !== "undefined" &&
        createPortal(
          <TipBubble
            ref={tipRef}
            id={tooltipId}
            role="tooltip"
            $placement={coords.placement}
            style={{ top: coords.top, left: coords.left }}
          >
            {label}
          </TipBubble>,
          document.body,
        )}
    </>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const TriggerWrap = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;
`;

const TipBubble = styled.div`
  position: fixed;
  z-index: var(--tooltip-z);
  max-width: min(280px, calc(100vw - 16px));
  padding: var(--tooltip-padding);
  border-radius: var(--tooltip-radius);
  background: var(--tooltip-bg);
  color: var(--tooltip-text);
  font-size: var(--tooltip-font-size);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.01em;
  box-shadow: var(--tooltip-shadow);
  pointer-events: none;
  white-space: pre-wrap;
  animation: ${fadeIn} 0.14s ease-out;

  ${(p) =>
    p.$placement === "bottom" &&
    `
    animation-name: ${fadeIn};
    transform-origin: top center;
  `}
`;
