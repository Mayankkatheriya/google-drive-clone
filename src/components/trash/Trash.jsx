"use client";

import React, { Suspense, lazy } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { useTrashFiles } from "@/context/FilesContext";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Trash = () => {
  const files = useTrashFiles();

  return (
    <Page>
      <ContentCard>
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

export default Trash;
