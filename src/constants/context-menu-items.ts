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

export const TOGGLE_EXTENDED_URL_PATTERNS = [
  "chrome://*/*", // Chrome and Chromium
  "edge://*/*", // Edge
  "brave://*/*", // Brave
  "opera://*/*", // Opera
  "vivaldi://*/*", // Vivaldi
  "browser://*/*", // Yandex
  "arc://*/*", // Arc
  "about:*", // about:blank and the internal pages that use it
];

// The side-panel item wants to appear anywhere except inside the extension
// itself, where the click carries no window and `sidePanel.open` rejects it.
//
// Firefox can say that: `viewTypes: ["tab"]` is every page in a tab and
// nothing else — not the sidebar, not the popup.
//
// Chromium cannot. Its only filter is `documentUrlPatterns`, whose scheme may
// be http, https, `*` or file, so the browser's own pages cannot be named,
// and the extension's own pages cannot be excluded. Every arrangement was
// tried: patterns alone lost the item on internal pages, and a second
// patternless item shown by active-tab URL still appeared inside the panel.
//
// So Chromium gets no patterns at all. The item shows everywhere, the panel
// included, and clicking it there says why it does nothing rather than
// failing silently — see `toggleSidePanel` in `background/capture-flow`.
const TOGGLE_SIDE_PANEL_ITEM = (
  import.meta.env.FIREFOX
    ? {
        id: CMI_ID.TOGGLE_SIDE_PANEL,
        title: "Toggle side panel",
        contexts: ["all"],
        viewTypes: ["tab"],
      }
    : {
        id: CMI_ID.TOGGLE_SIDE_PANEL,
        title: "Toggle side panel",
        contexts: ["all"],
      }
  // viewTypes is Firefox's own; the Chromium types do not know it.
) as ContextMenuCreateProps;

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
  TOGGLE_SIDE_PANEL_ITEM,
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
