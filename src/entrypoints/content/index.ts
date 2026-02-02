import { onMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";
import { getSelectionPageArticle, getSelectionPageData } from "./selection";
import { setupAutoCaptureTimer } from "./auto-capture";

export default defineContentScript({
  //matches: ['*://*.google.com/*'],
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

    if (!import.meta.env.FIREFOX) {
      setupAutoCaptureTimer(ctx);
    }
  },
});
