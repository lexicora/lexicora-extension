export type ContextMenuCreateProps = Parameters<
  typeof browser.contextMenus.create
>[0];

/**
 * Context Menu Item Identifiers
 */
export const CMI_ID = {
  OPEN_LEXICORA: "open-lexicora",
  TOGGLE_SIDE_PANEL: "toggle-side-panel",
  CAPTURE_SELECTION_AI_ASSISTED: "save-selection-ai-assisted",
  CAPTURE_SELECTION_AS_IS: "save-selection-as-is",
  CAPTURE_PAGE_AI_ASSISTED: "save-page-ai-assisted",
  CAPTURE_PAGE_AS_IS: "save-page-as-is",
  CAPTURE_PAGE_BOOKMARK: "save-page-bookmark",
  //CAPTURE_FROM_CLIPBOARD: "save-from-clipboard",
} as const;

// Where a capture item is offered: the pages a content script runs in, since
// a capture needs one to answer. The http/https wildcard covers any host and
// port, so localhost and a dev server are already included.
export const CAPTURE_URL_PATTERNS = ["*://*/*", "file:///*"];

// Everywhere except the extension's own pages.
//
// Toggling the panel works on any page the browser can show — its internal
// ones included — but not inside the panel itself, where the click carries no
// window and `sidePanel.open` rejects it. Match patterns can only allow-list,
// so "anything but an extension page" has to be enumerated: the web, local
// files, and each browser's own scheme. What is deliberately absent is every
// extension scheme: chrome-extension://, moz-extension://, extension:// on
// Edge, safari-web-extension:// .
//
// A browser validates every pattern and refuses the whole item over one it
// does not know, so these go in as a chain: the full list, then the two
// schemes most likely to be accepted, then the web alone. The menu creation
// in `background/index.ts` walks it and logs, in dev, where it landed.
const FIREFOX_INTERNAL_PATTERNS = ["about:*", "resource://*/*"];

const CHROMIUM_INTERNAL_PATTERNS = [
  "chrome://*/*", // Chrome and Chromium
  "edge://*/*", // Edge
  "brave://*/*", // Brave
  "opera://*/*", // Opera
  "vivaldi://*/*", // Vivaldi
  "browser://*/*", // Yandex
  "arc://*/*", // Arc
];

const INTERNAL_PATTERNS = import.meta.env.FIREFOX
  ? FIREFOX_INTERNAL_PATTERNS
  : CHROMIUM_INTERNAL_PATTERNS;

/** Most generous first, web-only last; the first the browser accepts wins. */
export const NON_EXTENSION_PATTERN_CHAIN: string[][] = [
  [...CAPTURE_URL_PATTERNS, "ftp://*/*", ...INTERNAL_PATTERNS],
  [...CAPTURE_URL_PATTERNS, INTERNAL_PATTERNS[0]!],
  CAPTURE_URL_PATTERNS,
];

export const NON_EXTENSION_URL_PATTERNS = NON_EXTENSION_PATTERN_CHAIN[0]!;

// MAYBE: localize titles later and change order for better UX
/**
 * Context Menu Items Definitions
 */
export const CONTEXT_MENU_ITEMS: ContextMenuCreateProps[] = [
  //* TODO (FEATURES.WEBSITE): these two share the top slot — the side panel
  //* item only exists while the website link is off. When the website comes
  //* back, decide what this menu should look like: both entries (and in which
  //* order, with a separator?), or keep only one. Until then, turning the flag
  //* on swaps the panel item out for the website one.
  {
    id: CMI_ID.TOGGLE_SIDE_PANEL,
    // Closes an open panel too, like the keyboard shortcut.
    title: "Toggle side panel",
    contexts: ["all"],
    // Everywhere but the extension's own pages; see the constant.
    documentUrlPatterns: NON_EXTENSION_URL_PATTERNS,
  },
  {
    id: CMI_ID.OPEN_LEXICORA,
    title: "Open Lexicora Website",
    contexts: ["all"],
  },
  {
    id: "separator1",
    type: "separator",
    contexts: ["selection"],
  },
  {
    id: CMI_ID.CAPTURE_SELECTION_AI_ASSISTED,
    title: "Capture Selection with AI",
    contexts: ["selection"],
    documentUrlPatterns: CAPTURE_URL_PATTERNS,
  },
  {
    id: CMI_ID.CAPTURE_SELECTION_AS_IS,
    title: "Capture Selection",
    contexts: ["selection"],
    documentUrlPatterns: CAPTURE_URL_PATTERNS,
  },
  {
    id: "separator2",
    type: "separator",
    contexts: [
      "page",
      "selection",
      "link",
      "image",
      "video",
      "audio",
      "frame",
      "editable",
    ],
    documentUrlPatterns: CAPTURE_URL_PATTERNS,
  },
  {
    id: CMI_ID.CAPTURE_PAGE_AI_ASSISTED,
    title: "Capture Page with AI",
    contexts: [
      "page",
      "selection",
      "link",
      "image",
      "video",
      "audio",
      "frame",
      "editable",
    ],
    documentUrlPatterns: CAPTURE_URL_PATTERNS,
  },
  {
    id: CMI_ID.CAPTURE_PAGE_AS_IS,
    title: "Capture Page",
    contexts: [
      "page",
      "selection",
      "link",
      "image",
      "video",
      "audio",
      "frame",
      "editable",
    ], // TODO (Firefox pass): Potentially change to just "all".
    documentUrlPatterns: CAPTURE_URL_PATTERNS,
  },
  {
    id: CMI_ID.CAPTURE_PAGE_BOOKMARK,
    title: "Bookmark Page",
    contexts: [
      "page",
      "selection",
      "link",
      "image",
      "video",
      "audio",
      "frame",
      "editable",
    ], // TODO (Firefox pass): Potentially change to just "all".
    documentUrlPatterns: CAPTURE_URL_PATTERNS,
  },
  // {
  //   id: CMI_ID.CAPTURE_FROM_CLIPBOARD,
  //   title: "Capture from Clipboard",
  //   contexts: ["all"],
  // },
  //MAYBE: Add option to save without opening side panel and only show notification of success/failure

  //type: "normal" is the default.
  // Add more browser-specific excluded URLs if needed (like extensions own pages)
  // documentUrlPatterns: ["https://**", "https://**"] (put in each item if needed)
];

/** Items shown only while `FEATURES.WEBSITE` is on. */
export const CONTEXT_MENU_ITEMS_WEBSITE: string[] = [CMI_ID.OPEN_LEXICORA];

/** Items shown only while `FEATURES.WEBSITE` is off, in the website item's place. */
export const CONTEXT_MENU_ITEMS_NO_WEBSITE: string[] = [
  CMI_ID.TOGGLE_SIDE_PANEL,
];

/**
 * Use this to disable ai context menu items if the feature is not available or disabled.
 */
export const CONTEXT_MENU_ITEMS_AI: string[] = [
  CMI_ID.CAPTURE_SELECTION_AI_ASSISTED,
  "Separator2",
  CMI_ID.CAPTURE_PAGE_AI_ASSISTED,
];
