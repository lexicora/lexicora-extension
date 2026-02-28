import { MSG } from "@/constants/messaging";
import { sendMessage } from "webext-bridge/background";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";
import { TabData } from "@/types/tab-data.types";

type RuntimeContext =
  | "devtools"
  | "background"
  | "popup"
  | "options"
  | "content-script"
  | "window"
  | "side-panel";

export async function handleCaptureRequest(
  senderContext: RuntimeContext,
  tabData: TabData,
) {
  if (senderContext === "popup") {
    setPendingNavigation("/entries/new");

    // Push logic if side panel is already open
    const clearPendingNavigation = await sendMessage(
      MSG.NAVIGATE_IN_SIDEPANEL,
      { path: "/entries/new" },
      "side-panel@" + tabData.windowId,
    ).catch(() => false);
    // Will fail silently if side-panel is not open yet, which is expected

    if (clearPendingNavigation === true) {
      setPendingNavigation(null);
    }
  }

  // Request page selection data from content script
  const pageSelectionData = await sendMessage(
    MSG.GET_PAGE_DATA,
    null,
    "content-script@" + tabData.tabId,
  );

  if (!pageSelectionData) return;

  // Store for pull logic in side panel
  setPendingCapture(pageSelectionData);

  // Push logic if side panel is already open
  const clearPendingCaptureData = await sendMessage(
    MSG.SEND_PAGE_SELECTION_DATA,
    pageSelectionData, //TODO: Handle null case in sidepanel editor component.
    "side-panel@" + tabData.windowId,
  ).catch(() => {});

  if (clearPendingCaptureData === true) {
    setPendingCapture(null);
  }
  //TODO: Handle capture request from content script or other contexts if needed in the future.
}
