export const FOCUS_FILTERS = [
  { id: "all", label: "All files" },
  { id: "pdf", label: "PDFs" },
  { id: "image", label: "Images" },
  { id: "starred", label: "Starred" },
];

export function filterFilesForFocus(files, filter = "all") {
  if (!Array.isArray(files)) return [];

  switch (filter) {
    case "starred":
      return files.filter((file) => file.data?.starred);
    case "pdf":
      return files.filter((file) =>
        file.data?.contentType?.toLowerCase().includes("pdf"),
      );
    case "image":
      return files.filter((file) =>
        file.data?.contentType?.toLowerCase().includes("image"),
      );
    default:
      return files;
  }
}

export function getFocusFilterLabel(filter = "all") {
  return FOCUS_FILTERS.find((item) => item.id === filter)?.label ?? "All files";
}

export function getFocusEmptyState(filter = "all") {
  switch (filter) {
    case "starred":
      return {
        text1: "No starred files",
        text2: "Star files in normal mode to see them here.",
      };
    case "pdf":
      return {
        text1: "No PDFs found",
        text2: "Upload PDFs to browse them distraction-free.",
      };
    case "image":
      return {
        text1: "No images found",
        text2: "Upload images to browse them distraction-free.",
      };
    default:
      return {
        text1: "Nothing to focus on yet",
        text2: "Upload files to get started.",
      };
  }
}
