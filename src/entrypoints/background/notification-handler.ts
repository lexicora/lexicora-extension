import { onMessage, sendMessage } from "webext-bridge/background";
import { MSG } from "@/types/messaging";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";
import { pageData } from "@/types/page-selection-data.types";
//import { NotificationData } from "@/types/notification-data.types";

const NOTIFICATION_ID = "lexicora-auto-capture";
//let pendingNotificationTabId: number | null = null;
//let pendingNotificationWindowId: number | undefined = undefined;
let targetWindowId: number | undefined = undefined;
// TODO: Maybe clear up after some time

export function setupNotificationHandlers() {
  // 1. Show Notification when timer fires
  onMessage(MSG.TRIGGER_AUTO_CAPTURE_NOTIFICATION, async ({ sender }) => {
    if (!sender.tabId) return;

    browser.tabs.get(sender.tabId).then((tab) => {
      targetWindowId = tab.windowId;
    });

    //pendingNotificationTabId = sender.tabId; //was data.tabId
    //pendingNotificationWindowId = data.windowId;

    await browser.notifications.create(NOTIFICATION_ID, {
      type: "basic",
      iconUrl: browser.runtime.getURL("/icon/128.png"),
      title: "Capture this page?",
      message: "You've been reading for a while. Save to Lexicora?",
      priority: 1,
    });
  });

  // 2. Handle Click: Open Sidepanel & Capture
  browser.notifications.onClicked.addListener(async (id) => {
    if (id !== NOTIFICATION_ID) return;

    // Maybe put this at the end of calling the sidepanel, because of the user action context
    browser.notifications.clear(id);

    //const tabId = pendingNotificationTabId;
    //const windowId = pendingNotificationWindowId;

    // Set navigation intent
    // Not needed (should navigate to home page by default)
    //setPendingNavigation("/entries/new");

    // Open Sidepanel (User Gesture via Notification Click allows this)
    if (import.meta.env.FIREFOX) {
      // @ts-ignore: Firefox specific API
      browser.sidebarAction.open();
    } else {
      // const [tab] = await browser.tabs.query({
      //   active: true,
      //   currentWindow: true,
      // });
      // if (!tab) return;
      if (!targetWindowId) return;
      await browser.sidePanel.open({ windowId: targetWindowId });
    }

    // Reuse your existing capture logic
    // Not inherently needed (user initiated action)
    // try {
    //   const pageSelectionData = await sendMessage<pageData | null>(
    //     MSG.GET_PAGE_SELECTION_DATA,
    //     {},
    //     `content-script@${tabId}`
    //   );

    //   if (pageSelectionData) {
    //     setPendingCapture(pageSelectionData);

    //     // Clear any previous navigation state in the sidepanel
    //      await sendMessage<boolean | null>(
    //         MSG.NAVIGATE_IN_SIDEPANEL,
    //         { path: "/entries/new" },
    //         `side-panel@${windowId}`
    //     ).catch(() => {});

    //     // Send the data
    //     sendMessage(
    //       MSG.SEND_PAGE_SELECTION_DATA,
    //       pageSelectionData,
    //       `side-panel@${windowId}`
    //     ).catch(() => {});
    //   }
    // } catch (error) {
    //   console.error("Auto-capture failed:", error);
    // }
  });
}
