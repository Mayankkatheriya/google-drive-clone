// ProfileSection.js

import React from "react";
import styled from "styled-components";
import { SearchIcons, CloseIcon } from "../common/SvgIcons";

/**
 * ProfileSection component displays user profile information and options.
 * @param {Object} props - Component props.
 * @param {string} props.userPhoto - URL of the user's profile photo.
 * @param {string} props.userName - User's name.
 * @param {Function} props.handleAuth - Click event handler for authentication.
 * @param {boolean} props.showSearch - Boolean indicating whether the search bar is visible.
 * @param {Function} props.setShowSearch - Function to toggle the visibility of the search bar.
 * @returns {JSX.Element} - ProfileSection component.
 */
const ProfileSection = ({
  userPhoto,
  userName,
  handleAuth,
  showSearch,
  setShowSearch,
}) => {
  return (
    <RightSection>
      <div className="searchIcon" onClick={setShowSearch}>
        {showSearch ? <CloseIcon /> : <SearchIcons />}
      </div>
      <SignOut>
        <UserImg src={userPhoto} alt={userName} />
        <DropDown>
          <span onClick={handleAuth}>Sign out</span>
        </DropDown>
      </SignOut>
    </RightSection>
  );
};

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    font-size: 35px;
    color: #5f6368;
    padding: 5px;
    cursor: pointer;
    border-radius: 50%;
    transition: all 200ms ease-out;
    :hover {
      background-color: rgba(0, 0, 0, 0.09);
    }
  }

  .searchIcon {
    display: flex;
  }
`;

const UserImg = styled.img`
  height: 100%;

  @media (max-width: 830px) {
    height: 40px;
  }
`;

const DropDown = styled.div`
  position: absolute;
  top: 50px;
  right: -18px;
  background: #fff;
  border: 1px solid rgba(151, 151, 151, 0.34);
  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 50%) 0px 0px 18px 0px;
  padding: 10px;
  font-size: 14px;
  letter-spacing: 3px;
  width: 100px;
  display: none;
`;

const SignOut = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;

  ${DropDown} {
    &::before {
      content: "";
      width: 15px;
      height: 15px;
      position: absolute;
      left: 50%;
      top: -5px;
      background-color: #fff;
      transform: rotate(45deg);
    }
  }

  ${UserImg} {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }

  &:hover {
    ${DropDown} {
      display: flex;
      transition-duration: 1s;
    }
  }
`;

export default ProfileSection;
