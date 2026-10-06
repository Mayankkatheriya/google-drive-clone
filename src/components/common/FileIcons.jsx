
import React from "react";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import {
  FileIcon,
  PdfIcon,
  PermMediaIcon,
  AudioIcon,
  VideoIcon,
} from "./SvgIcons";

const FileIcons = ({ type, itemType }) => {
  if (itemType === "folder" || type === "folder") {
    return <FolderOutlinedIcon />;
  }

  const ct = type || "";
  return ct.includes("pdf") ? (
    <PdfIcon />
  ) : ct.includes("image") ? (
    <PermMediaIcon />
  ) : ct.includes("video") ? (
    <VideoIcon />
  ) : ct.includes("audio") ? (
    <AudioIcon />
  ) : (
    <FileIcon />
  );
};

export default FileIcons;
