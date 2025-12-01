export type ContextMenuCreateProps = Parameters<typeof browser.contextMenus.create>[0];

export const CMI_ID = {
  SAVE_SELECTION_AS_IS: "save-selection-as-is",
  SAVE_SELECTION_AI_ASSISTED: "save-selection-ai-assisted",
  OPEN_LEXICORA: "open-lexicora",
} as const;

export const CONTEXT_MENU_ITEMS: ContextMenuCreateProps[] = [
  {
    id: CMI_ID.SAVE_SELECTION_AS_IS,
    title: "Save Selection as is",
    contexts: ["selection"],
  },
  {
    id: CMI_ID.SAVE_SELECTION_AI_ASSISTED,
    title: "Save Selection AI-Assisted",
    contexts: ["selection"],
  },
  { 
    id: CMI_ID.OPEN_LEXICORA, 
    title: "Open Lexicora Website", 
    contexts: ["all"] 
  },
];
