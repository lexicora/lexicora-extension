// Shared message type constants and TS types
export const MSG = {
  // From anywhere to background
  SAVE_SELECTION_TO_MARKDOWN: "background/SAVE_SELECTION_TO_MARKDOWN",
  SAVE_PAGE_TO_MARKDOWN: "background/SAVE_PAGE_TO_MARKDOWN",
  TRIGGER_AUTO_CAPTURE_NOTIFICATION:
    "background/TRIGGER_AUTO_CAPTURE_NOTIFICATION",

  // From background to content script
  GET_PAGE_SELECTION_ARTICLE: "content/GET_PAGE_SELECTION_ARTICLE",
  GET_PAGE_SELECTION_DATA: "content/GET_PAGE_SELECTION_DATA",
  GET_PAGE_SELECTION_DATA_AS_IS: "content/GET_PAGE_SELECTION_DATA_AS_IS", //? maybe unnecessary
  GET_PAGE_SELECTION_DATA_AI_ASSISTED:
    "content/GET_PAGE_SELECTION_DATA_AI_ASSISTED", //? maybe unnecessary
  GET_PAGE_HTML: "content/GET_PAGE_HTML",

  // From Background to Sidepanel
  SEND_PAGE_SELECTION_DATA: "sidepanel/SEND_PAGE_SELECTION_DATA",
  NAVIGATE_IN_SIDEPANEL: "sidepanel/NAVIGATE_IN_SIDEPANEL",
  REQUEST_PENDING_DATA: "sidepanel/REQUEST_PENDING_DATA",
  REQUEST_PENDING_NAVIGATION: "sidepanel/REQUEST_PENDING_NAVIGATION",
} as const;

// Types for the messages and their payloads
export type Message =
  // Message from a UI component or context menu click to the background script
  | {
      type: typeof MSG.SAVE_SELECTION_TO_MARKDOWN;
      payload: { selectionText: string };
    }
  | { type: typeof MSG.SAVE_PAGE_TO_MARKDOWN }
  | { type: typeof MSG.TRIGGER_AUTO_CAPTURE_NOTIFICATION }

  // Message from background to content script to request data
  | { type: typeof MSG.GET_PAGE_SELECTION_ARTICLE }
  | { type: typeof MSG.GET_PAGE_SELECTION_DATA }
  | { type: typeof MSG.GET_PAGE_SELECTION_DATA_AS_IS }
  | { type: typeof MSG.GET_PAGE_SELECTION_DATA_AI_ASSISTED }
  | { type: typeof MSG.GET_PAGE_HTML }
  | { type: typeof MSG.REQUEST_PENDING_DATA }
  | { type: typeof MSG.REQUEST_PENDING_NAVIGATION }

  // Message from background to sidepanel with the requested data
  | {
      type: typeof MSG.SEND_PAGE_SELECTION_DATA;
      payload: {
        data: string;
        format: "article" | "raw" | "ai-assisted" | "html";
      };
    };

// Helper typed send (optional)
export type MaybePromise<T> = T | Promise<T>;
