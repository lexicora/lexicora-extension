import { onMessage } from "webext-bridge/background";
import { MSG } from "@/types/messaging";
import { pageData } from "@/types/page-selection-data.types";

// This stays private to this module (encapsulation)
let pendingCapture: pageData | null = null;
let pendingNavigation: string | null = null;

// Export the setter so context-menu.ts can call it
export const setPendingCapture = (data: pageData | null) => {
  pendingCapture = data;
};

export const setPendingNavigation = (path: string | null) => {
  pendingNavigation = path;
}; /*FIX TODO: Issue, when side panel is already open on on the /entries/new page the onMessage clear doesn't take effect and when
the side panel is reopened it navigates to this page, because it is not cleared*/
/*TODO: The solution is if already on /entries/new then in the context menu action handler reset this to null when data is sent (not via pull, but push logic)*/

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
}
