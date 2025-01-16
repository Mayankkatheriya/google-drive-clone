// Sidebar.js

import React, { useState } from "react";
import styled from "styled-components";
import { db, storage, auth } from "../../firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectSidebarBool } from "../../store/BoolSlice";
import FileUploadModal from "./FileUploadModal";
import AddFile from "./AddFile";
import SidebarTabs from "./SidebarTabs";
import { toast } from "react-toastify";

/**
 * Sidebar component for managing file uploads and displaying tabs.
 * @returns {JSX.Element} - Sidebar component.
 */
const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const sidebarBool = useSelector(selectSidebarBool);
  const [selectedFile, setSelectedFile] = useState(null);
  /**
   * Handles the selection of a file for upload.
   * @param {Object} e - File input change event.
   */
  const handleFile = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  /**
   * Handles the file upload process.
   * Uploads the selected file to Firebase Storage and adds file details to Firestore.
   * Displays a success toast upon successful upload.
   * @param {Object} e - Form submit event.
   */
  const handleUpload = async (e) => {
    e.preventDefault();
    setSelectedFile("");
    setUploading(true);
    setProgress(0); // Reset progress

    try {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor the upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.error("Error uploading file:", error);
          setUploading(false);
          toast.error("Error uploading file. Please try again.");
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // Save file details to Firestore
          await addDoc(collection(db, "myfiles"), {
            userId: auth.currentUser.uid,
            timestamp: serverTimestamp(),
            filename: file.name,
            fileURL: url,
            size: uploadTask.snapshot.totalBytes,
            contentType: uploadTask.snapshot.metadata.contentType,
            starred: false,
          });

          toast.success("File Uploaded Successfully");
          setUploading(false);
          setFile(null);
          setOpen(false);
          setProgress(0); // Reset progress after completion
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      toast.error("Error uploading file. Please try again.");
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
        selectedFile={selectedFile}
        progress={progress}
      />

      <SidebarContainer sidebarbool={sidebarBool ? "true" : "false"}>
        <AddFile
          onClick={() => {
            setOpen(true);
          }}
        />

        <SidebarTabs />
      </SidebarContainer>
    </>
  );
};

const SidebarContainer = styled.div`
  width: 180px;
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
    width: 65px;
  }
`;

export default Sidebar;
