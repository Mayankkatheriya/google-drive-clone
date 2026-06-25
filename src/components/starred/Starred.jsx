"use client";

import React, { Suspense, lazy, useMemo } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { useMyFiles } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Starred = () => {
  const files = useMyFiles();
  const starredFiles = useMemo(
    () => files.filter((file) => file.data.starred),
    [files]
  );

  return (
    <Page>
      <ContentCard>
        <PageHeader pageTitle={"Starred"} />
        <Suspense fallback={<LoaderContainer />}>
          <FilesList
            data={starredFiles}
            page="starred"
            imagePath={"/starred.svg"}
            text1={"No starred files"}
            text2={"Add stars to things that you want to easily find later"}
          />
        </Suspense>
      </ContentCard>
    </Page>
  );
};

const Page = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 16px 16px 16px 0;

  @media (max-width: 768px) {
    padding: 12px 8px 12px 0;
  }
`;

const ContentCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--border);
  min-height: 100%;
  overflow: hidden;
  box-shadow: var(--shadow-xs);
`;

export default Starred;
