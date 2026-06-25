"use client";

import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { HelpIcon } from "../common/SvgIcons";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import HelpModal from "../common/Modal";
import { useTheme } from "@/context/ThemeContext";

const THEME_OPTIONS = [
  { id: "light", label: "Light", Icon: LightModeOutlinedIcon },
  { id: "dark",  label: "Dark",  Icon: DarkModeOutlinedIcon },
  { id: "system", label: "Device", Icon: DesktopWindowsOutlinedIcon },
];

const LeftIcons = () => {
  const openHelp = useSelector(selectHelpModal);
  const dispatch = useDispatch();
  const { preference, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <LeftSection>
      <HelpModal
        openHelp={openHelp}
        closeHelpModal={() => dispatch(setHelpModal(false))}
      />

      <IconBtn
        onClick={() => dispatch(setHelpModal(true))}
        aria-label="Help"
        title="Help"
      >
        <HelpIcon />
      </IconBtn>

      <SettingsWrap ref={settingsRef}>
        <IconBtn
          aria-label="Settings"
          title="Settings"
          $active={settingsOpen}
          onClick={() => setSettingsOpen((p) => !p)}
        >
          <SettingsOutlinedIcon style={{ fontSize: 22 }} />
        </IconBtn>

        {settingsOpen && (
          <ThemePanel>
            <PanelTitle>Appearance</PanelTitle>
            <ThemeOptions>
              {THEME_OPTIONS.map(({ id, label, Icon }) => (
                <ThemeOption
                  key={id}
                  $active={preference === id}
                  onClick={() => {
                    setTheme(id);
                    setSettingsOpen(false);
                  }}
                >
                  <IconWrap $active={preference === id}>
                    <Icon style={{ fontSize: 18 }} />
                  </IconWrap>
                  <span>{label}</span>
                  {preference === id && <ActiveDot />}
                </ThemeOption>
              ))}
            </ThemeOptions>
          </ThemePanel>
        )}
      </SettingsWrap>
    </LeftSection>
  );
};

const popIn = keyframes`
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => (p.$active ? "var(--surface-3)" : "none")};
  border: none;
  border-radius: 50%;
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-2)")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--primary);
  }

  svg {
    font-size: 22px;
  }
`;

const SettingsWrap = styled.div`
  position: relative;
`;

const ThemePanel = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 14px;
  min-width: 200px;
  z-index: 300;
  animation: ${popIn} 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

const PanelTitle = styled.p`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  padding: 0 6px 10px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 8px;
`;

const ThemeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ThemeOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: ${(p) => (p.$active ? "var(--primary-light)" : "none")};
  border: none;
  border-radius: 10px;
  padding: 9px 10px;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;

  span {
    font-size: 0.875rem;
    font-weight: ${(p) => (p.$active ? "600" : "500")};
    color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-1)")};
    flex: 1;
  }

  &:hover {
    background: ${(p) => (p.$active ? "var(--primary-light)" : "var(--surface-3)")};
  }
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${(p) => (p.$active ? "var(--primary-subtle)" : "var(--surface-2)")};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-2)")};
  flex-shrink: 0;
`;

const ActiveDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
`;

export default LeftIcons;
