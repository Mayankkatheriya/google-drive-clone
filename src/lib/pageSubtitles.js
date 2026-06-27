import { getUploadHelpText, getUploadHelpTextMobile } from "./uploadLimits";
import { getTrashRetentionLabel } from "./trashRetention";

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
    subtitle: `Restore items to My Drive or delete them permanently. Items in trash are auto-deleted after ${getTrashRetentionLabel()}.`,
  },
};
