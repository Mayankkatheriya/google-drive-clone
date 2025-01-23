import React, { Suspense, lazy, useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Starred = () => {
  const [starredFiles, setStarredFiles] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, (newFiles) => {
          setFiles(newFiles);
        });

        return () => {
          unsubscribeFiles();
        };
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const starred = files.filter((file) => file.data.starred);
    setStarredFiles(starred);
  }, [files]);

  return (
    <StarredContainer>
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
    </StarredContainer>
  );
};

const StarredContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Starred;
