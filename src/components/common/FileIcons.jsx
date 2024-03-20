// FileIcons.js

// import React from "react";
import {
  FileIcon,
  PdfIcon,
  PermMediaIcon,
  AudioIcon,
  VideoIcon,
} from "./SvgIcons";

/**
 * Component to display file icons based on file type
 * @param {string} type - File type
 * @returns {JSX.Element} - File icon component
 */
const FileIcons = ({ type }) => {
  return type.includes("pdf") ? (
    <PdfIcon />
  ) : type.includes("image") ? (
    <PermMediaIcon />
  ) : type.includes("video") ? (
    <VideoIcon />
  ) : type.includes("audio") ? (
    <AudioIcon />
  ) : (
    <FileIcon />
  );
};

export default FileIcons;
