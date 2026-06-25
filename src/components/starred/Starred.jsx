"use client";

import React, { Suspense, lazy, useMemo } from "react";
import PageHeader from "../common/PageHeader";
import { Page } from "../common/PageShell";
import { useMyFiles } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
import { PAGE_SUBTITLES } from "@/lib/pageSubtitles";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Starred = () => {
  const files = useMyFiles();
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
      <Suspense fallback={<LoaderContainer />}>
        <FilesList
          data={starredFiles}
          page="starred"
          imagePath={"/starred.svg"}
          text1={"No starred files"}
          text2={"Add stars to things that you want to easily find later"}
        />
      </Suspense>
    </Page>
  );
};

export default Starred;
