import { onMessage } from "webext-bridge/content-script";
import { MSG } from "@/types/messaging";
import {
  getSelectionPageArticle as getSelectionPageArticle,
  getSelectionPageData,
} from "./selection";

export default defineContentScript({
  //matches: ['*://*.google.com/*'],
  matches: ["<all_urls>"],
  excludeMatches: import.meta.env.FIREFOX
    ? ["about:*", "https://addons.mozilla.org/*"]
    : [
        "https://chromewebstore.google.com/*",
        "https://microsoftedge.microsoft.com/*",
      ],
  main() {
    //console.log("Hello content.");

    //* INFO: Handle Messages (maybe move to messaging-handler.ts if it grows)
    //* Background script requests
    onMessage(MSG.GET_PAGE_SELECTION_ARTICLE, getSelectionPageArticle);
    onMessage(MSG.GET_PAGE_SELECTION_DATA, getSelectionPageData);
  },
});
