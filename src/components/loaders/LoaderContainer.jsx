import React from "react";
import styled from "styled-components";
import Loader from "./Loader";

const LoaderContainer = () => {
  return (
    <Container>
      <Loader />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default LoaderContainer;
