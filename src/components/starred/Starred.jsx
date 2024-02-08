import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import FilesList from "../common/FilesList";

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
        // Cleanup the user subscription when the component unmounts
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
      <FilesList data= {starredFiles} page="starred"/>
    </StarredContainer>
  );
};

const StarredContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Starred;