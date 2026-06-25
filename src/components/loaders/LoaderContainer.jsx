"use client";

import styled from "styled-components";
import Loader from "./Loader";

const LoaderContainer = () => {
  return (
    <Wrap>
      <Loader />
    </Wrap>
  );
};

const Wrap = styled.div`
  width: 100%;
  padding: 64px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default LoaderContainer;
