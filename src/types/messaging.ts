// Shared message type constants and TS types
export const MSG = {
  // From anywhere to background
  SAVE_SELECTION_TO_MARKDOWN: 'background/SAVE_SELECTION_TO_MARKDOWN',
  SAVE_PAGE_TO_MARKDOWN: 'background/SAVE_PAGE_TO_MARKDOWN',

  // From background to content script
  GET_SELECTION_HTML_AS_IS: 'content/GET_SELECTION_HTML_AS_IS',
  GET_SELECTION_HTML_AI_ASSISTED: 'content/GET_SELECTION_HTML_AI_ASSISTED',
  GET_PAGE_HTML: 'content/GET_PAGE_HTML',
} as const;

// Types for the messages and their payloads
export type Message =
  // Message from a UI component or context menu click to the background script
  | { type: typeof MSG.SAVE_SELECTION_TO_MARKDOWN; payload: { selectionText: string } }
  | { type: typeof MSG.SAVE_PAGE_TO_MARKDOWN }
  
  // Message from background to content script to request data
  | { type: typeof MSG.GET_SELECTION_HTML_AS_IS }
  | { type: typeof MSG.GET_SELECTION_HTML_AI_ASSISTED }
  | { type: typeof MSG.GET_PAGE_HTML };

// Helper typed send (optional)
export type MaybePromise<T> = T | Promise<T>;
