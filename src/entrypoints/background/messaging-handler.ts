import { onMessage } from "webext-bridge/background";
import { MSG } from "@/constants/messaging";
import { PageData } from "@/types/page-data.types";
import { handleCaptureRequest } from "./capture-request";

// This stays private to this module (encapsulation)
let pendingCapture: PageData | null = null;
let pendingNavigation: string | null = null;

// Export the setter so context-menu.ts can call it
export const setPendingCapture = (data: PageData | null) => {
  pendingCapture = data;
};

export const setPendingNavigation = (path: string | null) => {
  pendingNavigation = path;
};

/**
 * Sets up message handlers for pending data and navigation requests
 */
export function setupMessagingHandlers() {
  onMessage(MSG.REQUEST_PENDING_DATA, () => {
    const data = pendingCapture;
    pendingCapture = null; // Clear after delivery to prevent stale data
    return data;
  });

  onMessage(MSG.REQUEST_PENDING_NAVIGATION, () => {
    const path = pendingNavigation;
    pendingNavigation = null; // Clear after delivery to prevent stale navigation
    return path;
  });

  onMessage(MSG.OPEN_SIDEPANEL, ({ sender }) => {
    if (import.meta.env.FIREFOX) {
      // NOTE (feature parity discrepancy): Not supported on Firefox due to quicker loss of the direct user context action.
      // @ts-ignore: Firefox specific API
      //browser.sidebarAction.open();
    } else {
      browser.sidePanel.open({ tabId: sender.tabId });
    }
  });

  // TODO: Later change to pass the windowId
  onMessage(MSG.REQUEST_PAGE_CAPTURE, async ({ sender, data }) =>
    handleCaptureRequest(sender.context, data),
  );
}
