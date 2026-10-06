export function getMoveToTrashConfirmOptions(filename, customMessage) {
  return {
    title: "Move to trash?",
    message:
      customMessage ||
      (filename
        ? `"${filename}" will move to trash. You can restore it within 15 days.`
        : "This file will move to trash. You can restore it within 15 days."),
    confirmLabel: "Move to trash",
    cancelLabel: "Cancel",
    tone: "warning",
  };
}

export function getPermanentDeleteConfirmOptions(filename) {
  return {
    title: "Delete forever?",
    message: filename
      ? `"${filename}" will be permanently deleted. This can't be undone.`
      : "This file will be permanently deleted. This can't be undone.",
    confirmLabel: "Delete forever",
    cancelLabel: "Cancel",
    tone: "danger",
  };
}
