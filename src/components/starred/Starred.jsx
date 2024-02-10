import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import FilesList from "../common/FilesList";

// Starred component displays files marked as starred for quick access
const Starred = () => {
  const [starredFiles, setStarredFiles] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch files for the current user
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

  useEffect(() => {
    // Filter and set files that are marked as starred
    const starred = files.filter((file) => file.data.starred);
    setStarredFiles(starred);
  }, [files]);

  return (
    <StarredContainer>
      {/* Page header for the "Starred" section */}
      <PageHeader pageTitle={"Starred"} />
      {/* Display the list of starred files using FilesList component */}
      <FilesList
        data={starredFiles}
        page="starred"
        imagePath={"/starred.svg"}
        text1={"No starred files"}
        text2={"Add stars to things that you want to easily find later"}
      />
    </StarredContainer>
  );
};

// Styled component for the Starred container
const StarredContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Starred;
