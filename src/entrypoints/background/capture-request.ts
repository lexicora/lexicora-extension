import { MSG } from "@/constants/messaging";
import { sendMessageCore } from "@/lib/messaging";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";
import { TabData } from "@/types/tab-data.types";

export async function handleCaptureRequest(
  fromContext: string,
  tabData: TabData,
) {
  if (fromContext === "popup") {
    setPendingNavigation("/library/entries/new");

    // Push logic if side panel is already open
    const clearPendingNavigation = await sendMessageCore(
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
    .sendMessage(tabData.tabId ?? 0, { type: MSG.GET_PAGE_DATA })
    .catch(() => null);

  if (!pageSelectionData) return;

  // Store for pull logic in side panel
  setPendingCapture(pageSelectionData);

  // Push logic if side panel is already open
  const clearPendingCaptureData = await sendMessageCore(
    MSG.SEND_PAGE_SELECTION_DATA,
    { windowId: tabData.windowId, payload: pageSelectionData },
  ).catch(() => null);

  if (clearPendingCaptureData === true) {
    setPendingCapture(null);
  }
  //TODO: Handle capture request from content script or other contexts if needed in the future.
}
