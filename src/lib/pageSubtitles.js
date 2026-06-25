import { getUploadHelpText, getUploadHelpTextMobile } from "./uploadLimits";

export const PAGE_SUBTITLES = {
  myDrive: {
    subtitle: getUploadHelpText(),
    subtitleMobile: getUploadHelpTextMobile(),
  },
  recent: {
    subtitle: "Files you've opened or uploaded recently.",
  },
  starred: {
    subtitle: "Files you've starred — find them quickly anytime.",
  },
  trash: {
    subtitle:
      "Restore items to My Drive or delete them permanently. Trashed files still count toward storage.",
  },
};
