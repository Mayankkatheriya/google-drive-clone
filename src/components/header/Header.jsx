// Header.js

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { auth, provider } from "../../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserName,
  selectUserPhoto,
  setSignOutState,
  setUserLoginDetails,
} from "../../store/UserSlice";
import { selectSidebarBool, setSidebarBool } from "../../store/BoolSlice";
import { useNavigate } from "react-router-dom";
import LogoWrapperComponent from "./LogoWrapper";
import SearchBar from "./SearchBar";
import LeftIcons from "./LeftIcons";
import ProfileSection from "./ProfileSection";
import { SearchIcons } from "../common/SvgIcons";

/**
 * Header component containing the application header with user authentication, search bar, and profile section.
 * @returns {JSX.Element} - Header component.
 */
const Header = () => {
  const dispatch = useDispatch();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const sidebarBool = useSelector(selectSidebarBool);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setQuery] = useState("");
  const navigate = useNavigate();

  // Check if the user is authenticated
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        navigate("/home");
      }
    });
  }, [userName]);

  // Handle user authentication
  const handleAuth = async () => {
    if (!userName) {
      try {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
      } catch (error) {
        console.error(error.message);
      }
    } else if (userName) {
      try {
        await signOut(auth);
        dispatch(setSignOutState());
        navigate("/");
      } catch (error) {
        console.log("Error signing out: ", error.message);
      }
    }
  };

  // Set user details in Redux state
  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        photo: user.photoURL,
      })
    );
  };

  const handleSearchByInput = (e) => {
    if (e.key === "Enter" && searchQuery.length > 0) {
      navigate(`/search/${searchQuery}`);
      setQuery("");
      setShowSearch(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.length > 0) {
      navigate(`/search/${searchQuery}`);
      setQuery("");
      setShowSearch(false);
    }
  };

  return (
    <Container>
      <Wrapper>
        <LogoWrapperComponent
          onClick={() => dispatch(setSidebarBool(!sidebarBool))}
          userName={userName}
        />
        {!userName ? (
          <Login onClick={handleAuth}>Login</Login>
        ) : (
          <>
            <SearchBar />

            <RightContainer>
              <LeftIcons />
              <ProfileSection
                userPhoto={userPhoto}
                userName={userName}
                handleAuth={handleAuth}
                showSearch={showSearch}
                setShowSearch={() => setShowSearch((prev) => !prev)}
              />
            </RightContainer>
          </>
        )}
      </Wrapper>
      <SearchWrapper>
        {showSearch && (
          <div className="searchBar">
            <div className="searchInput">
              <input
                type="search"
                placeholder="Search for a File...."
                value={searchQuery}
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={handleSearchByInput}
              />
              <div className="searchButton" onClick={handleSearch}>
                <SearchIcons />
              </div>
            </div>
          </div>
        )}
      </SearchWrapper>
    </Container>
  );
};

export default Header;

const SearchWrapper = styled.div`
  border-radius: 30px;

  .searchBar {
    width: 100%;
    max-width: 400px;
    height: 30px;
    position: absolute;
    top: 80px;
    right: 10px;
    animation: mobileMenu 0.3s ease forwards;
    .searchInput {
      display: flex;
      align-items: center;
      height: 40px;
      margin-top: 10px;
      width: 100%;
      .searchButton {
        height: 50px;
        background-color: whitesmoke;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0 30px 30px 0;
        border: 1px dashed #000;
        border-left: none;
        cursor: pointer;
        svg {
          font-size: 30px;
          color: #5f6368;
          margin-right: 10px;
        }
      }

      input {
        width: 100%;
        height: 50px;
        background-color: whitesmoke;
        outline: 0;
        border: 0;
        border-radius: 30px 0 0 30px;
        border: 1px dashed #000;
        border-right: none;
        padding: 0 15px;
        font-size: 14px;
      }
    }
    @keyframes mobileMenu {
      0% {
        transform: translateY(-130%);
      }
      100% {
        transform: translateY(0);
      }
    }

    @media screen and (max-width: 430px) {
      right: 0px;
    }
  }
`;

const Container = styled.div`
  position: sticky;
  width: 100%;
  top: 0;
  z-index: 999;
  background-color: #ffffff;
  padding: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 2px 2px 2px #cecece;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 20px;
  position: relative;
`;

const Login = styled.a`
  background-color: #fff;
  padding: 8px 16px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: 1px solid #353535;
  border-radius: 4px;
  transition: all 0.2s ease 0s;

  &:hover {
    background-color: #353535;
    color: #fff;
    border-color: transparent;
  }
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
`;
