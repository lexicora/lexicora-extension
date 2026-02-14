export type ContextMenuCreateProps = Parameters<
  typeof browser.contextMenus.create
>[0];

/**
 * Context Menu Item Identifiers
 */
export const CMI_ID = {
  OPEN_LEXICORA: "open-lexicora",
  CAPTURE_SELECTION_AI_ASSISTED: "save-selection-ai-assisted",
  CAPTURE_SELECTION_AS_IS: "save-selection-as-is",
  CAPTURE_PAGE_AI_ASSISTED: "save-page-ai-assisted",
  CAPTURE_PAGE_AS_IS: "save-page-as-is",
  //CAPTURE_FROM_CLIPBOARD: "save-from-clipboard",
} as const;

// TODO: localize titles later and change order for better UX
/**
 * Context Menu Items Definitions
 */
export const CONTEXT_MENU_ITEMS: ContextMenuCreateProps[] = [
  {
    id: CMI_ID.OPEN_LEXICORA,
    title: "Open Lexicora Website",
    contexts: ["all"],
  },
  {
    id: "separator1",
    type: "separator",
    contexts: ["all"],
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"], //MAYBE: Add more later, if necessary or useful
  }, //TODO: Later add capture page option
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
    contexts: ["selection"],
  },
  {
    id: CMI_ID.CAPTURE_PAGE_AI_ASSISTED,
    title: "Capture Page with AI",
    contexts: ["page", "selection"],
    documentUrlPatterns: ["http://*/*", "https://*/*", "file:///*"], //MAYBE: Add more later, if necessary or useful
  },
  {
    id: CMI_ID.CAPTURE_PAGE_AS_IS,
    title: "Capture Page",
    contexts: ["page", "selection"],
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
