"use client";

import React, { Suspense, lazy, useMemo } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useMyFiles } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";

const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

function getActivityTime(file) {
  return (
    file.data.lastOpenedAt?.seconds ??
    file.data.timestamp?.seconds ??
    0
  );
}

const Recent = () => {
  const files = useMyFiles();
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
      <Suspense fallback={<LoaderContainer />}>
        <FilesList
          data={recentFiles}
          imagePath={"/recent.svg"}
          text1={"No recent files"}
          text2={"See all the files you've recently edited or added"}
        />
      </Suspense>
    </Page>
  );
};

export default Recent;
