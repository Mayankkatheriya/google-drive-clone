"use client";

import styled from "styled-components";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FilesProvider } from "@/context/FilesContext";
import { FilePreviewProvider } from "@/context/FilePreviewContext";
import FilePreviewModal from "@/components/common/FilePreviewModal";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";

export default function HomeLayout({ children }) {
  return (
    <FilesProvider>
      <FilePreviewProvider>
        <Header />
        <ProtectedRoute>
          <HomeContainer>
            <Sidebar />
            <MainContent>{children}</MainContent>
          </HomeContainer>
          <MobileBottomNav />
        </ProtectedRoute>
        <FilePreviewModal />
      </FilePreviewProvider>
    </FilesProvider>
  );
}

const HomeContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: calc(100vh - var(--header-height));
  background: var(--surface-3);

  @media (max-width: 768px) {
    min-height: calc(100vh - var(--header-height) - var(--bottom-nav-height));
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;
