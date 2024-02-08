import React, { useState } from "react";
import styled from "styled-components";
import { db, storage, auth } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { selectSidebarBool, setSidebarBool } from "../../store/BoolSlice";
import FileUploadModal from "./FileUploadModal";
import AddFile from "./AddFile";
import SidebarTabs from "./SidebarTabs";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const sidebarBool = useSelector(selectSidebarBool);
  const dispatch = useDispatch();

  const handleFile = (e) => {
    console.log(e.target.files);
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const storageRef = ref(storage, `files/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      console.log(snapshot);

      // Check if snapshot.totalBytes is defined, use 0 if not
      const size = snapshot.metadata.size || 0;

      // Associate the file with the authenticated user ID
      await addDoc(collection(db, "myfiles"), {
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        filename: file.name,
        fileURL: url,
        size: size,
        contentType: snapshot.metadata.contentType,
      });

      // Reset state and close modal
      setUploading(false);
      setFile(null);
      setOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };

  return (
    <>
      <FileUploadModal
        open={open}
        setOpen={setOpen}
        handleUpload={handleUpload}
        uploading={uploading}
        handleFile={handleFile}
      />

      <SidebarContainer sidebarbool={sidebarBool ? "true" : "false"}>
        <AddFile
          onClick={() => {
            setOpen(true);
            dispatch(setSidebarBool(false));
          }}
        />

        <SidebarTabs />
      </SidebarContainer>
    </>
  );
};

const SidebarContainer = styled.div`
  padding-top: 10px;
  border-right: 1px solid lightgray;
  transition: all 0.1s linear;
  position: ${(props) =>
    props.sidebarbool === "true" ? `relative` : "absolute"};
  left: ${(props) => (props.sidebarbool === "true" ? `0` : "-100%")};

  @media screen and (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export default Sidebar;