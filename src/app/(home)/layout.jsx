"use client";

import dynamic from "next/dynamic";
import styled from "styled-components";
import Header from "@/components/header/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FilesProvider } from "@/context/FilesContext";
import { FilePreviewProvider } from "@/context/FilePreviewContext";
import { CompareProvider } from "@/context/CompareContext";
import { FocusProvider } from "@/context/FocusContext";
import { FileUploadProvider } from "@/context/FileUploadContext";
import FilePreviewModal from "@/components/common/FilePreviewModal";
import CompareModal from "@/components/common/CompareModal";
import FocusLayoutGate from "@/components/common/FocusLayoutGate";
import SidebarPlaceholder from "@/components/sidebar/SidebarPlaceholder";

const Sidebar = dynamic(() => import("@/components/sidebar/Sidebar"), {
  ssr: false,
  loading: () => <SidebarPlaceholder />,
});

const DropZone = dynamic(() => import("@/components/common/DropZone"), {
  ssr: false,
});

const MobileBottomNav = dynamic(
  () => import("@/components/mobile/MobileBottomNav"),
  { ssr: false },
);

export default function HomeLayout({ children }) {
  return (
    <FilesProvider>
      <FilePreviewProvider>
        <CompareProvider>
          <FocusProvider>
            <FileUploadProvider>
              <ProtectedRoute>
                <AppShell>
                  <Header />
                  <ShellBody>
                    <HomeContainer>
                      <FocusLayoutGate>
                        <Sidebar />
                      </FocusLayoutGate>
                      <MainContent>{children}</MainContent>
                    </HomeContainer>
                    <FocusLayoutGate>
                      <MobileBottomNav />
                    </FocusLayoutGate>
                  </ShellBody>
                </AppShell>
              </ProtectedRoute>
              <DropZone />
              <FilePreviewModal />
              <CompareModal />
            </FileUploadProvider>
          </FocusProvider>
        </CompareProvider>
      </FilePreviewProvider>
    </FilesProvider>
  );
}

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
`;

const ShellBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const HomeContainer = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--surface-3);
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
