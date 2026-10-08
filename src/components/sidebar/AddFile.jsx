"use client";

import React from "react";
import styled from "styled-components";
import NewUploadButton from "../common/NewUploadButton";

const AddFile = ({ onClick, onCreateFolder }) => {
  return (
    <Wrap data-tour="upload">
      <NewUploadButton
        variant="sidebar"
        onClick={onClick}
        onCreateFolder={onCreateFolder}
      />
    </Wrap>
  );
};

const Wrap = styled.div`
  padding: 0;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
  }
`;

export default AddFile;
