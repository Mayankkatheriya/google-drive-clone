export function isFolder(item) {
  const data = item?.data ?? item;
  return data?.type === "folder";
}

/** Missing parentId = root (legacy docs). */
export function getParentId(item) {
  const data = item?.data ?? item;
  const parentId = data?.parentId;
  return parentId == null || parentId === "" ? null : parentId;
}

function matchesParent(item, folderId) {
  const parentId = getParentId(item);
  const current = folderId == null || folderId === "" ? null : folderId;
  return parentId === current;
}

export function filterByFolder(files, folderId) {
  return files.filter((file) => matchesParent(file, folderId));
}

/** Folders first, then newest files. */
export function sortDriveItems(files) {
  return [...files].sort((a, b) => {
    const aFolder = isFolder(a) ? 0 : 1;
    const bFolder = isFolder(b) ? 0 : 1;
    if (aFolder !== bFolder) return aFolder - bFolder;
    const aSec = a.data?.timestamp?.seconds ?? 0;
    const bSec = b.data?.timestamp?.seconds ?? 0;
    return bSec - aSec;
  });
}

function buildFolderMap(files) {
  const map = new Map();
  for (const file of files) {
    if (isFolder(file)) {
      map.set(file.id, file);
    }
  }
  return map;
}

export function getBreadcrumbPath(files, folderId) {
  if (!folderId) return [];

  const map = buildFolderMap(files);
  const path = [];
  let currentId = folderId;
  const seen = new Set();

  while (currentId && map.has(currentId) && !seen.has(currentId)) {
    seen.add(currentId);
    const folder = map.get(currentId);
    path.unshift({ id: folder.id, name: folder.data.filename || "Untitled" });
    currentId = getParentId(folder);
  }

  return path;
}

export function getDescendantIds(files, folderId) {
  const children = files.filter((f) => getParentId(f) === folderId);
  const ids = [];

  for (const child of children) {
    ids.push(child.id);
    if (isFolder(child)) {
      ids.push(...getDescendantIds(files, child.id));
    }
  }

  return ids;
}

/** Total size of all files nested under a folder (recursive). */
export function getFolderSizeBytes(files, folderId) {
  if (!folderId || !Array.isArray(files)) return 0;

  let total = 0;
  for (const file of files) {
    if (getParentId(file) !== folderId) continue;
    if (isFolder(file)) {
      total += getFolderSizeBytes(files, file.id);
    } else {
      total += Number(file.data?.size) || 0;
    }
  }
  return total;
}

/** True if `candidateId` is `folderId` or nested under it. */
function isSelfOrDescendant(files, folderId, candidateId) {
  if (!folderId || !candidateId) return folderId === candidateId;
  if (folderId === candidateId) return true;
  return getDescendantIds(files, folderId).includes(candidateId);
}

export function canMoveToFolder(files, itemIds, targetFolderId) {
  const target = targetFolderId == null ? null : targetFolderId;

  if (target) {
    const targetFolder = files.find((f) => f.id === target);
    if (!targetFolder || !isFolder(targetFolder)) {
      return { ok: false, reason: "Target folder not found" };
    }
  }

  for (const id of itemIds) {
    if (target === id) {
      return { ok: false, reason: "Cannot move a folder into itself" };
    }
    const item = files.find((f) => f.id === id);
    if (!item) continue;
    if (getParentId(item) === target) {
      return { ok: false, reason: "Already in this folder" };
    }
    if (isFolder(item) && target && isSelfOrDescendant(files, id, target)) {
      return { ok: false, reason: "Cannot move a folder into its subfolder" };
    }
  }

  return { ok: true };
}

export function buildFolderTree(files, { excludeIds = [] } = {}) {
  const excluded = new Set(excludeIds);
  for (const id of excludeIds) {
    getDescendantIds(files, id).forEach((d) => excluded.add(d));
  }

  const folders = files.filter((f) => isFolder(f) && !excluded.has(f.id));

  function childrenOf(parentId) {
    return folders
      .filter((f) => getParentId(f) === parentId)
      .sort((a, b) =>
        (a.data.filename || "").localeCompare(b.data.filename || "", undefined, {
          sensitivity: "base",
        }),
      )
      .map((folder) => ({
        id: folder.id,
        name: folder.data.filename || "Untitled",
        children: childrenOf(folder.id),
      }));
  }

  return childrenOf(null);
}

export function resolveFolderName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  if (/[/\\]/.test(trimmed)) return null;
  return trimmed.slice(0, 120);
}
