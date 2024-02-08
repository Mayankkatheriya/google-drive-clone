import React from "react";
import styled from "styled-components";
import FileIcons from "./FileIcons";
import { convertDates } from "./convertDates";
import { changeBytes } from "./common";
import { handleDeleteFromTrash, handleStarred } from "./firebaseApi";
import { StarBorderIcon, StarFilledIcon } from "./SvgIcons";

const FilesList = ({ data, page = null }) => {
  return (
    <FileList>
      {data.map((file) => {
        return (
          <DataFile key={file.id}>
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
                Delete Permanenly
              </DeleteContainer>
            )}
          </DataFile>
        );
      })}
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

const DataFile = styled.div`
  color: #383838;
  width: 100%;
  max-width: 320px;
  border: 2px solid lightgray;
  padding: 10px 0px 0px 0px;
  position: relative;
  z-index: 5;
  border-radius: 10px;

  a {
    color: #383838;
  }

  svg {
    font-size: 120px;
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
  }
`;

const DeleteContainer = styled.div`
  width: 100%;
  padding-bottom: 10px;
  background: whitesmoke;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
`

export default FilesList;
