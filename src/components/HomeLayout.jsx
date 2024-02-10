// HomeLayout.js

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import styled from "styled-components";
import ProtectedRoute from "./ProtectedRoute";
import Header from "./header/Header";

const HomeLayout = () => {
  return (
    <>
      <Header />
      <ProtectedRoute>
        <HomeContainer>
          <Sidebar />
          <Outlet />
        </HomeContainer>
      </ProtectedRoute>
    </>
  );
};

const HomeContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  position: relative;
`;

export default HomeLayout;
