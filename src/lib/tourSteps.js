const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");

const cmdKey = isMac ? "⌘K" : "Ctrl+K";

export const TOUR_STEPS = [
  {
    popover: {
      title: "Welcome to Disk Drive 👋",
      description:
        "Let's take a quick spin — under a minute — and unlock every trick this drive has. Hit <b>Next</b> to roll, or <b>Esc</b> to bail anytime. 😉",
    },
  },
  {
    elements: ['[data-tour="upload"]', '[data-tour="upload-fab"]'],
    popover: {
      title: "📤 Upload files",
      description:
        "Tap <b>New</b> (or the <b>+</b> button) to add a file — or just <b>drag &amp; drop</b> anything onto the page. Easy.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="voice-memo"]',
    popover: {
      title: "🎙️ Voice memo",
      description:
        "Hit record and talk — your memo saves straight to the drive. Perfect for ideas on the fly.",
      side: "right",
      align: "start",
    },
  },
  {
    elements: ['[data-tour="nav"]', '[data-tour="mobile-nav"]'],
    popover: {
      title: "🧭 Get around",
      description:
        "Hop between <b>My Drive</b>, <b>Recent</b>, <b>Starred</b>, and <b>Trash</b>. Deleted stuff chills in Trash for 15 days before it's gone.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="storage"]',
    popover: {
      title: "📊 Storage meter",
      description:
        "See how much space you've used at a glance — click for a full breakdown by file type.",
      side: "right",
      align: "center",
    },
  },
  {
    elements: ['[data-tour="search"]', '[data-tour="mobile-search"]'],
    popover: {
      title: "🔎 Search anything",
      description:
        "Find files by name, type, or extension — results pop up instantly as you type.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="view"]',
    popover: {
      title: "🔲 List or grid",
      description: "Flip between a compact list and a visual grid — whatever feels right.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="focus"]',
    popover: {
      title: "🎯 Focus mode",
      description:
        "Hide the clutter — sidebar and actions disappear so you can just read and browse.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="compare"]',
    popover: {
      title: "🔀 Compare files",
      description:
        "Pick two files and view them side-by-side — great for images, PDFs, and text.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="files"]',
    popover: {
      title: "✨ Files & superpowers",
      description:
        "Hover a file (or tap <b>⋮</b>) for the good stuff: <b>Download</b>, <b>Copy link</b>, <b>One-time link</b> 🔗 (dies after first open), <b>QR share</b> 📱, <b>Rename</b>, <b>Self-destruct</b> 💣 (auto-move to Trash), and <b>Delete</b>.",
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
        "Tap your avatar for <b>Storage</b>, <b>Help</b>, <b>theme</b>, and <b>Take a tour</b> to replay this — plus sign out.",
      side: "bottom",
      align: "end",
    },
  },
  {
    desktopOnly: true,
    popover: {
      title: "⚡ Secret weapon",
      description: `Press <b>${cmdKey}</b> anywhere to fly to any file, jump pages, upload, record a memo, switch theme, or replay this tour. Speed unlocked.`,
    },
  },
  {
    popover: {
      title: "You're a pro now! 🎉",
      description:
        "That's everything. Replay the tour anytime from your <b>profile menu</b> or the command palette. Now go build something. 🚀",
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

