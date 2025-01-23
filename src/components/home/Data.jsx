import styled from "styled-components";
import { useEffect, useState } from "react";

import { db, auth } from "../../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { getFilesForUser, postTrashCollection } from "../common/firebaseApi";
import RecentDataGrid from "./RecentDataGrid";
import MainData from "./MainData";
import PageHeader from "../common/PageHeader";
import { toast } from "react-toastify";

const Data = () => {
  const [files, setFiles] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, setFiles);

        return () => {
          unsubscribeFiles();
        };
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id, data) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this file?"
      );

      if (confirmed) {
        const docRef = doc(db, "myfiles", id);

        await postTrashCollection(data);

        await deleteDoc(docRef);
        toast.warn("File moved to the trash");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setOptionsVisible(id);
    }
  };

  const handleOptionsClick = (id) => {
    setOptionsVisible((prevVisible) => (prevVisible === id ? null : id));
  };

  return (
    <DataContainer>
      {/* Display page header */}
      <PageHeader pageTitle={"My Drive"} />
      {files.length > 0 && <h4>Recents</h4>}
      <div>
        {/* Display recent files in a grid */}
        <RecentDataGrid files={files} />
        <div>
          {/* Display main user data with options for each file */}
          <MainData
            files={files}
            handleOptionsClick={handleOptionsClick}
            optionsVisible={optionsVisible}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </DataContainer>
  );
};

const DataContainer = styled.div`
  flex: 1;
  padding: 10px 0px 0px 20px;

  h4 {
    font-size: 14px;
    margin-top: 30px;
    margin-bottom: -20px;

    @media screen and (max-width: 768px) {
      display: none;
    }
  }
`;

export default Data;
