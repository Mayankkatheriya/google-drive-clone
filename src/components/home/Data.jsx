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
import PageHeader from "../common/PageHeader";
import FolderBreadcrumbs from "../common/FolderBreadcrumbs";
import { Page } from "../common/PageShell";
import ContentSkeleton from "@/components/common/skeleton/ContentSkeleton";
import { getUploadHelpText } from "@/lib/uploadLimits";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";
import CompareModeBar from "../common/CompareModeBar";
import FocusFilterBar from "../common/FocusFilterBar";
import SelectionModeBar from "../common/SelectionModeBar";
import DriveTypeFilter from "./DriveTypeFilter";

const MainData = dynamic(() => import("./MainData"), { ssr: false });
const FilesList = lazy(() => import("../common/FilesList"));

const VIEW_STORAGE_KEY = "driveViewMode";
const TYPE_FILTER_KEY = "driveTypeFilter";

function DataInner() {
  const files = useMyFiles();
  const filesLoading = useMyFilesLoading();
  const { active: focusActive, filter } = useFocus();
  const { folderId, setFolderId } = useCurrentFolder();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState("list");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const itemsInFolder = useMemo(() => {
    if (focusActive) return filterFilesForFocus(files, filter);
    return sortDriveItems(filterByFolder(files, folderId));
  }, [files, folderId, focusActive, filter]);

  const folderCount = useMemo(
    () => itemsInFolder.filter((f) => isFolder(f)).length,
    [itemsInFolder],
  );
  const fileCount = itemsInFolder.length - folderCount;

  const visibleItems = useMemo(() => {
    if (focusActive || typeFilter === "all") return itemsInFolder;
    if (typeFilter === "folders") {
      return itemsInFolder.filter((f) => isFolder(f));
    }
    return itemsInFolder.filter((f) => !isFolder(f));
  }, [itemsInFolder, typeFilter, focusActive]);

  const crumbs = useMemo(
    () => getBreadcrumbPath(files, folderId),
    [files, folderId],
  );

  const focusEmpty = getFocusEmptyState(filter);
  const currentFolderName =
    crumbs.length > 0 ? crumbs[crumbs.length - 1].name : "My Drive";

  useEffect(() => {
    const savedView = localStorage.getItem(VIEW_STORAGE_KEY);
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
    const savedType = localStorage.getItem(TYPE_FILTER_KEY);
    if (savedType === "all" || savedType === "folders" || savedType === "files") {
      setTypeFilter(savedType);
    }
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }, []);

  const handleTypeFilterChange = useCallback((next) => {
    setTypeFilter(next);
    localStorage.setItem(TYPE_FILTER_KEY, next);
  }, []);

  const emptyTitle = focusActive
    ? focusEmpty.text1
    : typeFilter === "folders"
      ? "No folders here"
      : typeFilter === "files"
        ? "No files here"
        : folderId
          ? "This folder is empty"
          : "A place for all of your files";

  const emptySubtitle = focusActive
    ? focusEmpty.text2
    : typeFilter === "folders"
      ? "Create a folder with New → New folder."
      : typeFilter === "files"
        ? "Upload a file with New → File upload."
        : getUploadHelpText();

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
        <FocusFilterBar
          fileCount={visibleItems.length}
          totalCount={files.length}
        />
      )}

      <Section $focus={focusActive} data-tour="files">
        {!focusActive && (
          <DriveTypeFilter
            value={typeFilter}
            onChange={handleTypeFilterChange}
            folderCount={folderCount}
            fileCount={fileCount}
          />
        )}

        {visibleItems.length > 0 && (
          <SectionLabel>
            {focusActive
              ? "Your files"
              : typeFilter === "folders"
                ? "Folders"
                : typeFilter === "files"
                  ? "Files"
                  : folderId
                    ? "Files"
                    : "All files"}
          </SectionLabel>
        )}

        {filesLoading ? (
          <ContentSkeleton
            grid={viewMode === "grid"}
            compact={viewMode === "grid"}
          />
        ) : viewMode === "grid" ? (
          <Suspense
            fallback={
              <ContentSkeleton grid compact />
            }
          >
            <FilesList
              data={visibleItems}
              allFiles={files}
              page="drive"
              focusMode={focusActive}
              onOpenFolder={navigateFolder}
              imagePath="/homePage.svg"
              text1={emptyTitle}
              text2={emptySubtitle}
              compact
            />
          </Suspense>
        ) : visibleItems.length > 0 ? (
          <MainData
            files={visibleItems}
            allFiles={files}
            focusMode={focusActive}
            onOpenFolder={navigateFolder}
          />
        ) : (
          <Suspense
            fallback={
              <ContentSkeleton
                grid={viewMode === "grid"}
                compact={viewMode === "grid"}
              />
            }
          >
            <FilesList
              data={[]}
              allFiles={files}
              page="drive"
              focusMode={focusActive}
              onOpenFolder={navigateFolder}
              imagePath="/homePage.svg"
              text1={emptyTitle}
              text2={emptySubtitle}
              compact
            />
          </Suspense>
        )}
      </Section>
      {!focusActive && <CompareModeBar />}
      {!focusActive && <SelectionModeBar items={visibleItems} />}
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
