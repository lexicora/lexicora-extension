import { MSG } from "@/constants/messaging";
import { getPageData } from "./capture/page";
import { getSelectionPageData } from "./capture/selection";

/**
 * Sets up message handlers for pending data requests
 */
export function setupMessagingHandlers() {
  // Native messaging, for minimal latency, for capture actions
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

  // onMessage(MSG.GET_PAGE_SELECTION_DATA, async (message) => {
  //   return await getSelectionPageData();
  // });

  // onMessage(MSG.GET_PAGE_DATA, async () => {
  //   return await getPageData();
  // });
}
