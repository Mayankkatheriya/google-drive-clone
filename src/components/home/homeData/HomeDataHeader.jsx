import React from "react";
import styled from "styled-components";
import { ArrowDDownIcon, ListsIcon, InfoIcon } from "../../common/SvgIcons";

const HomeDataHeader = () => {
  return (
    <DataHeader>
      <div className="headerLeft">
        <p>My Drive</p>
        <ArrowDDownIcon />
      </div>
      <div className="headerRight">
        <ListsIcon />
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
  }
  .headerRight svg {
    margin: 0px 10px;
  }
`;

export default HomeDataHeader;