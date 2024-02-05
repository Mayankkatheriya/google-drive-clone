import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ListIcon from "@mui/icons-material/List";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const Data = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const filesData = collection(db, "myfiles");
    const unsubscribe = onSnapshot(filesData, (snapshot) => {
      setFiles(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
    });

    // Cleanup the subscription when the component unmounts
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

  return (
    <DataContainer>
      {console.log(files)}
      <DataHeader>
        <div className="headerLeft">
          <p>My Drive</p>
          <ArrowDropDownIcon />
        </div>
        <div className="headerRight">
          <ListIcon />
          <InfoOutlinedIcon />
        </div>
      </DataHeader>
      <div>
        <DataGrid>
          {files.map((file) => (
            <DataFile key={file.id} href={file.data.fileURL} target="_blank">
              <InsertDriveFileIcon />
              <p>{file.data.filename}</p>
            </DataFile>
          ))}
        </DataGrid>
        <div>
          <DataListRow>
            <p>
              <b>
                <ArrowDownwardIcon /> Name
              </b>
            </p>
            <p>
              <b>Owner</b>
            </p>
            <p>
              <b>Last Modified</b>
            </p>
            <p>
              <b>File Size</b>
            </p>
          </DataListRow>
          {files.map((file) => (
            <DataListRow key={file.id}>
              <a href={file.data.fileURL} target="_blank">
                <p>
                  <InsertDriveFileIcon />
                  <span>{file.data.filename}</span>
                </p>
              </a>
              <p>Owner </p>
              <p>
                {new Date(file.data.timestamp?.seconds * 1000).toUTCString()}
              </p>
              <p>{changeBytes(file.data.size)}</p>
            </DataListRow>
          ))}
        </div>
      </div>
    </DataContainer>
  );
};

const DataContainer = styled.div`
  flex: 1 1;
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
  }
  p,
  a {
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
