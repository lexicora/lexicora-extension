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

// TODO: localize titles later and change order for better UX
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
    title: "Open or close Lexicora side panel",
    contexts: ["all"],
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
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"], //MAYBE: Add more later, if necessary or useful
  },
  {
    id: CMI_ID.CAPTURE_SELECTION_AS_IS,
    title: "Capture Selection",
    contexts: ["selection"],
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"], //MAYBE: Add more later, if necessary or useful
  },
  {
    id: "separator2",
    type: "separator",
    contexts: ["page", "selection", "link", "image", "video", "audio", "frame", "editable"], // TODO: Potentially change to just "all". (Check Firefox)
  },
  {
    id: CMI_ID.CAPTURE_PAGE_AI_ASSISTED,
    title: "Capture Page with AI",
    contexts: ["page", "selection", "link", "image", "video", "audio", "frame", "editable"],
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"], //MAYBE: Add more later, if necessary or useful
  },
  {
    id: CMI_ID.CAPTURE_PAGE_AS_IS,
    title: "Capture Page",
    contexts: ["page", "selection", "link", "image", "video", "audio", "frame", "editable"], // TODO: Potentially change to just "all". (Check Firefox)
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"], //MAYBE: Add more later, if necessary or useful
  },
  {
    id: CMI_ID.CAPTURE_PAGE_BOOKMARK,
    title: "Bookmark Page",
    contexts: ["page", "selection", "link", "image", "video", "audio", "frame", "editable"], // TODO: Potentially change to just "all". (Check Firefox)
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"], //MAYBE: Add more later, if necessary or useful
  },
  // {
  //   id: CMI_ID.CAPTURE_FROM_CLIPBOARD,
  //   title: "Capture from Clipboard",
  //   contexts: ["all"],
  // },
  //TODO MAYBE: Add option to save without opening side panel and only show notification of success/failure

  //type: "normal" is the default.
  // Add more browser-specific excluded URLs if needed (like extensions own pages)
  // documentUrlPatterns: ["https://**", "https://**"] (put in each item if needed)
];

/** Items shown only while `FEATURES.WEBSITE` is on. */
export const CONTEXT_MENU_ITEMS_WEBSITE: string[] = [CMI_ID.OPEN_LEXICORA];

/** Items shown only while `FEATURES.WEBSITE` is off, in the website item's place. */
export const CONTEXT_MENU_ITEMS_NO_WEBSITE: string[] = [CMI_ID.TOGGLE_SIDE_PANEL];

/**
 * Use this to disable ai context menu items if the feature is not available or disabled.
 */
export const CONTEXT_MENU_ITEMS_AI: string[] = [
  CMI_ID.CAPTURE_SELECTION_AI_ASSISTED,
  "Separator2",
  CMI_ID.CAPTURE_PAGE_AI_ASSISTED,
];
