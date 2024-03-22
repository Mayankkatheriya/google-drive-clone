import React, { Suspense, lazy, useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

// Recent component displays recently edited or added files
const Recent = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch recent files for the current user
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Subscribe to file updates and set them in state
        const unsubscribeFiles = await getFilesForUser(user.uid, (newFiles) => {
          setFiles(newFiles);
        });
        // Cleanup the user subscription when the component unmounts
        return () => {
          unsubscribeFiles();
        };
      }
    };

    // Fetch data when the component mounts
    fetchData();
  }, []);

  return (
    <RecentContainer>
      {/* Page header for the "Recents" section */}
      <PageHeader pageTitle={"Recents"} />
      {/* Display the list of recent files using FilesList component */}
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

// Styled component for the Recent container
const RecentContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Recent;
