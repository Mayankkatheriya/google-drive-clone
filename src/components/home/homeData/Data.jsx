import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import HomeDataHeader from "./HomeDataHeader";
import RecentDataGrid from "./RecentDataGrid";
import MainData from "./MainData";

const Data = () => {
  const [files, setFiles] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const filesData = collection(db, "myfiles");
        const unsubscribeFiles = onSnapshot(
          query(filesData, where("userId", "==", user.uid)),
          (snapshot) => {
            setFiles(() => {
              const fileArr = snapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  data: doc.data(),
                }))
                .sort(
                  (a, b) =>
                    b.data.timestamp?.seconds - a.data.timestamp?.seconds
                );
              return fileArr;
            });
          }
        );

        // Cleanup the files subscription when the component unmounts
        return () => unsubscribeFiles();
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

  return (
    <DataContainer>
      <HomeDataHeader />
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
