// PageHeader.js

import React from "react";
import styled from "styled-components";
import { ListsIcon, InfoIcon, GridIcon } from "./SvgIcons";

/**
 * PageHeader component to display the page title with optional icons
 * @param {string} pageTitle - Title of the page
 * @returns {JSX.Element} - Rendered PageHeader component
 */
const PageHeader = ({ pageTitle }) => {
  return (
    <DataHeader>
      <div className="headerLeft">
        <p>{pageTitle}</p>
      </div>
      <div className="headerRight">
        {pageTitle === "My Drive" ? <ListsIcon /> : <GridIcon />}
        <InfoIcon />
      </div>
    </DataHeader>
  );
};

const DataHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid lightgray;
  height: 40px;

  .headerLeft {
    display: flex;
    align-items: center;
    font-weight: 600;
  }

  .headerRight svg {
    margin: 0px 10px;
    font-size: 25px;
    color: #5f6368;;
  }
`;

export default PageHeader;
