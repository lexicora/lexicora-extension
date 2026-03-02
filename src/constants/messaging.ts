// Shared message type constants and TS types
// [destination]/[action] - This convention helps to quickly identify the flow of messages and their purpose, improving maintainability and readability.
/**
 * Collection of Message identifiers, to be used for messaging within the browser extension.
 */
export const MSG = {
  // From anywhere to background
  OPEN_SIDEPANEL: "background/OPEN_SIDEPANEL",
  REQUEST_PAGE_CAPTURE: "background/REQUEST_PAGE_CAPTURE",
  TRIGGER_AUTO_CAPTURE_NOTIFICATION:
    "background/TRIGGER_AUTO_CAPTURE_NOTIFICATION",
  CHECK_SIDEPANEL_OPEN: "background/CHECK_SIDEPANEL_OPEN",
  //SAVE_SELECTION_TO_MARKDOWN: "background/SAVE_SELECTION_TO_MARKDOWN",
  //SAVE_PAGE_TO_MARKDOWN: "background/SAVE_PAGE_TO_MARKDOWN",

  // From anywhere to content script
  GET_PAGE_SELECTION_ARTICLE: "content/GET_PAGE_SELECTION_ARTICLE",
  GET_PAGE_SELECTION_DATA: "content/GET_PAGE_SELECTION_DATA",
  GET_PAGE_DATA: "content/GET_PAGE_DATA",
  //GET_PAGE_SELECTION_DATA_AS_IS: "content/GET_PAGE_SELECTION_DATA_AS_IS", //? maybe unnecessary
  //GET_PAGE_SELECTION_DATA_AI_ASSISTED:
  //  "content/GET_PAGE_SELECTION_DATA_AI_ASSISTED", //? maybe unnecessary
  //GET_PAGE_HTML: "content/GET_PAGE_HTML",

  // From anywhere to side-panel
  SEND_PAGE_SELECTION_DATA: "sidepanel/SEND_PAGE_SELECTION_DATA",
  NAVIGATE_IN_SIDEPANEL: "sidepanel/NAVIGATE_IN_SIDEPANEL",

  // From side-panel to background
  REQUEST_PENDING_DATA: "background/REQUEST_PENDING_DATA",
  REQUEST_PENDING_NAVIGATION: "background/REQUEST_PENDING_NAVIGATION",
  //REQUEST_SIDEPANEL_STATE: "sidepanel/REQUEST_SIDEPANEL_STATE",
} as const;
