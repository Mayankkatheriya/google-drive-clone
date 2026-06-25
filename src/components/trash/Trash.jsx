"use client";

import React, { Suspense, lazy } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useTrashFiles } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Trash = () => {
  const files = useTrashFiles();

  return (
    <Page>
      <PageHeader pageTitle={"Trash"} />
      <Suspense fallback={<LoaderContainer />}>
        <FilesList
          data={files}
          page={"trash"}
          imagePath={"/trash.svg"}
          text1={"Nothing in trash"}
          text2={
            "Move items you don't need to trash. Items in trash will be deleted forever after you delete them from here"
          }
        />
      </Suspense>
    </Page>
  );
};

export default Trash;
