// FilesList.js

import React from "react";
import styled from "styled-components";
import FileIcons from "./FileIcons";
import { changeBytes, convertDates } from "./common";
import { handleDeleteFromTrash, handleStarred } from "./firebaseApi";
import { DeleteIcon, StarBorderIcon, StarFilledIcon } from "./SvgIcons";
import LottieImage from "./LottieImage";
import { motion } from "framer-motion";

/**
 * Component to display a list of files with options based on the page
 * @param {Object[]} data - Array of file data
 * @param {string} page - Page identifier ('starred', 'trash', or null)
 * @param {string} imagePath - Image path for Lottie animation
 * @param {string} text1 - First line of text for Lottie animation
 * @param {string} text2 - Second line of text for Lottie animation
 * @returns {JSX.Element} - Files list component
 */
const FilesList = ({ data, page = null, imagePath, text1, text2 }) => {
  return (
    <FileList>
      {data.length > 0 ? (
        data.map((file) => {
          return (
            <DataFile
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "0", opacity: 1 }}
              transition={{ duration: 0.5 }}
              key={file.id}
            >
              <a href={file.data.fileURL} target="_blank">
                <FileIcons type={file.data.contentType} />
                <DataDetails>
                  <p title={file.data.filename}>{file.data.filename}</p>
                  <span className="uploaded">
                    {"Uploaded on: "}
                    {convertDates(file.data.timestamp?.seconds)}
                  </span>
                  <span className="fileSize">
                    {"Size: "}
                    {changeBytes(file.data.size)}
                  </span>
                </DataDetails>
              </a>
              {page === "starred" && (
                <StarContainer onClick={() => handleStarred(file.id)}>
                  {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
                </StarContainer>
              )}
              {page === "trash" && (
                <DeleteContainer onClick={() => handleDeleteFromTrash(file.id)}>
                  <DeleteIcon />
                  {" Delete Permanently"}
                </DeleteContainer>
              )}
            </DataFile>
          );
        })
      ) : (
        <LottieImage imagePath={imagePath} text1={text1} text2={text2} />
      )}
    </FileList>
  );
};

const FileList = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  margin: 2rem 0;
`;

const DataFile = styled(motion.div)`
  color: #383838;
  width: 100%;
  max-width: 300px;
  border: 2px solid lightgray;
  padding: 10px 0px 0px 0px;
  position: relative;
  z-index: 5;
  border-radius: 10px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: 3px 3px 5px 3px #8a8a8a;
  }

  a {
    color: #383838;
  }

  svg {
    font-size: 70px;
    color: gray;
    margin-bottom: 1rem;
    width: 100%;
  }
`;

const DataDetails = styled.div`
  width: 100%;
  border-top: 1px solid #ccc;
  margin-top: 5px;
  background: whitesmoke;
  padding: 10px 0px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  text-align: center;

  p {
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    width: 100%;
  }
  span {
    font-size: 14px;
  }
`;

const StarContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  svg {
    font-size: 30px;
    font-weight: 500;
    z-index: 10;
    color: #ffd400;
  }
`;

const DeleteContainer = styled.div`
  width: 100%;
  padding-bottom: 10px;
  background: whitesmoke;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  svg {
    width: max-content;
    font-size: 20px;
    margin: 0;
  }

  &:hover {
    color: red;

    svg {
      color: red;
    }
  }
`;

export default FilesList;
