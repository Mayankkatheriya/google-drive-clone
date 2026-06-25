"use client";

import React, { Suspense, lazy } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { useMyFiles } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Recent = () => {
  const files = useMyFiles();

  return (
    <Page>
      <ContentCard>
        <PageHeader pageTitle={"Recents"} />
        <Suspense fallback={<LoaderContainer />}>
          <FilesList
            data={files?.slice(0, 9)}
            imagePath={"/recent.svg"}
            text1={"No recent files"}
            text2={"See all the files you've recently edited or added"}
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

export default Recent;
