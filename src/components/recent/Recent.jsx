import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import { getFilesForUser } from "../common/firebaseApi";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import FilesList from "../common/FilesList";

const Recent = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubscribeFiles = getFilesForUser(user.uid, setFiles);

        // Cleanup the user subscription when the component unmounts
        return () => {
          unsubscribeFiles();
        };
      }
    });

    // Cleanup the user subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <RecentContainer>
      <PageHeader pageTitle={"Recents"} />
      <FilesList data = {files?.slice(0, 9)} />
    </RecentContainer>
  );
};

const RecentContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Recent;
