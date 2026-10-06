"use client";

import styled from "styled-components";
import dynamic from "next/dynamic";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMyFiles, useMyFilesLoading } from "@/context/FilesContext";
import { getQuickAccessFiles } from "@/lib/quickAccess";
import {
  filterFilesForFocus,
  getFocusEmptyState,
} from "@/lib/focusFilter";
import { useFocus } from "@/context/FocusContext";
import { useCurrentFolder } from "@/context/CurrentFolderContext";
import {
  filterByFolder,
  getBreadcrumbPath,
  isFolder,
  sortDriveItems,
} from "@/lib/folders";
import RecentDataGrid from "./RecentDataGrid";
import PageHeader from "../common/PageHeader";
import FolderBreadcrumbs from "../common/FolderBreadcrumbs";
import { Page } from "../common/PageShell";
import ContentSkeleton from "@/components/common/skeleton/ContentSkeleton";
import { getUploadHelpText } from "@/lib/uploadLimits";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";
import CompareModeBar from "../common/CompareModeBar";
import FocusFilterBar from "../common/FocusFilterBar";
import SelectionModeBar from "../common/SelectionModeBar";

const MainData = dynamic(() => import("./MainData"), { ssr: false });
const FilesList = lazy(() => import("../common/FilesList"));

const VIEW_STORAGE_KEY = "driveViewMode";

function DataInner() {
  const files = useMyFiles();
  const filesLoading = useMyFilesLoading();
  const { active: focusActive, filter } = useFocus();
  const { folderId, setFolderId } = useCurrentFolder();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    const fromUrl = searchParams.get("folder");
    setFolderId(fromUrl || null);
  }, [searchParams, setFolderId]);

  const navigateFolder = useCallback(
    (id) => {
      setFolderId(id);
      if (!id) {
        router.push("/home");
      } else {
        router.push(`/home?folder=${encodeURIComponent(id)}`);
      }
    },
    [router, setFolderId],
  );

  const folderFiles = useMemo(() => {
    if (focusActive) return filterFilesForFocus(files, filter);
    return sortDriveItems(filterByFolder(files, folderId));
  }, [files, folderId, focusActive, filter]);

  const quickAccess = useMemo(() => {
    if (focusActive || folderId) return [];
    return getQuickAccessFiles(files.filter((f) => !isFolder(f)));
  }, [files, focusActive, folderId]);

  const crumbs = useMemo(
    () => getBreadcrumbPath(files, folderId),
    [files, folderId],
  );

  const focusEmpty = getFocusEmptyState(filter);
  const currentFolderName =
    crumbs.length > 0 ? crumbs[crumbs.length - 1].name : "My Drive";

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }, []);

  return (
    <Page>
      <PageHeader
        pageTitle={focusActive ? "Focus" : "My Drive"}
        folderLabel={!focusActive && folderId ? currentFolderName : null}
        subtitle={PAGE_SUBTITLES.myDrive.subtitle}
        subtitleMobile={PAGE_SUBTITLES.myDrive.subtitleMobile}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        breadcrumbs={
          !focusActive ? (
            <FolderBreadcrumbs crumbs={crumbs} onNavigate={navigateFolder} />
          ) : null
        }
      />

      {focusActive && (
        <FocusFilterBar fileCount={folderFiles.length} totalCount={files.length} />
      )}

      {!focusActive && quickAccess.length > 0 && (
        <QuickSection>
          <SectionLabel>Quick Access</SectionLabel>
          <RecentDataGrid files={quickAccess} allFiles={files} />
        </QuickSection>
      )}

      <Section $focus={focusActive} data-tour="files">
        {folderFiles.length > 0 && (
          <SectionLabel>
            {focusActive ? "Your files" : folderId ? "Files" : "All Files"}
          </SectionLabel>
        )}
        {filesLoading ? (
          <ContentSkeleton grid={viewMode === "grid"} compact={viewMode === "grid"} />
        ) : viewMode === "grid" ? (
          <Suspense fallback={<ContentSkeleton grid compact />}>
            <FilesList
              data={folderFiles}
              allFiles={files}
              page="drive"
              focusMode={focusActive}
              onOpenFolder={navigateFolder}
              imagePath="/homePage.svg"
              text1={
                focusActive
                  ? focusEmpty.text1
                  : folderId
                    ? "This folder is empty"
                    : "A place for all of your files"
              }
              text2={focusActive ? focusEmpty.text2 : getUploadHelpText()}
              compact
            />
          </Suspense>
        ) : (
          <MainData
            files={folderFiles}
            allFiles={files}
            focusMode={focusActive}
            onOpenFolder={navigateFolder}
          />
        )}
      </Section>
      {!focusActive && <CompareModeBar />}
      {!focusActive && <SelectionModeBar />}
    </Page>
  );
}

const Data = () => (
  <Suspense fallback={<Page><ContentSkeleton /></Page>}>
    <DataInner />
  </Suspense>
);

const Section = styled.div`
  padding: 0 24px;

  &:last-child {
    padding-bottom: 24px;
  }

  ${(p) =>
    p.$focus &&
    `
    padding-top: 0;
  `}

  @media (max-width: 768px) {
    padding: 0;

    &:last-child {
      padding-bottom: 0;
    }
  }
`;

const QuickSection = styled(Section)`
  padding-top: 4px;
  padding-bottom: 20px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    padding: 8px 0 16px;
    margin-bottom: 4px;
  }
`;

const SectionLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-3);
  margin-bottom: 10px;

  @media (max-width: 768px) {
    margin-bottom: 8px;
    padding-left: 16px;
  }
`;

export default Data;
