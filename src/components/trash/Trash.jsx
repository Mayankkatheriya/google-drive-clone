"use client";

import React, { Suspense, lazy } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useTrashFiles, useTrashFilesLoading } from "@/context/FilesContext";
import ContentSkeleton from "@/components/common/skeleton/ContentSkeleton";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";
import { getTrashRetentionLabel } from "@/lib/trashRetention";
const FilesList = lazy(() => import("../common/FilesList"));

const Trash = () => {
  const files = useTrashFiles();
  const filesLoading = useTrashFilesLoading();

  return (
    <Page>
      <PageHeader
        pageTitle="Trash"
        subtitle={PAGE_SUBTITLES.trash.subtitle}
      />
      {filesLoading ? (
        <ContentSkeleton grid />
      ) : (
        <Suspense fallback={<ContentSkeleton grid />}>
          <FilesList
            data={files}
            page={"trash"}
            imagePath={"/trash.svg"}
            text1={"Nothing in trash"}
            text2={`Move items you don't need to trash. They are permanently deleted after ${getTrashRetentionLabel()}.`}
          />
        </Suspense>
      )}
    </Page>
  );
};

export default Trash;
