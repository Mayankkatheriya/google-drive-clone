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
} from "../../common/SvgIcons";

const SidebarTabs = () => {
  return (
    <>
      <SidebarOptions>
        <SidebarOption title="My Drive">
          <MobileScreenShareIcon />
          <span>My Drive</span>
        </SidebarOption>
        <SidebarOption title="Computers">
          <DevicesIcons />
          <span>Computers</span>
        </SidebarOption>
        <SidebarOption title="Shared with me">
          <PeopleAltIcon />
          <span>Shared with me</span>
        </SidebarOption>
        <SidebarOption title="Recent">
          <QueryBuilderIcon />
          <span>Recent</span>
        </SidebarOption>
        <SidebarOption title="Starred">
          <StarBorderIcon />
          <span>Starred</span>
        </SidebarOption>
        <SidebarOption title="Trash">
          <DeleteOutlineIcon />
          <span>Trash</span>
        </SidebarOption>
      </SidebarOptions>

      <hr />

      <SidebarOptions>
        <SidebarOption title="Storage">
          <CloudQueueIcons />
          <span>Storage</span>
        </SidebarOption>
        <div className="progress_bar">
          <progress size="tiny" value="50" max="100" />
          <span>105 GB of 200 GB used</span>
        </div>
      </SidebarOptions>
    </>
  );
};

const SidebarOptions = styled.div`
  margin-top: 10px;
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
