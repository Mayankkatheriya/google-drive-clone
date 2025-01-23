import React, { Suspense, lazy, useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

const Recent = () => {
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

  return (
    <RecentContainer>
      <PageHeader pageTitle={"Recents"} />
      <Suspense fallback={<LoaderContainer />}>
        <FilesList
          data={files?.slice(0, 9)}
          imagePath={"/recent.svg"}
          text1={"No recent files"}
          text2={"See all the files you’ve recently edited or added"}
        />
      </Suspense>
    </RecentContainer>
  );
};

const RecentContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Recent;
