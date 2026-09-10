import { MSG } from "@/constants/messaging";
import { sendMessage } from "@/lib/messaging";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";
import type { TabData } from "@/types/tab-data.types";
import type { CaptureMode } from "@/types/page-data.types";

/**
 * Asks the tab's content script for page data and hands it to the side panel.
 *
 * `mode` only changes which content message is sent. Navigation, the pending
 * pull store and the push to an already open side panel are shared, so a
 * bookmark lands on the same entry-create page as a full capture.
 */
export async function handleCaptureRequest(
  fromContext: string,
  tabData: TabData,
  mode: CaptureMode = "page",
) {
  if (fromContext === "popup") {
    setPendingNavigation("/library/entries/new");

    // Push logic if side panel is already open
    const clearPendingNavigation = await sendMessage(
      MSG.NAVIGATE_IN_SIDEPANEL,
      { windowId: tabData.windowId, path: "/library/entries/new" },
    ).catch(() => false);
    // Will fail silently if side-panel is not open yet, which is expected

    if (clearPendingNavigation === true) {
      setPendingNavigation(null);
    }
  }

  // Request page data from content script via native messaging (faster than @webext-core/messaging)
  const pageSelectionData = await browser.tabs
    .sendMessage(tabData.tabId ?? 0, {
      type: mode === "bookmark" ? MSG.GET_PAGE_METADATA : MSG.GET_PAGE_DATA,
    })
    .catch(() => null);

  if (!pageSelectionData) return;

  // Store for pull logic in side panel
  setPendingCapture(pageSelectionData);

  // Push logic if side panel is already open
  const clearPendingCaptureData = await sendMessage(
    MSG.SEND_PAGE_CAPTURE_DATA,
    { windowId: tabData.windowId, payload: pageSelectionData },
  ).catch(() => null);

  if (clearPendingCaptureData === true) {
    setPendingCapture(null);
  }
  //TODO: Handle capture request from content script or other contexts if needed in the future.
}
