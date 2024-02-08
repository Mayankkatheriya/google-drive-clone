import React from "react";
import styled from "styled-components";
import {
  MobileScreenShareIcon,
  DevicesIcons,
  PeopleAltIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
  CloudQueueIcons,
} from "../common/SvgIcons";
import { NavLink } from "react-router-dom";

const SidebarTabs = () => {
  return (
    <>
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

        <SidebarOption title="Computers">
          <DevicesIcons />
          <span>Computers</span>
        </SidebarOption>
        <SidebarOption title="Shared with me">
          <PeopleAltIcon />
          <span>Shared with me</span>
        </SidebarOption>

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
