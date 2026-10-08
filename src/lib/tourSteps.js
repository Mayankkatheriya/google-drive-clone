const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");

const cmdKey = isMac ? "⌘K" : "Ctrl+K";

export const TOUR_STEPS = [
  {
    popover: {
      title: "Welcome to Disk Drive 👋",
      description:
        "Quick spin through what's new — folders, filters, multi-select zip, share links, and more. Hit <b>Next</b>, or <b>Esc</b> anytime.",
    },
  },
  {
    elements: ['[data-tour="upload"]', '[data-tour="upload-fab"]'],
    popover: {
      title: "📤 New — files & folders",
      description:
        "Tap <b>New</b> (or the <b>+</b> button) for <b>File upload</b> or <b>New folder</b>. You can also <b>drag &amp; drop</b> files onto the page.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="voice-memo"]',
    popover: {
      title: "🎙️ Voice memo",
      description:
        "Hit record and talk — your memo saves straight into My Drive. Great for quick notes.",
      side: "right",
      align: "start",
    },
  },
  {
    elements: ['[data-tour="nav"]', '[data-tour="mobile-nav"]'],
    popover: {
      title: "🧭 Get around",
      description:
        "Hop between <b>My Drive</b>, <b>Recent</b>, <b>Starred</b>, and <b>Trash</b>. Open folders from Recent to jump right in. Trash keeps items for 15 days.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="storage"]',
    popover: {
      title: "📊 Storage & cleanup",
      description:
        "See space used at a glance. Open Storage for a breakdown — and a cleanup assistant for expired share links and clutter.",
      side: "right",
      align: "center",
    },
  },
  {
    elements: ['[data-tour="search"]', '[data-tour="mobile-search"]'],
    popover: {
      title: "🔎 Search anything",
      description:
        "Find files and folders by name, type, or extension — results show up as you type.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="view"]',
    popover: {
      title: "🔲 List or grid",
      description:
        "Flip between a compact list and a visual grid. Folders and files live in one combined view.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="type-filter"]',
    popover: {
      title: "📁 All · Folders · Files",
      description:
        "Filter My Drive to show <b>everything</b>, only <b>folders</b>, or only <b>files</b>. Counts update as you go.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="focus"]',
    popover: {
      title: "🎯 Focus mode",
      description:
        "Hide the clutter — sidebar and extra actions disappear so you can browse and open files cleanly. Esc exits on desktop.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="select"]',
    popover: {
      title: "✅ Multi-select",
      description:
        "Turn on <b>Select</b>, tap items, then <b>Select all</b>, <b>Move</b>, <b>Star</b>, <b>Zip download</b> (files + folders), or <b>Delete</b>. Esc or <b>Done</b> exits — on mobile the + button hides so the bar stays clear.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="compare"]',
    popover: {
      title: "🔀 Compare files",
      description:
        "Pick two files of the same type and view them side-by-side — images, PDFs, and more.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="files"]',
    popover: {
      title: "✨ Files, folders & share",
      description:
        "Open folders with a click. Hover or tap <b>⋮</b> for <b>Download</b> / <b>Download zip</b> (folders), <b>Share link</b> (create, copy, revoke all links), <b>Move</b>, <b>Rename</b>, <b>Version history</b>, <b>Self-destruct</b>, and more.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="theme"]',
    popover: {
      title: "🌗 Light &amp; dark",
      description: "Flip the theme — we'll remember your pick next time.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="help"]',
    popover: {
      title: "🆘 Stuck?",
      description: "Help &amp; Support is right here whenever you need a hand.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="profile"]',
    popover: {
      title: "👤 Your account",
      description:
        "Avatar menu: <b>Storage</b>, <b>Help</b>, <b>theme</b>, and <b>Take a tour</b> to replay this — plus sign out.",
      side: "bottom",
      align: "end",
    },
  },
  {
    desktopOnly: true,
    popover: {
      title: "⚡ Secret weapon",
      description: `Press <b>${cmdKey}</b> anywhere for the command palette — jump to pages, open files or folders, upload, voice memo, theme, or replay the tour. On <b>My Drive</b> you also get <b>New folder</b> and <b>Focus / Select / Compare</b>.`,
    },
  },
  {
    popover: {
      title: "You're set! 🎉",
      description:
        "Replay anytime from your <b>profile menu</b> or the command palette. Folders, filters, select + zip, and share links are ready — go build. 🚀",
    },
  },
];

function isVisible(selector) {
  const el = document.querySelector(selector);
  if (!el) return false;
  // Hidden (display:none) desktop/mobile elements report a zero-size box,
  // so this reliably distinguishes the visible anchor for the current viewport.
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function buildTourSteps() {
  if (typeof document === "undefined") return TOUR_STEPS;

  const isCoarse =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  return TOUR_STEPS.reduce((acc, step) => {
    if (step.desktopOnly && isCoarse) return acc;

    const candidates =
      step.elements || (step.element ? [step.element] : null);

    // Centered informational step (no anchor)
    if (!candidates) {
      acc.push(step);
      return acc;
    }

    const found = candidates.find((selector) => isVisible(selector));
    if (found) {
      const { elements, ...rest } = step;
      acc.push({ ...rest, element: found });
    }
    return acc;
  }, []);
}
