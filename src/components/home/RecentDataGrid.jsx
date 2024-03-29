import React from "react";
import styled from "styled-components";
import FileIcons from "../common/FileIcons";

// RecentDataGrid component displays a grid of recent files
const RecentDataGrid = ({ files }) => {
  return (
    <DataGrid>
      {/* Map through the first 4 files in the 'files' array */}
      {files.slice(0, 4).map((file) => (
        // Display each file as a clickable link with file icon and filename
        <DataFile key={file.id} href={file.data.fileURL} target="_blank">
          {/* Display file icon based on file type */}
          <FileIcons type={file.data.contentType} />
          {/* Display filename with ellipsis for overflow */}
          <p title={file.data.filename}>{file.data.filename}</p>
        </DataFile>
      ))}
    </DataGrid>
  );
};

// Styled component for the main data grid container
const DataGrid = styled.div`
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;

  @media screen and (max-width: 768px) {
    display: none; // Hide the grid on small screens
  }

  p {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// Styled component for each file in the grid
const DataFile = styled.a`
  text-align: center;
  border: 1px solid rgb(204 204 204 / 46%);
  margin: 10px;
  min-width: 200px;
  padding: 10px 0px 0px 0px;
  border-radius: 5px;
  text-decoration: none;
  max-width: 250px;
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
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    width: 100%;
  }
`;

// Export the RecentDataGrid component as the default export
export default RecentDataGrid;
