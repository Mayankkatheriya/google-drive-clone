import React, { Suspense, lazy, useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getTrashFiles } from "../common/firebaseApi";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Trash = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubscribeFiles = getTrashFiles(user.uid, setFiles);

        return () => {
          unsubscribeFiles();
        };
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <RecentContainer>
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
    </RecentContainer>
  );
};

const RecentContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Trash;
