import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, onSnapshot, doc, deleteDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowDDownIcon,
  ListsIcon,
  InfoIcon,
  FileIcon,
  ArrowDownIcon,
} from "./SvgIcons";

const Data = () => {
  const [files, setFiles] = useState([]);
  const options = { timeZone: "Asia/Kolkata" };

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
              console.log(fileArr);
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

  const changeBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

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
    }
  };

  return (
    <DataContainer>
      {console.log(files)}
      <DataHeader>
        <div className="headerLeft">
          <p>My Drive</p>
          <ArrowDDownIcon />
        </div>
        <div className="headerRight">
          <ListsIcon />
          <InfoIcon />
        </div>
      </DataHeader>
      <div>
        <DataGrid>
          {files.map((file, idx) => {
            if (idx <= 3) {
              return (
                <DataFile
                  key={file.id}
                  href={file.data.fileURL}
                  target="_blank"
                >
                  <FileIcon />
                  <p>{file.data.filename}</p>
                </DataFile>
              );
            }
          })}
        </DataGrid>
        <div>
          <DataListRow>
            <p>
              <b>
                <ArrowDownIcon /> Name
              </b>
            </p>
            <p>
              <b>Last Modified</b>
            </p>
            <p>
              <b>File Size</b>
            </p>
            <p>
              <b>Options</b>
            </p>
          </DataListRow>

          {files.map((file) => (
            <DataListRow key={file.id}>
              <a href={file.data.fileURL} target="_blank">
                <p>
                  <FileIcon />
                  <span>{file.data.filename}</span>
                </p>
              </a>
              <p>{changeBytes(file.data.size)}</p>
              <p>
                {new Date(file.data.timestamp?.seconds * 1000).toLocaleString(
                  "en-US",
                  options
                )}
              </p>
              <p>
                <button onClick={() => handleDelete(file.id)}>Delete</button>
                <a
                  href={file.data.fileURL}
                  download={file.data.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </p>
            </DataListRow>
          ))}
        </div>
      </div>
    </DataContainer>
  );
};

const DataContainer = styled.div`
  padding: 10px 0px 0px 20px;
`;

const DataHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid lightgray;
  height: 40px;
  .headerLeft {
    display: flex;
    align-items: center;
  }
  .headerRight svg {
    margin: 0px 10px;
  }
`;

const DataGrid = styled.div`
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const DataFile = styled.a`
  text-align: center;
  border: 1px solid rgb(204 204 204 / 46%);
  margin: 10px;
  min-width: 200px;
  padding: 10px 0px 0px 0px;
  border-radius: 5px;
  text-decoration: none;
  p {
    color: #000;
    font-weight: 600;
  }
  svg {
    font-size: 60px;
    color: gray;
  }
  p {
    border-top: 1px solid #ccc;
    margin-top: 5px;
    font-size: 12px;
    background: whitesmoke;
    padding: 10px 0px;
  }
`;
const DataListRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr;
  border-bottom: 1px solid #ccc;
  padding: 10px;

  a {
    text-decoration: none;
    p {
      color: gray;
      span {
        color: #000;
        font-weight: 600;
      }
    }
  }
  p:last-child {
    justify-content: flex-end;
    padding-right: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;

    button {
      background-color: #fff;
      border: none;
      color: red;
    }

    a {
      color: #000;
    }
  }
  p,
  a,
  button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 13px;
    b {
      display: flex;
      align-items: center;
    }
    svg {
      font-size: 22px;
      margin: 10px;
    }
  }
`;

export default Data;
