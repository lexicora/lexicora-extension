import { onMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";
import { getSelectionPageArticle, getSelectionPageData } from "./selection";
import { setupCaptureSuggestion } from "./capture-suggestion";

export default defineContentScript({
  //matches: ['*://*.google.com/*'],
  // TODO: Maybe change to ["http://*/*", "https://*/*", "file:///*"] or similar, to not run on unsupported pages and easier acceptance in to browser web-stores
  matches: ["<all_urls>"],
  excludeMatches: import.meta.env.FIREFOX
    ? ["about:*", "https://addons.mozilla.org/*"]
    : [
        "https://chromewebstore.google.com/*",
        "https://microsoftedge.microsoft.com/*",
      ], // Add more browser-specific excluded URLs if needed (like extensions own pages)
  main(ctx) {
    //console.log("Hello content.");

    //* INFO: Handle Messages (maybe move to messaging-handler.ts if it grows)
    //* Background script requests
    onMessage(MSG.GET_PAGE_SELECTION_ARTICLE, getSelectionPageArticle);
    onMessage(MSG.GET_PAGE_SELECTION_DATA, getSelectionPageData);

    //* NOTE (feature parity discrepancy): Not supported on Firefox due to quicker loss of the direct user context action.
    //* NOTE: The messaging in Firefox does not support opening the sidebar from here due to context loss.
    if (!import.meta.env.FIREFOX) {
      setupCaptureSuggestion(ctx);
    }
  },
});
