"use client";

import React, { Suspense, lazy, useMemo } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useMyFiles, useMyFilesLoading } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";

const FilesList = lazy(() => import("../common/FilesList"));

function getActivityTime(file) {
  return (
    file.data.lastOpenedAt?.seconds ??
    file.data.timestamp?.seconds ??
    0
  );
}

const Recent = () => {
  const files = useMyFiles();
  const filesLoading = useMyFilesLoading();
  const recentFiles = useMemo(
    () =>
      [...files]
        .sort((a, b) => getActivityTime(b) - getActivityTime(a))
        .slice(0, 9),
    [files]
  );

  return (
    <Page>
      <PageHeader
        pageTitle="Recents"
        subtitle={PAGE_SUBTITLES.recent.subtitle}
      />
      {filesLoading ? (
        <LoaderContainer grid />
      ) : (
        <Suspense fallback={<LoaderContainer grid />}>
          <FilesList
            data={recentFiles}
            imagePath={"/recent.svg"}
            text1={"No recent files"}
            text2={"See all the files you've recently edited or added"}
          />
        </Suspense>
      )}
    </Page>
  );
};

export default Recent;
