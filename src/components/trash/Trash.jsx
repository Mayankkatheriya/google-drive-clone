import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PageHeader from "../common/PageHeader";
import FilesList from "../common/FilesList";
import { getTrashFiles } from "../common/firebaseApi";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Trash = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubscribeFiles = getTrashFiles(user.uid, setFiles);

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
      <PageHeader pageTitle={"Trash"} />
      <FilesList data={files} page={"trash"} />
    </RecentContainer>
  );
};

const RecentContainer = styled.div`
  flex: 1;
  padding: 10px 10px 0px 20px;
`;

export default Trash;
