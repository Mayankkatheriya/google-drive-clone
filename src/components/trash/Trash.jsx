"use client";

import React, { Suspense, lazy } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useTrashFiles, useTrashFilesLoading } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
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
        <LoaderContainer grid />
      ) : (
        <Suspense fallback={<LoaderContainer grid />}>
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
