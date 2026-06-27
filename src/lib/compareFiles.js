export function getCompareKind(contentType = "") {
  const ct = contentType.toLowerCase();
  if (ct.includes("pdf")) return "pdf";
  if (ct.includes("image")) return "image";
  return null;
}

export function canCompareFile(contentType = "") {
  return getCompareKind(contentType) !== null;
}

export function canComparePair(aContentType = "", bContentType = "") {
  const kindA = getCompareKind(aContentType);
  const kindB = getCompareKind(bContentType);
  return kindA !== null && kindA === kindB;
}
