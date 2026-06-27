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
import { useMyFiles, useMyFilesLoading } from "@/context/FilesContext";
import { getQuickAccessFiles } from "@/lib/quickAccess";
import {
  filterFilesForFocus,
  getFocusEmptyState,
} from "@/lib/focusFilter";
import { useFocus } from "@/context/FocusContext";
import RecentDataGrid from "./RecentDataGrid";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import ContentSkeleton from "@/components/common/skeleton/ContentSkeleton";
import { getUploadHelpText } from "@/lib/uploadLimits";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";
import CompareModeBar from "../common/CompareModeBar";
import FocusFilterBar from "../common/FocusFilterBar";

const MainData = dynamic(() => import("./MainData"), { ssr: false });
const FilesList = lazy(() => import("../common/FilesList"));

const VIEW_STORAGE_KEY = "driveViewMode";

const Data = () => {
  const files = useMyFiles();
  const filesLoading = useMyFilesLoading();
  const { active: focusActive, filter } = useFocus();
  const [viewMode, setViewMode] = useState("list");
  const quickAccessFiles = useMemo(() => getQuickAccessFiles(files), [files]);
  const visibleFiles = useMemo(
    () => (focusActive ? filterFilesForFocus(files, filter) : files),
    [files, focusActive, filter],
  );
  const focusEmpty = getFocusEmptyState(filter);

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
        pageTitle="My Drive"
        subtitle={PAGE_SUBTITLES.myDrive.subtitle}
        subtitleMobile={PAGE_SUBTITLES.myDrive.subtitleMobile}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {focusActive && (
        <FocusFilterBar fileCount={visibleFiles.length} totalCount={files.length} />
      )}

      {!focusActive && quickAccessFiles.length > 0 && (
        <QuickSection>
          <SectionLabel>Quick Access</SectionLabel>
          <RecentDataGrid files={quickAccessFiles} allFiles={files} />
        </QuickSection>
      )}

      <Section $focus={focusActive}>
        {visibleFiles.length > 0 && (
          <SectionLabel>
            {focusActive ? "Your files" : "All Files"}
          </SectionLabel>
        )}
        {filesLoading ? (
          <ContentSkeleton grid={viewMode === "grid"} compact={viewMode === "grid"} />
        ) : viewMode === "grid" ? (
          <Suspense fallback={<ContentSkeleton grid compact />}>
            <FilesList
              data={visibleFiles}
              page="drive"
              focusMode={focusActive}
              imagePath={focusActive ? "/homePage.svg" : "/homePage.svg"}
              text1={focusActive ? focusEmpty.text1 : "A place for all of your files"}
              text2={
                focusActive ? focusEmpty.text2 : getUploadHelpText()
              }
              compact
            />
          </Suspense>
        ) : (
          <MainData files={visibleFiles} focusMode={focusActive} />
        )}
      </Section>
      {!focusActive && <CompareModeBar />}
    </Page>
  );
};

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
