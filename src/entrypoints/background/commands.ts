import { COMMAND_ID } from "@/constants/shortcuts";
import { isCapturableUrl } from "@/constants/support-capture-sites";
import type { CaptureMode } from "@/types/page-data.types";
import {
  captureMessagesFor,
  openSidePanel,
  reportCaptureFailure,
  requestAndForwardCapture,
  toggleSidePanel,
} from "./capture-flow";

/**
 * Handles the browser-wide keyboard shortcuts declared in the manifest (see
 * `constants/shortcuts.ts`).
 *
 * A keyboard shortcut counts as a user action, so it may open the side panel —
 * but only synchronously, which is why every branch opens it before its first
 * `await`. Firefox's "open sidebar" shortcut is its built-in
 * `_execute_sidebar_action` and never reaches this listener.
 */
export function setupCommands() {
  browser.commands.onCommand.addListener((command, tab) => {
    //* INFO: Debug log — says whether a key reached the extension at all,
    //* which is the first question when a shortcut appears to do nothing.
    if (import.meta.env.DEV) {
      console.log("Command:", command, "tab:", tab?.id, tab?.windowId);
    }

    switch (command) {
      case COMMAND_ID.OPEN_SIDE_PANEL:
        toggleSidePanel(tab?.windowId);
        break;
      case COMMAND_ID.CAPTURE:
        captureWithShortcut(tab, "auto");
        break;
      case COMMAND_ID.BOOKMARK:
        captureWithShortcut(tab, "bookmark");
        break;
    }
  });
}

function captureWithShortcut(
  tab: Browser.tabs.Tab | undefined,
  mode: CaptureMode,
): void {
  if (tab?.id === undefined) return;

  // On a page that cannot be captured (browser pages, the web stores, PDFs)
  // there is no content script to answer, so the panel would sit on a loading
  // skeleton. Open it on its current page instead and say why, since a
  // shortcut gives no other sign that nothing happened.
  if (!isCapturableUrl(tab.url)) {
    openSidePanel(tab.windowId);
    void reportCaptureFailure(tab.windowId, "unsupported", mode);
    return;
  }

  openSidePanel(tab.windowId, { forCapture: true });
  requestAndForwardCapture(tab.id, tab.windowId, captureMessagesFor(mode));
}
