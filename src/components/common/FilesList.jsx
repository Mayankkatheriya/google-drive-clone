import React from "react";
import styled from "styled-components";
import FileIcons from "./FileIcons";
import { convertDates } from "./convertDates";
import { changeBytes } from "./common";
import { handleDeleteFromTrash, handleStarred } from "./firebaseApi";
import { DeleteIcon, StarBorderIcon, StarFilledIcon } from "./SvgIcons";

const FilesList = ({ data, page = null }) => {
  return (
    <FileList>
      {data.length > 0 ? (
        data.map((file) => {
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
                  <DeleteIcon />
                  {" Delete Permanenly"}
                </DeleteContainer>
              )}
            </DataFile>
          );
        })
      ) : (
        <h3 style={{ textAlign: "center", marginTop: "1rem" }}>
          No files to shown
        </h3>
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

const DataFile = styled.div`
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
`;

export default FilesList;
