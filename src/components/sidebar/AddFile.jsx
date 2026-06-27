"use client";

import React from "react";
import styled from "styled-components";
import NewUploadButton from "../common/NewUploadButton";

const AddFile = ({ onClick }) => {
  return (
    <Wrap>
      <NewUploadButton variant="sidebar" onClick={onClick} />
    </Wrap>
  );
};

const Wrap = styled.div`
  padding: 16px 14px 10px;

  @media (max-width: 768px) {
    padding: 12px 8px 8px;
    display: flex;
    justify-content: center;
  }
`;

export default AddFile;
