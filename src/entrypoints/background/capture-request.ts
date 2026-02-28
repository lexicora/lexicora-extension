import { MSG } from "@/constants/messaging";
import { sendMessage } from "webext-bridge/background";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";

type RuntimeContext =
  | "devtools"
  | "background"
  | "popup"
  | "options"
  | "content-script"
  | "window"
  | "side-panel";

interface Endpoint {
  context: RuntimeContext;
  tabId: number;
  frameId?: number;
}

export async function handleCaptureRequest(
  senderContext: RuntimeContext,
  windowId: number,
) {
  if (senderContext === "popup") {
    setPendingNavigation("/entries/new");
  }

  //TODO: Handle capture request from content script or other contexts if needed in the future.

  const clearPendingNavigation = await sendMessage(
    MSG.NAVIGATE_IN_SIDEPANEL,
    { path: "/entries/new" },
    "side-panel@" + windowId,
  ).catch(() => false);

  if (clearPendingNavigation === true) {
    setPendingNavigation(null);
  }
  // setTimeout(async () => {
  //   if (sender.context !== "popup") return;
  //   console.log("Tab info in capture request handler:", sender.tabId);
  //   const tab = await browser.tabs.get(sender.tabId);
  //   const clearPendingNavigation = await sendMessage(
  //     MSG.NAVIGATE_IN_SIDEPANEL,
  //     { path: "/entries/new" },
  //     "side-panel@" + tab.windowId,
  //   ).catch((e) => {
  //     console.error(
  //       "Failed to navigate in side panel. It might not be open or ready yet.",
  //       e,
  //     );
  //     return false;
  //   });
  //   if (clearPendingNavigation === true) {
  //     setPendingNavigation(null);
  //   }
  // }, 1000);
}
