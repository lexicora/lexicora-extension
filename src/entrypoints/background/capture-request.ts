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
  sender: Endpoint,
  clearPendingNavigation: boolean,
) {
  if (sender.context === "popup") {
    setPendingNavigation("/entries/new");
    if (clearPendingNavigation === true) setPendingNavigation(null);
    // TODO: Change implementation, to call the navigation from here, like commented out code.
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
