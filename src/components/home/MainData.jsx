import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ArrowDownIcon, MoreOptionsIcon, StarFilledIcon, StarBorderIcon, } from "../common/SvgIcons";
import { changeBytes } from "../common/common";
import { convertDates } from "../common/convertDates";
import FileIcons from "../common/FileIcons";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share";
import { handleStarred } from "../common/firebaseApi";

const MainData = ({
  files,
  handleOptionsClick,
  optionsVisible,
  handleDelete,
}) => {
  const [showShareIcons, setShowShareIcons] = useState(false);
  const optionsMenuRef = useRef(null);

  const handleShareClick = () => {
    setShowShareIcons(!showShareIcons);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target)
      ) {
        setShowShareIcons(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div>
      <DataListRow>
        <div>
          <b>
            <ArrowDownIcon /> Name
          </b>
        </div>
        <div className="fileSize">
          <b>File Size</b>
        </div>
        <div className="modified">
          <b>Last Modified</b>
        </div>
        <div>
          <b>Options</b>
        </div>
      </DataListRow>

      {files.map((file) => (
        <DataListRow key={file.id}>
          <div>
            <p onClick={() => handleStarred(file.id)}>
            {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
            </p>
            <a href={file.data.fileURL} target="_blank">
              <FileIcons type={file.data.contentType} />
              <span title={file.data.filename}>{file.data.filename}</span>
            </a>
          </div>
          <div className="fileSize">{changeBytes(file.data.size)}</div>
          <div className="modified">
            {convertDates(file.data.timestamp?.seconds)}
          </div>
          <div>
            <OptionsContainer
              title="Options"
              onClick={() => handleOptionsClick(file.id)}
            >
              <MoreOptionsIcon />
            </OptionsContainer>
            {optionsVisible === file.id && (
              <OptionsMenu ref={optionsMenuRef}>
                <span>
                  <a
                    href={file.data.fileURL}
                    download={file.data.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </span>
                <span
                  onClick={() =>
                    navigator.clipboard.writeText(file.data.fileURL)
                  }
                >
                  Copy Link
                </span>
                <ShareButton onClick={handleShareClick}>
                  Share
                  <span className={showShareIcons ? "show" : ""}>
                    <EmailShareButton
                      url={file.data.fileURL}
                      subject={`This is ${file.data.filename} file link`}
                    >
                      <EmailIcon size={30} round={true} />
                    </EmailShareButton>

                    <FacebookShareButton
                      url={file.data.fileURL}
                      hashtag={file.data.filename}
                    >
                      <FacebookIcon size={30} round={true} />
                    </FacebookShareButton>

                    <LinkedinShareButton
                      url={file.data.fileURL}
                      title={`This is ${file.data.filename} file link`}
                    >
                      <LinkedinIcon size={30} round={true} />
                    </LinkedinShareButton>

                    <WhatsappShareButton
                      url={file.data.fileURL}
                      title={`This is ${file.data.filename} file link`}
                    >
                      <WhatsappIcon size={30} round={true} />
                    </WhatsappShareButton>
                  </span>
                </ShareButton>
                <span onClick={() => handleDelete(file.id)}>
                  <button>Delete</button>
                </span>
                <span className="uploaded">
                  {convertDates(file.data.timestamp?.seconds)}
                </span>
                <span className="fileSize">
                  {"Size: "}
                  {changeBytes(file.data.size)}
                </span>
              </OptionsMenu>
            )}
          </div>
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

  div:last-child {
    justify-self: flex-end;
    padding-right: 10px;
    font-size: 13px;
    position: relative;
  }

  div,
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

  div {
    text-decoration: none;

    a {
      color: gray;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      span {
        color: #000;
        font-weight: 600;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-wrap: break-word;
        width: 20ch;

        @media screen and (max-width: 768px) {
          width: 10ch;
        }
      }
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

const OptionsContainer = styled.span`
  cursor: pointer;
`;

const OptionsMenu = styled.span`
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
  width: max-content;
  min-width: 120px;
  border-radius: 10px;

  &::before {
    content: "";
    position: absolute;
    width: 15px;
    height: 15px;
    background-color: #fff;
    top: -8px;
    right: 5px;
    transform: rotate(45deg);
    border-left: 1px solid #ccc;
    border-top: 1px solid #ccc;
  }

  span {
    width: 100%;
    border-bottom: 2px solid #ccc;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;

    a {
      color: #000;
    }

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #ccc;
      z-index: 11;
    }
  }

  button {
    background-color: transparent;
    border: none;
    color: red;
  }

  a {
    color: #000;
    background-color: transparent;
  }

  .fileSize,
  .uploaded {
    background-color: #f0f0f0;
    cursor: default;
  }
`;

const ShareButton = styled.span`
  position: relative;
  cursor: pointer;

  span {
    width: max-content;
    height: max-content;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0;
    position: absolute;
    top: -80px;
    left: -60px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-in-out;
  }

  .show {
    opacity: 1;
    visibility: visible;
  }

  &:hover {
    span {
      background-color: transparent;
    }
  }
`;

export default MainData;