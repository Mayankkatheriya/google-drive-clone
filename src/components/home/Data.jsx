// Import styled components and React dependencies
import styled from "styled-components";
import { useEffect, useState } from "react";

// Import Firebase utilities
import { db, auth } from "../../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Import custom Firebase API functions and components
import { getFilesForUser, postTrashCollection } from "../common/firebaseApi";
import RecentDataGrid from "./RecentDataGrid";
import MainData from "./MainData";
import PageHeader from "../common/PageHeader";
import { toast } from "react-toastify";

// Main component for displaying user's data
const Data = () => {
  // State variables to manage user files and options visibility
  const [files, setFiles] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(null);

  // Fetch user files on component mount and clean up subscriptions on unmount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Subscribe to user's files and update state
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

  // Handle file deletion by moving it to the trash collection
  const handleDelete = async (id, data) => {
    try {
      // Confirm deletion with a window prompt
      const confirmed = window.confirm(
        "Are you sure you want to delete this file?"
      );

      if (confirmed) {
        // Reference to the document in Firestore
        const docRef = doc(db, "myfiles", id);

        // Add the file data to the "trash" collection before deleting the document
        await postTrashCollection(data);

        // Delete the document from the user's drive
        await deleteDoc(docRef);
        toast.warn("File moved to the trash");
      }
    } catch (error) {
      // Log any errors that occur during the deletion process
      console.error("Error deleting document: ", error);
    } finally {
      // Set options visibility after deletion attempt
      setOptionsVisible(id);
    }
  };

  // Handle click event for options button
  const handleOptionsClick = (id) => {
    // Toggle options visibility based on the previous state
    setOptionsVisible((prevVisible) => (prevVisible === id ? null : id));
  };

  // JSX structure for rendering the component
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

// Styled component for the main container
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

// Export the Data component as the default export
export default Data;
