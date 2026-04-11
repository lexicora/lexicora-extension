import { onMessage } from "webext-bridge/content-script";
import { MSG } from "@/constants/messaging";
import { getSelectionPageData } from "./capture/selection";
import { getPageData } from "./capture/page";

/**
 * Sets up message handlers for pending data requests
 */
export function setupMessagingHandlers() {
  //* Background script requests
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case MSG.GET_PAGE_SELECTION_DATA:
        Promise.resolve(getSelectionPageData()).then(sendResponse);
        return true; // Return true to indicate an asynchronous response
        
      case MSG.GET_PAGE_DATA:
        Promise.resolve(getPageData()).then(sendResponse);
        return true; // Return true to indicate an asynchronous response
    }
  });
}
