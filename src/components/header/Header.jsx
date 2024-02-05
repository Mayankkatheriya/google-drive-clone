import React from "react";
import styled from "styled-components";
import { Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import FormatAlignCenterOutlinedIcon from "@mui/icons-material/FormatAlignCenterOutlined";
// import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Container>
      <Wrapper>
        {/* <Link to=""> */}
        <Logo>
          <img src="./google-logo.png" alt="" />
          <span>Drive</span>
        </Logo>
        {/* </Link> */}
        <InputContainer>
          <SearchContainer>
            <SearchIcon />
            <input type="text" placeholder="Search in Drive" />
            <FormatAlignCenterOutlinedIcon />
          </SearchContainer>
        </InputContainer>

        <RightContainer>
          <LeftSection>
            <HelpOutlineIcon />
            <SettingsOutlinedIcon />
          </LeftSection>
          <RightSection>
            <AppsOutlinedIcon className="app" />
            <Avatar />
          </RightSection>
        </RightContainer>
      </Wrapper>
    </Container>
  );
};
export default Header;

const Container = styled.div`
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #ffffff;
  padding: 2px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 20px;
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

const InputContainer = styled.div`
  flex: 1;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SearchContainer = styled.div`
  width: 64%;
  height: 50px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.09);
  border-radius: 30px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 /0.05);

  svg:first-child {
    cursor: pointer;
    margin-left: 10px;
    color: #5f6368;
  }

  input {
    font-size: 16px;
    padding: 0 10px;
    outline: none;
    width: 90%;
    height: 80%;
    font-family: Sans, Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    margin: 0 auto;
    background-color: transparent;
    :focus {
      outline: none;
    }

    border: none;
  }

  svg:last-child {
    cursor: pointer;
    margin-right: 10px;
    color: #5f6368;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;

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

  .app {
    margin-right: 15px;
  }
`;

const LeftSection = styled(RightSection)`
  margin-right: 40px;

  svg {
    margin: 0 10px;
  }
`;
