import React, { useState } from "react";
import styled from "styled-components";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
  CloudQueueIcons,
  HelpIcon,
  GitIcon,
  FacebookIcon,
  InstaIcon,
  LinkedIcon,
} from "../common/SvgIcons";
import { Modal } from "@mui/material";
import { NavLink } from "react-router-dom";

const SidebarTabs = () => {
  const [openHelp, setOpenModal] = useState(false)
  return (
    <>
      <Modal open={openHelp} onClose={() => setOpenModal(false)}>
        <ModalPopup>
            <ModalHeading>
              <h3>
                Help
              </h3>
            </ModalHeading>
            <ModalBody>
              <div className="image">
                <img src="/myimg.png" alt="" />
              </div>
              <h2>Mayank Gupta</h2>
              <h4>Full Stack Web Developer</h4>
              <p>Contact Me:</p>
              <div className="links">
                <a href="https://github.com/Mayankkatheriya" target="_blank" rel="noopener noreferrer"><GitIcon />Github</a>
                <a href="https://www.linkedin.com/in/mayank-gupta-752328173/" target="_blank" rel="noopener noreferrer"><LinkedIcon />LinkedIn</a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><InstaIcon />Instagram</a>
                <a href="https://www.facebook.com/mayakkatheriya/" target="_blank" rel="noopener noreferrer"><FacebookIcon />Facebook</a>
              </div>
            </ModalBody>
        </ModalPopup>
      </Modal>
      <SidebarOptions>
        <NavLink to={"/home"}>
          {({ isActive }) => (
            <SidebarOption
              title="My Drive"
              className={isActive ? "tab-active" : ""}
            >
              <MobileScreenShareIcon />
              <span>My Drive</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/recent"}>
          {({ isActive }) => (
            <SidebarOption
              to={"/recent"}
              className={isActive ? "tab-active" : ""}
              title="Recent"
            >
              <QueryBuilderIcon />
              <span>Recent</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/starred"}>
          {({ isActive }) => (
            <SidebarOption
              title="Starred"
              className={isActive ? "tab-active" : ""}
            >
              <StarBorderIcon />
              <span>Starred</span>
            </SidebarOption>
          )}
        </NavLink>

        <NavLink to={"/trash"}>
          {({ isActive }) => (
            <SidebarOption
              title="Trash"
              className={isActive ? "tab-active" : ""}
            >
              <DeleteOutlineIcon />
              <span>Trash</span>
            </SidebarOption>
          )}
        </NavLink>

        <SidebarOption title="Help" onClick={() => setOpenModal(true)}>
          <HelpIcon />
          <span>Help</span>
        </SidebarOption>
      </SidebarOptions>

      <hr />

      <SidebarOptions>
        <SidebarOption title="Storage">
          <CloudQueueIcons />
          <span>Storage</span>
        </SidebarOption>
        <div className="progress_bar">
          <progress size="tiny" value="22" max="100" />
          <span>1.1 GB of 5 GB used</span>
        </div>
      </SidebarOptions>
    </>
  );
};

const ModalPopup = styled.div`
  top: 50%;
  background-color: #fff;
  width: 100%;
  max-width: 500px;
  margin: 0px auto;
  position: relative;
  transform: translateY(-50%);
  padding: 10px;
  border-radius: 10px;
`;

const ModalHeading = styled.div`
  text-align: center;
  border-bottom: 1px solid lightgray;
  height: 40px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .image {
    width: 100%;
    max-width: 150px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1rem;

    img {
      height: 100%;
      width: 100%;
    }
  }
  h4 {
    margin-bottom: 1rem;
    color: #6b6b6b;
    font-size: .9rem;
    letter-spacing: 1px;
  }

  p {
    margin-bottom: .5rem;
    text-decoration: underline;
  }

  .links {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    a {
      display: flex;
      align-items: center;
      gap: 5px;

      &:nth-child(1) {
        color: #000;
      }

      &:nth-child(2) {
        color: #0077B5;
      }

      &:nth-child(3) {
        color: #CC2E96;
      }

      &:nth-child(4) {
        color: #1197F5;
      }
    }
  }
`;

const SidebarOptions = styled.div`
  margin-top: 10px;

  a {
    text-decoration: none;
  }

  .tab-active {
    background: whitesmoke;
  }

  .progress_bar {
    padding: 0px 20px;
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
  .progress_bar span {
    display: block;
    color: #333;
    font-size: 13px;
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
  @media screen and (max-width: 768px) {
    &:last-child {
      display: none;
    }
  }
`;

const SidebarOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 0px 20px 20px 0px;
  &:hover {
    background: whitesmoke;
    cursor: pointer;
  }
  svg.MuiSvgIcon-root {
    color: rgb(78, 78, 78);
  }
  span {
    margin-left: 15px;
    font-size: 13px;
    font-weight: 500;
    color: rgb(78, 78, 78);

    @media screen and (max-width: 768px) {
      display: none;
    }
  }
`;

export default SidebarTabs;
