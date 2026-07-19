"use client";

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
import ShareQrButton from "./ShareQrButton";

export default function ShareButtonsInner({
  url,
  filename,
  layout = "bar",
  fileData,
}) {
  if (!url) return null;

  return (
    <>
      <EmailShareButton url={url} subject={`${filename} file link`}>
        <EmailIcon size={28} round />
      </EmailShareButton>
      <FacebookShareButton url={url} hashtag={filename}>
        <FacebookIcon size={28} round />
      </FacebookShareButton>
      <LinkedinShareButton url={url} title={`${filename} file link`}>
        <LinkedinIcon size={28} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={url} title={`${filename} file link`}>
        <WhatsappIcon size={28} round />
      </WhatsappShareButton>
      <ShareQrButton
        url={url}
        filename={filename}
        fileData={fileData}
        size={28}
      />
    </>
  );
}
