"use client";

import React, { Suspense, lazy, useMemo } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useMyFiles, useMyFilesLoading } from "@/context/FilesContext";
import ContentSkeleton from "@/components/common/skeleton/ContentSkeleton";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";
const FilesList = lazy(() => import("../common/FilesList"));

const Starred = () => {
  const files = useMyFiles();
  const filesLoading = useMyFilesLoading();
  const starredFiles = useMemo(
    () => files.filter((file) => file.data.starred),
    [files]
  );

  return (
    <Page>
      <PageHeader
        pageTitle="Starred"
        subtitle={PAGE_SUBTITLES.starred.subtitle}
      />
      {filesLoading ? (
        <ContentSkeleton grid />
      ) : (
        <Suspense fallback={<ContentSkeleton grid />}>
          <FilesList
            data={starredFiles}
            page="starred"
            imagePath={"/starred.svg"}
            text1={"No starred files"}
            text2={"Add stars to things that you want to easily find later"}
          />
        </Suspense>
      )}
    </Page>
  );
};

export default Starred;
