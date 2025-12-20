export type ContextMenuCreateProps = Parameters<
  typeof browser.contextMenus.create
>[0];

/**
 * Context Menu Item Identifiers
 */
export const CMI_ID = {
  OPEN_LEXICORA: "open-lexicora",
  SAVE_SELECTION_AI_ASSISTED: "save-selection-ai-assisted",
  SAVE_SELECTION_AS_IS: "save-selection-as-is",
  SAVE_FROM_CLIPBOARD: "save-from-clipboard",
} as const;

// Todo: localize titles later and change order for better UX
export const CONTEXT_MENU_ITEMS: ContextMenuCreateProps[] = [
  {
    id: CMI_ID.OPEN_LEXICORA,
    title: "Open Lexicora Website",
    contexts: ["all"],
  },
  {
    id: CMI_ID.SAVE_SELECTION_AI_ASSISTED,
    title: "Save Selection AI-Assisted",
    contexts: ["selection"],
  },
  {
    id: CMI_ID.SAVE_SELECTION_AS_IS,
    title: "Save Selection as is",
    contexts: ["selection"],
  },
  {
    id: CMI_ID.SAVE_FROM_CLIPBOARD,
    title: "Save from Clipboard",
    contexts: ["all"],
  },
  //TODO MAYBE: Add option to save without opening side panel and only show notification of success/failure
];
