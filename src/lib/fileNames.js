export function resolveDisplayFilename(customName, originalFilename) {
  const trimmed = customName.trim();
  if (!trimmed) return null;
  if (/[/\\]/.test(trimmed)) return null;

  const originalExt = originalFilename.includes(".")
    ? originalFilename.slice(originalFilename.lastIndexOf("."))
    : "";

  const hasExtension =
    trimmed.includes(".") && trimmed.lastIndexOf(".") > 0;

  return hasExtension ? trimmed : `${trimmed}${originalExt}`;
}
