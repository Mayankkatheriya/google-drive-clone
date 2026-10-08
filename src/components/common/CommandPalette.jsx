"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { usePathname, useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import FileUploadIcon from "@mui/icons-material/FileUploadOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import MicIcon from "@mui/icons-material/MicNoneOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import ExploreIcon from "@mui/icons-material/ExploreOutlined";
import CenterFocusStrongRoundedIcon from "@mui/icons-material/CenterFocusStrongRounded";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import CornerDownLeftIcon from "@mui/icons-material/KeyboardReturnOutlined";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
} from "./SvgIcons";
import FileIcons from "./FileIcons";
import CreateFolderModal from "./CreateFolderModal";
import { getFileTypeTokens } from "@/lib/fileTypeColors";
import { searchFiles } from "@/lib/searchFiles";
import { isFolder } from "@/lib/folders";
import { markFileOpened } from "./firebaseApi";
import { useMyFiles } from "@/context/FilesContext";
import { useFilePreview } from "@/context/FilePreviewContext";
import { useTheme } from "@/context/ThemeContext";
import { useFileUploadContext } from "@/context/FileUploadContext";
import { useFocus } from "@/context/FocusContext";
import { useSelection } from "@/context/SelectionContext";
import { useCompare } from "@/context/CompareContext";
import { useTour } from "@/context/TourProvider";

const MAX_FILE_RESULTS = 6;

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const files = useMyFiles();
  const { open: openPreview } = useFilePreview();
  const { isDark, toggleTheme } = useTheme();
  const upload = useFileUploadContext();
  const {
    active: focusActive,
    toggleMode: toggleFocus,
    exitMode: exitFocus,
  } = useFocus();
  const {
    active: selectActive,
    toggleMode: toggleSelect,
    exitMode: exitSelect,
  } = useSelection();
  const {
    active: compareActive,
    toggleMode: toggleCompare,
    exitMode: exitCompare,
  } = useCompare();
  const startTour = useTour();
  const isHome = pathname === "/home";

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isToggle =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isToggle) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const openItem = useCallback(
    (file) => {
      if (isFolder(file)) {
        router.push(`/home?folder=${encodeURIComponent(file.id)}`);
        return;
      }
      markFileOpened(file.id);
      openPreview(
        file.data,
        files.filter((item) => !isFolder(item)).map((item) => item.data),
      );
    },
    [files, openPreview, router],
  );

  const commands = useMemo(() => {
    const navigation = [
      {
        id: "nav-drive",
        href: "/home",
        group: "Navigation",
        label: "My Drive",
        icon: <MobileScreenShareIcon />,
        run: () => router.push("/home"),
      },
      {
        id: "nav-recent",
        href: "/recent",
        group: "Navigation",
        label: "Recent",
        icon: <QueryBuilderIcon />,
        run: () => router.push("/recent"),
      },
      {
        id: "nav-starred",
        href: "/starred",
        group: "Navigation",
        label: "Starred",
        icon: <StarBorderIcon />,
        run: () => router.push("/starred"),
      },
      {
        id: "nav-trash",
        href: "/trash",
        group: "Navigation",
        label: "Trash",
        icon: <DeleteOutlineIcon />,
        run: () => router.push("/trash"),
      },
    ].filter((item) => item.href !== pathname);

    const actions = [
      {
        id: "action-upload",
        group: "Actions",
        label: "Upload file",
        icon: <FileUploadIcon />,
        run: () => upload.setOpen(true),
      },
      ...(isHome
        ? [
            {
              id: "action-new-folder",
              group: "Actions",
              label: "New folder",
              icon: <CreateNewFolderOutlinedIcon />,
              run: () => setCreateFolderOpen(true),
            },
          ]
        : []),
      {
        id: "action-voice",
        group: "Actions",
        label: "Record voice memo",
        icon: <MicIcon />,
        run: () => upload.openVoiceMemo(),
      },
      ...(isHome
        ? [
            {
              id: "action-focus",
              group: "Modes",
              label: focusActive ? "Exit focus mode" : "Start focus mode",
              icon: <CenterFocusStrongRoundedIcon />,
              run: () => {
                if (selectActive) exitSelect();
                if (compareActive) exitCompare();
                if (focusActive) exitFocus();
                else toggleFocus();
              },
            },
            ...(!focusActive
              ? [
                  {
                    id: "action-select",
                    group: "Modes",
                    label: selectActive
                      ? "Exit select mode"
                      : "Start select mode",
                    icon: <CheckBoxOutlinedIcon />,
                    run: () => {
                      if (compareActive) exitCompare();
                      if (selectActive) exitSelect();
                      else toggleSelect();
                    },
                  },
                  {
                    id: "action-compare",
                    group: "Modes",
                    label: compareActive
                      ? "Exit compare mode"
                      : "Start compare mode",
                    icon: <CompareArrowsRoundedIcon />,
                    run: () => {
                      if (selectActive) exitSelect();
                      if (compareActive) exitCompare();
                      else toggleCompare();
                    },
                  },
                ]
              : []),
          ]
        : []),
      {
        id: "action-theme",
        group: "Actions",
        label: isDark ? "Switch to light theme" : "Switch to dark theme",
        icon: isDark ? <LightModeIcon /> : <DarkModeIcon />,
        run: () => toggleTheme(),
      },
      {
        id: "action-tour",
        group: "Actions",
        label: "Start guided tour",
        icon: <ExploreIcon />,
        run: () => startTour(),
      },
    ];

    return [...navigation, ...actions];
  }, [
    pathname,
    isHome,
    router,
    upload,
    isDark,
    toggleTheme,
    startTour,
    focusActive,
    selectActive,
    compareActive,
    toggleFocus,
    toggleSelect,
    toggleCompare,
    exitFocus,
    exitSelect,
    exitCompare,
  ]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchedCommands = q
      ? commands.filter((command) => command.label.toLowerCase().includes(q))
      : commands;

    const matchedFiles = (q ? searchFiles(files, query) : files)
      .slice(0, MAX_FILE_RESULTS)
      .map((file) => ({
        id: `file-${file.id}`,
        group: isFolder(file) ? "Folders" : "Files",
        label: file.data.filename,
        file,
        run: () => openItem(file),
      }));

    return [...matchedCommands, ...matchedFiles];
  }, [query, commands, files, openItem]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const runItem = useCallback(
    (item) => {
      if (!item) return;
      close();
      item.run();
    },
    [close],
  );

  const onInputKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        items.length ? (prev - 1 + items.length) % items.length : 0,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      runItem(items[activeIndex]);
    }
  };

  if (!mounted) return null;

  const safeActive = Math.min(activeIndex, Math.max(items.length - 1, 0));
  let renderedGroup = null;

  return (
    <>
      {open &&
        createPortal(
          <Backdrop onMouseDown={close}>
            <Panel onMouseDown={(event) => event.stopPropagation()}>
              <SearchRow>
                <SearchIcon />
                <Input
                  ref={inputRef}
                  value={query}
                  placeholder="Search files or type a command…"
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                />
                <Kbd>Esc</Kbd>
              </SearchRow>

              <Results ref={listRef}>
                {items.length === 0 && <Empty>No results found</Empty>}

                {items.map((item, index) => {
                  const showHeader = item.group !== renderedGroup;
                  renderedGroup = item.group;
                  const isActive = index === safeActive;
                  const folder = item.file ? isFolder(item.file) : false;
                  const tokens = item.file
                    ? getFileTypeTokens(
                        item.file.data.contentType,
                        item.file.data.filename,
                        folder ? "folder" : item.file.data.type,
                      )
                    : null;

                  return (
                    <div key={item.id}>
                      {showHeader && <GroupLabel>{item.group}</GroupLabel>}
                      <Item
                        data-active={isActive}
                        $active={isActive}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => runItem(item)}
                      >
                        <ItemIcon
                          $file={Boolean(item.file)}
                          $bgVar={tokens?.bgVar}
                          $colorVar={tokens?.colorVar}
                        >
                          {item.file ? (
                            <FileIcons
                              type={
                                folder ? "folder" : item.file.data.contentType
                              }
                              itemType={folder ? "folder" : undefined}
                            />
                          ) : (
                            item.icon
                          )}
                        </ItemIcon>
                        <ItemLabel>{item.label}</ItemLabel>
                        {isActive && (
                          <EnterHint>
                            <CornerDownLeftIcon />
                          </EnterHint>
                        )}
                      </Item>
                    </div>
                  );
                })}
              </Results>

              <Footer>
                <FootHint>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  navigate
                </FootHint>
                <FootHint>
                  <Kbd>↵</Kbd>
                  select
                </FootHint>
                <FootHint>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                  toggle
                </FootHint>
              </Footer>
            </Panel>
          </Backdrop>,
          document.body,
        )}
      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
      />
    </>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 16px 16px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
