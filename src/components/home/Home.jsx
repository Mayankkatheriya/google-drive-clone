import React from "react";
import Sidebar from "../sidebar/Sidebar";
import Data from "./homeData/Data";
import styled from "styled-components";

const Home = () => {
  return (
    <HomeContainer>
      <Sidebar />
      <Data />
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  position: relative;
`;

export default Home;
