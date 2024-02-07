import React from "react";
import {
  FileIcon,
  PdfIcon,
  PermMediaIcon,
  AudioIcon,
  VideoIcon,
} from "./SvgIcons";

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
