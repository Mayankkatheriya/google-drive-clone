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
import { useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import FileUploadIcon from "@mui/icons-material/FileUploadOutlined";
import MicIcon from "@mui/icons-material/MicNoneOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import ExploreIcon from "@mui/icons-material/ExploreOutlined";
import CornerDownLeftIcon from "@mui/icons-material/KeyboardReturnOutlined";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
} from "./SvgIcons";
import FileIcons from "./FileIcons";
import { getFileTypeTokens } from "@/lib/fileTypeColors";
import { searchFiles } from "@/lib/searchFiles";
import { markFileOpened } from "./firebaseApi";
import { useMyFiles } from "@/context/FilesContext";
import { useFilePreview } from "@/context/FilePreviewContext";
import { useTheme } from "@/context/ThemeContext";
import { useFileUploadContext } from "@/context/FileUploadContext";
import { useTour } from "@/context/TourProvider";

const MAX_FILE_RESULTS = 6;

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  const router = useRouter();
  const files = useMyFiles();
  const { open: openPreview } = useFilePreview();
  const { isDark, toggleTheme } = useTheme();
  const upload = useFileUploadContext();
  const startTour = useTour();

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

  const runFilePreview = useCallback(
    (file) => {
      markFileOpened(file.id);
      openPreview(
        file.data,
        files.map((item) => item.data),
      );
    },
    [files, openPreview],
  );

  const commands = useMemo(() => {
    const navigation = [
      {
        id: "nav-drive",
        group: "Navigation",
        label: "My Drive",
        icon: <MobileScreenShareIcon />,
        run: () => router.push("/home"),
      },
      {
        id: "nav-recent",
        group: "Navigation",
        label: "Recent",
        icon: <QueryBuilderIcon />,
        run: () => router.push("/recent"),
      },
      {
        id: "nav-starred",
        group: "Navigation",
        label: "Starred",
        icon: <StarBorderIcon />,
        run: () => router.push("/starred"),
      },
      {
        id: "nav-trash",
        group: "Navigation",
        label: "Trash",
        icon: <DeleteOutlineIcon />,
        run: () => router.push("/trash"),
      },
    ];

    const actions = [
      {
        id: "action-upload",
        group: "Actions",
        label: "Upload file",
        icon: <FileUploadIcon />,
        run: () => upload.setOpen(true),
      },
      {
        id: "action-voice",
        group: "Actions",
        label: "Record voice memo",
        icon: <MicIcon />,
        run: () => upload.openVoiceMemo(),
      },
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
  }, [router, upload, isDark, toggleTheme, startTour]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchedCommands = q
      ? commands.filter((command) => command.label.toLowerCase().includes(q))
      : commands;

    const matchedFiles = (q ? searchFiles(files, query) : files)
      .slice(0, MAX_FILE_RESULTS)
      .map((file) => ({
        id: `file-${file.id}`,
        group: "Files",
        label: file.data.filename,
        file,
        run: () => runFilePreview(file),
      }));

    return [...matchedCommands, ...matchedFiles];
  }, [query, commands, files, runFilePreview]);

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

  if (!mounted || !open) return null;

  const safeActive = Math.min(activeIndex, Math.max(items.length - 1, 0));
  let renderedGroup = null;

  return createPortal(
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
            const tokens = item.file
              ? getFileTypeTokens(
                  item.file.data.contentType,
                  item.file.data.filename,
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
                      <FileIcons type={item.file.data.contentType} />
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