`;

const Panel = styled.div`
  width: min(560px, 100%);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);

  svg {
    font-size: 20px;
    color: var(--text-3);
    flex-shrink: 0;
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--text-1);

  &::placeholder {
    color: var(--text-3);
  }
`;

const Results = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px;
`;

const GroupLabel = styled.div`
  padding: 10px 10px 4px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-3);
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 10px;
  cursor: pointer;
  background: ${(p) => (p.$active ? "var(--surface-2)" : "transparent")};
`;

const ItemIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${(p) =>
    p.$file ? `var(${p.$bgVar})` : "var(--surface-3)"};
  color: ${(p) => (p.$file ? `var(${p.$colorVar})` : "var(--text-2)")};

  svg {
    font-size: 18px;
  }
`;

const ItemLabel = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EnterHint = styled.span`
  display: flex;
  align-items: center;
  color: var(--text-3);
  flex-shrink: 0;

  svg {
    font-size: 15px;
  }
`;

const Empty = styled.div`
  padding: 28px 16px;
  text-align: center;
  font-size: 0.86rem;
  color: var(--text-3);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 9px 16px;
  border-top: 1px solid var(--border-light);
  background: var(--surface-2);
`;

const FootHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--text-3);
`;

const Kbd = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 0.68rem;
  font-family: inherit;
  color: var(--text-2);
`;
