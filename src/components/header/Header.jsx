"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { auth, provider } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserName,
  selectUserPhoto,
  setSignOutState,
  setUserLoginDetails,
} from "../../store/UserSlice";
import { selectSidebarBool, setSidebarBool } from "../../store/BoolSlice";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import LogoWrapperComponent from "./LogoWrapper";
import SearchBar from "./SearchBar";
import LeftIcons from "./LeftIcons";
import ProfileSection from "./ProfileSection";

const Header = () => {
  const dispatch = useDispatch();
  const { authReady } = useAuth();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const sidebarBool = useSelector(selectSidebarBool);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!userName) {
      try {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
      } catch (error) {
        console.error(error.message);
      }
    } else {
      try {
        await signOut(auth);
        dispatch(setSignOutState());
        router.push("/");
      } catch (error) {
        console.log("Error signing out: ", error.message);
      }
    }
  };

  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        photo: user.photoURL,
      })
    );
  };

  return (
    <Container>
      <Wrapper>
        {/* Left */}
        <Left>
          <LogoWrapperComponent
            onClick={() => dispatch(setSidebarBool(!sidebarBool))}
            userName={userName}
            sidebarOpen={sidebarBool}
          />
        </Left>

        {/* Center — hidden on mobile */}
        {authReady && userName && (
          <Center>
            <SearchBar />
          </Center>
        )}

        {/* Right */}
        <Right>
          {!authReady ? null : !userName ? (
            <LoginBtn onClick={handleAuth}>Sign in</LoginBtn>
          ) : (
            <>
              <LeftIcons />
              <ProfileSection
                userPhoto={userPhoto}
                userName={userName}
                handleAuth={handleAuth}
                showSearch={showSearch}
                setShowSearch={() => setShowSearch((p) => !p)}
              />
            </>
          )}
        </Right>
      </Wrapper>

      {/* Mobile search drawer */}
      {showSearch && (
        <MobileSearch>
          <SearchBar variant="mobile" onClose={() => setShowSearch(false)} />
        </MobileSearch>
      )}
    </Container>
  );
};

export default Header;

const Container = styled.header`
  flex-shrink: 0;
  z-index: 999;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 12px;
  gap: 8px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  min-width: 0;
`;

const Center = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
`;

const LoginBtn = styled.button`
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
`;

const MobileSearch = styled.div`
  padding: 8px 12px 12px;
  border-top: 1px solid var(--border-light);
  animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (min-width: 769px) {
    display: none;
  }
`;
