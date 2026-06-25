"use client";

import React, { Suspense, lazy } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useMyFiles } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Recent = () => {
  const files = useMyFiles();

  return (
    <Page>
      <PageHeader pageTitle={"Recents"} />
      <Suspense fallback={<LoaderContainer />}>
        <FilesList
          data={files?.slice(0, 9)}
          imagePath={"/recent.svg"}
          text1={"No recent files"}
          text2={"See all the files you've recently edited or added"}
        />
      </Suspense>
    </Page>
  );
};

export default Recent;
