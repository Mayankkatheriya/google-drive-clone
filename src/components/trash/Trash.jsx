import React, { Suspense, lazy, useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getTrashFiles } from "../common/firebaseApi";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoaderContainer from "../loaders/LoaderContainer";
import { delayInRender } from "../common/common";
const FilesList = lazy(() => delayInRender(import("../common/FilesList")));

// Trash component displays files in the user's trash
const Trash = () => {
  const [files, setFiles] = useState([]); // State to store files in the trash

  useEffect(() => {
    // Subscribe to authentication changes and fetch trash files for the user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Subscribe to trash file updates and set them in state
        const unsubscribeFiles = getTrashFiles(user.uid, setFiles);

        // Cleanup the user subscription when the component unmounts
        return () => {
          unsubscribeFiles();
        };
      }
    });

    // Cleanup the user authentication subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <RecentContainer>
      {/* Page header for the "Trash" section */}
      <PageHeader pageTitle={"Trash"} />
      {/* Display the list of files in the trash using FilesList component */}
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

// Styled component for the Trash container
const RecentContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Trash;
