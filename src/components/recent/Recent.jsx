"use client";

import React, { Suspense, lazy, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useMyFiles, useMyFilesLoading } from "@/context/FilesContext";
import ContentSkeleton from "@/components/common/skeleton/ContentSkeleton";
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
  const router = useRouter();

  const recentFiles = useMemo(
    () =>
      [...files]
        .sort((a, b) => getActivityTime(b) - getActivityTime(a))
        .slice(0, 9),
    [files],
  );

  const openFolder = useCallback(
    (id) => {
      if (!id) {
        router.push("/home");
        return;
      }
      router.push(`/home?folder=${encodeURIComponent(id)}`);
    },
    [router],
  );

  return (
    <Page>
      <PageHeader
        pageTitle="Recent"
        subtitle={PAGE_SUBTITLES.recent.subtitle}
      />
      {filesLoading ? (
        <ContentSkeleton grid />
      ) : (
        <Suspense fallback={<ContentSkeleton grid />}>
          <FilesList
            data={recentFiles}
            allFiles={files}
            imagePath={"/recent.svg"}
            text1={"No recent files"}
            text2={"See all the files you've recently edited or added"}
            onOpenFolder={openFolder}
          />
        </Suspense>
      )}
    </Page>
  );
};

export default Recent;
