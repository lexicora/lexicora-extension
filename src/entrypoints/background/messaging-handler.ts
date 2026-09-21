import { onMessage } from "@/lib/messaging";
import { MSG } from "@/constants/messaging";
import type {
  CaptureFailureReason,
  CaptureMode,
  PageData,
} from "@/types/page-data.types";

/** Why a capture produced nothing, and what had been asked for. */
export interface PendingCaptureFailure {
  reason: CaptureFailureReason;
  mode: CaptureMode;
}
import { handleCaptureRequest } from "./capture-request";

// This stays private to this module (encapsulation)
let pendingCapture: PageData | null = null;
let pendingNavigation: string | null = null;
let pendingCaptureFailure: PendingCaptureFailure | null = null;

// Export the setter so context-menu.ts can call it
export const setPendingCapture = (data: PageData | null) => {
  pendingCapture = data;
};

export const setPendingNavigation = (path: string | null) => {
  pendingNavigation = path;
};

/**
 * Held for a panel that is still opening, which cannot receive the push yet.
 * A new capture clears it, so the panel never reports a failure the user has
 * already moved past.
 */
export const setPendingCaptureFailure = (
  failure: PendingCaptureFailure | null,
) => {
  pendingCaptureFailure = failure;
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

  onMessage(MSG.REQUEST_PENDING_CAPTURE_FAILURE, () => {
    const failure = pendingCaptureFailure;
    pendingCaptureFailure = null; // Clear after delivery, like the others
    return failure;
  });

  onMessage(MSG.OPEN_SIDEPANEL, (/*message.*/ { sender }) => {
    if (import.meta.env.FIREFOX) {
      // NOTE (feature parity discrepancy): Not supported on Firefox due to quicker loss of the direct user context action.
      // @ts-ignore: Firefox specific API
      //browser.sidebarAction.open();
    } else if (sender.tab?.id) {
      browser.sidePanel.open({ tabId: sender.tab.id });
    }
  });

  onMessage(MSG.REQUEST_PAGE_CAPTURE, async ({ data }) =>
    handleCaptureRequest(data.fromContext, data, data.mode),
  );

  // Native messaging, not needed for this currently
  // Handle native browser messages (safely bypasses bfcache port limits)
  // browser.runtime.onMessage.addListener((message, sender) => {
  //   if (message.type === MSG.OPEN_SIDEPANEL) {
  //     if (import.meta.env.FIREFOX) {
  //       // NOTE (feature parity discrepancy): Not supported on Firefox due to quicker loss of the direct user context action.
  //       // @ts-ignore: Firefox specific API
  //       //browser.sidebarAction.open();
  //     } else if (sender.tab?.id) {
  //       browser.sidePanel.open({ tabId: sender.tab.id });
  //     }
  //   }
  // });
}
