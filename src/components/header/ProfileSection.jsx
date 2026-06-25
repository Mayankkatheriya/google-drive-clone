"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { SearchIcons, CloseIcon } from "../common/SvgIcons";

const ProfileSection = ({
  userPhoto,
  userName,
  handleAuth,
  showSearch,
  setShowSearch,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const firstName = userName?.split(" ")[0] ?? "";

  return (
    <Wrap>
      {/* Mobile search toggle */}
      <IconBtn
        onClick={setShowSearch}
        aria-label="Toggle search"
        className="mobile-only"
      >
        {showSearch ? <CloseIcon /> : <SearchIcons />}
      </IconBtn>

      {/* Avatar + dropdown */}
      <AvatarWrap ref={ref}>
        <AvatarBtn onClick={() => setOpen((p) => !p)} aria-label="Account menu">
          <Avatar src={userPhoto} alt={firstName} />
        </AvatarBtn>

        {open && (
          <DropMenu>
            <Arrow />
            <UserRow>
              <Avatar src={userPhoto} alt={firstName} style={{ width: 36, height: 36 }} />
              <UserMeta>
                <UserName>{userName}</UserName>
                <UserSub>Personal Drive</UserSub>
              </UserMeta>
            </UserRow>
            <Divider />
            <SignOutBtn
              onClick={() => {
                setOpen(false);
                handleAuth();
              }}
            >
              Sign out
            </SignOutBtn>
          </DropMenu>
        )}
      </AvatarWrap>
    </Wrap>
  );
};

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  .mobile-only {
    @media (min-width: 769px) { display: none; }
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

  &:hover { background: var(--surface-3); }
  svg { font-size: 22px; }
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

  ${AvatarBtn}:hover & { border-color: var(--primary); }
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
  min-width: 220px;
  z-index: 200;
  animation: popIn 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  @keyframes popIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
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

  &:hover { background: #fef2f2; }
`;

export default ProfileSection;
