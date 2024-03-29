// LogoWrapperComponent.js

import React from "react";
import styled from "styled-components";
import { MenuIcon } from "../common/SvgIcons";
import { Link } from "react-router-dom";
// import Lottie from "react-lottie-player";
// import lottieJson from "../lottie/homePageLottie.json";

/**
 * LogoWrapperComponent displays the logo and menu icon.
 * @param {Object} props - Component props.
 * @param {Function} props.onClick - Click event handler for the menu icon.
 * @param {string} props.userName - User name to determine whether to show the menu icon.
 * @returns {JSX.Element} - LogoWrapperComponent.
 */
const LogoWrapperComponent = ({ onClick, userName }) => {
  return (
    <LogoWrapper>
      <div className="menu-icon" onClick={onClick}>
        {userName && <MenuIcon />}
      </div>
      <Link to={"/home"}>
        <Logo>
          <img src="./google-logo.png" alt="" />
          {/* <Lottie
            loop
            animationData={lottieJson}
            play
            style={{ width: 120, height: 40 }}
          /> */}
          <span>Drive</span>
        </Logo>
      </Link>
    </LogoWrapper>
  );
};

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  .menu-icon {
    cursor: pointer;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
  }

  span {
    font-family: "Product Sans", Arial, sans-serif;
    color: #5f6368;
    font-size: 22px;
    padding-left: 8px;
  }
`;

export default LogoWrapperComponent;
