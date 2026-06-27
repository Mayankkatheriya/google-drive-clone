"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { SearchIcons, CloseIcon, HelpIcon } from "../common/SvgIcons";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import HelpModal from "../common/Modal";
import StorageModal from "../common/StorageModal";
import { useStorageInfo } from "@/hooks/useStorageInfo";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "../common/ThemeToggle";

const ProfileSection = ({
  userPhoto,
  userName,
  handleAuth,
  showSearch,
  setShowSearch,
}) => {
  const [open, setOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const openHelp = useSelector(selectHelpModal);
  const { isDark } = useTheme();
  const { storage, storageLimitLabel, storagePercent } = useStorageInfo();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const firstName = userName?.split(" ")[0] ?? "";
  const [photoError, setPhotoError] = useState(false);
  const showPhoto = userPhoto && !photoError;
  const initial = (firstName.charAt(0) || userName?.charAt(0) || "?").toUpperCase();

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <Wrap>
      <IconBtn
        onClick={setShowSearch}
        aria-label="Toggle search"
        className="mobile-only"
      >
        {showSearch ? <CloseIcon /> : <SearchIcons />}
      </IconBtn>

      <AvatarWrap ref={ref}>
        <AvatarBtn onClick={() => setOpen((p) => !p)} aria-label="Account menu">
          {showPhoto ? (
            <Avatar
              src={userPhoto}
              alt={firstName}
              onError={() => setPhotoError(true)}
            />
          ) : (
            <AvatarFallback aria-hidden="true">{initial}</AvatarFallback>
          )}
        </AvatarBtn>

        {open && (
          <DropMenu>
            <Arrow />
            <UserRow>
              {showPhoto ? (
                <Avatar
                  src={userPhoto}
                  alt={firstName}
                  style={{ width: 36, height: 36 }}
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <AvatarFallback $large aria-hidden="true">
                  {initial}
                </AvatarFallback>
              )}
              <UserMeta>
                <UserName>{userName}</UserName>
                <UserSub>Personal Drive</UserSub>
              </UserMeta>
            </UserRow>

            <MobileMenuItems>
              <MenuBtn
                onClick={() => {
                  closeMenu();
                  setStorageOpen(true);
                }}
              >
                <MenuIconWrap>
                  <StorageOutlinedIcon style={{ fontSize: 18 }} />
                </MenuIconWrap>
                <MenuBtnBody>
                  <MenuBtnLabel>Storage</MenuBtnLabel>
                  <MenuBtnSub>
                    {storage} of {storageLimitLabel} · {storagePercent.toFixed(0)}%
                  </MenuBtnSub>
                  <MiniTrack>
                    <MiniFill $pct={storagePercent} />
                  </MiniTrack>
                </MenuBtnBody>
              </MenuBtn>

              <MenuBtn
                onClick={() => {
                  closeMenu();
                  dispatch(setHelpModal(true));
                }}
              >
                <MenuIconWrap>
                  <HelpIcon />
                </MenuIconWrap>
                <MenuBtnBody>
                  <MenuBtnLabel>Help &amp; Support</MenuBtnLabel>
                </MenuBtnBody>
              </MenuBtn>

              <ThemeRow>
                <ThemeRowLabel>
                  <MenuBtnLabel>{isDark ? "Dark mode" : "Light mode"}</MenuBtnLabel>
                </ThemeRowLabel>
                <ThemeToggle size="sm" />
              </ThemeRow>
            </MobileMenuItems>

            <Divider />
            <SignOutBtn
              onClick={() => {
                closeMenu();
                handleAuth();
              }}
            >
              Sign out
            </SignOutBtn>
          </DropMenu>
        )}
      </AvatarWrap>

      <HelpModal
        openHelp={openHelp}
        closeHelpModal={() => dispatch(setHelpModal(false))}
      />
      <StorageModal open={storageOpen} onClose={() => setStorageOpen(false)} />
    </Wrap>
  );
};

export default ProfileSection;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  .mobile-only {
    @media (min-width: 769px) {
      display: none;
    }
  }
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--surface-3);
  }

  svg {
    font-size: 22px;
  }
`;

const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
  display: block;
  transition: border-color 0.15s ease;

  ${AvatarBtn}:hover & {
    border-color: var(--primary);
  }
`;

const AvatarFallback = styled.div`
  width: ${(p) => (p.$large ? "36px" : "34px")};
  height: ${(p) => (p.$large ? "36px" : "34px")};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  font-size: ${(p) => (p.$large ? "0.9rem" : "0.82rem")};
  font-weight: 700;
  border: 2px solid var(--border);
  flex-shrink: 0;
  transition: border-color 0.15s ease;

  ${AvatarBtn}:hover & {
    border-color: var(--primary);
  }
`;

const DropMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 12px;
  min-width: 260px;
  max-width: min(300px, calc(100vw - 24px));
  z-index: 950;
  animation: popIn 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const Arrow = styled.div`
  position: absolute;
  top: -5px;
  right: 12px;
  width: 10px;
  height: 10px;
  background: var(--surface);
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
  transform: rotate(45deg);
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 8px;
`;

const UserMeta = styled.div`
  min-width: 0;
`;

const UserName = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserSub = styled.p`
  font-size: 0.75rem;
  color: var(--text-3);
  margin-top: 1px;
`;

const MobileMenuItems = styled.div`
  display: none;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 8px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MenuBtn = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  border-radius: 10px;
  padding: 9px 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: var(--surface-2);
  }
`;

const MenuIconWrap = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--text-2);
  flex-shrink: 0;

  svg {
    font-size: 18px;
  }
`;

const MenuBtnBody = styled.div`
  min-width: 0;
  flex: 1;
  padding-top: 1px;
`;

const MenuBtnLabel = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-1);
`;

const MenuBtnSub = styled.p`
  font-size: 0.72rem;
  color: var(--text-3);
  margin-top: 2px;
`;

const MiniTrack = styled.div`
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 6px;
`;

const MiniFill = styled.div`
  height: 100%;
  width: ${(props) => props.$pct}%;
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  border-radius: 999px;
`;

const ThemeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 10px;

  &:hover {
    background: var(--surface-3);
  }
`;

const ThemeRowLabel = styled.div`
  min-width: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-light);
  margin: 4px 0 8px;
`;

const SignOutBtn = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 9px 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--danger-bg);
  }
`;
