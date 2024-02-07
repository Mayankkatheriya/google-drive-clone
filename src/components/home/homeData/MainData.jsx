import React from "react";
import styled from "styled-components";
import { ArrowDownIcon, MoreOptionsIcon } from "../../common/SvgIcons";
import { changeBytes } from "../../common/common";
import { convertDates } from "../../common/convertDates";
import FileIcons from "../../common/FileIcons";

const MainData = ({files, handleOptionsClick, optionsVisible, handleDelete}) => {
  return (
    <div>
      <DataListRow>
        <p>
          <b>
            <ArrowDownIcon /> Name
          </b>
        </p>
        <p className="fileSize">
          <b>File Size</b>
        </p>
        <p className="modified">
          <b>Last Modified</b>
        </p>
        <p>
          <b>Options</b>
        </p>
      </DataListRow>

      {files.map((file) => (
        <DataListRow key={file.id}>
          <a href={file.data.fileURL} target="_blank">
            <p>
              <FileIcons type = {file.data.contentType} />
              <span title={file.data.filename}>{file.data.filename}</span>
            </p>
          </a>
          <p className="fileSize">{changeBytes(file.data.size)}</p>
          <p className="modified">
            {convertDates(file.data.timestamp?.seconds)}
          </p>
          <p>
            <div
              title="Options"
              onClick={() => handleOptionsClick(file.id)}
            >
              <MoreOptionsIcon />
            </div>
            {optionsVisible === file.id && (
              <div className="options">
                <p>
                  <a
                    href={file.data.fileURL}
                    download={file.data.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </p>
                <p>
                  <button onClick={() => handleDelete(file.id)}>Delete</button>
                </p>
              </div>
            )}
          </p>
        </DataListRow>
      ))}
    </div>
  );
};

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
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;

        @media screen and (max-width: 768px) {
          width: 10ch;
        }
      }
    }
  }
  p:last-child {
    justify-self: flex-end;
    padding-right: 10px;
    font-size: 13px;
    position: relative;

    .options {
      display: flex;
      align-items: center;
      flex-direction: column;
      position: absolute;
      background-color: #fff;
      border: 2px solid #ccc;
      top: 70%;
      right: 40%;
      cursor: pointer;
      z-index: 10;

      &::before {
        content: "";
        position: absolute;
        width: 15px;
        height: 15px;
        background-color: #fff;
        top: -8px;
        right: 5px;
        transform: rotate(45deg);
        /* border: 1px solid #ccc; */
        border-left: 1px solid #ccc;
        border-top: 1px solid #ccc;
      }

      p {
        width: 100%;
        border-bottom: 2px solid #ccc;
        padding: 10px;

        &:last-child {
          border-bottom: none;
        }
      }

      button {
        background-color: #fff;
        border: none;
        color: red;
      }

      a {
        width: 100%;
        /* background-color: #fff; */
        color: #000;
      }
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

  @media screen and (max-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
    .modified {
      display: none;
    }
  }

  @media screen and (max-width: 319px) {
    grid-template-columns: 2fr 1fr;
    .fileSize {
      display: none;
    }
  }
`;

export default MainData;
