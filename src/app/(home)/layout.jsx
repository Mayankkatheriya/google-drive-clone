"use client";

import styled from "styled-components";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FilesProvider } from "@/context/FilesContext";
import { FilePreviewProvider } from "@/context/FilePreviewContext";
import FilePreviewModal from "@/components/common/FilePreviewModal";

export default function HomeLayout({ children }) {
  return (
    <FilesProvider>
      <FilePreviewProvider>
        <Header />
        <ProtectedRoute>
          <HomeContainer>
            <Sidebar />
            {children}
          </HomeContainer>
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
  min-height: calc(100vh - 64px);
  background: var(--surface-3);
`;
