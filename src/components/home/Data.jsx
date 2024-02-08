import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFilesForUser } from "../common/firebaseApi";
import RecentDataGrid from "./RecentDataGrid";
import MainData from "./MainData";
import PageHeader from "../common/PageHeader";

const Data = () => {
  const [files, setFiles] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, setFiles);

        // Cleanup the user subscription when the component unmounts
        return () => {
          unsubscribeFiles();
        };
      }
    });

    // Cleanup the user subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this file?"
      );

      if (confirmed) {
        // Reference to the document in Firestore
        const docRef = doc(db, "myfiles", id);

        // Delete the document
        await deleteDoc(docRef);
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

  const handleStarred = async (id) => {
    try {
      const docRef = doc(db, "myfiles", id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const currentStarredStatus = docSnapshot.data().starred || false;
        await updateDoc(docRef, { starred: !currentStarredStatus });
      } else {
        console.error("Document does not exist.");
      }
    } catch (error) {
      console.error("Error updating starred status: ", error);
    }
  };

  return (
    <DataContainer>
      <PageHeader pageTitle={"My Drive"} />
      <h4>Recents</h4>
      <div>
        <RecentDataGrid files={files} />
        <div>
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
