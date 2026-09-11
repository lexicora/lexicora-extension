import { sendMessage } from "@/lib/messaging";
import { MSG } from "@/constants/messaging";
import { FEATURES } from "@/constants/features";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/constants/context-menu-items";
import type { PageData } from "@/types/page-data.types";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";
import { UNSUPPORTED_URL_REGEX } from "@/constants/support-capture-sites";

// TODO: Add messages for users (if exceptions occur, e.g., no selection made)

const NEW_ENTRY_PATH = "/library/entries/new";

type CaptureMessage =
  | typeof MSG.GET_PAGE_SELECTION_DATA
  | typeof MSG.GET_PAGE_DATA
  | typeof MSG.GET_PAGE_METADATA;

/** Requests capture data and delivers it to the sidepanel when already open. */
async function requestAndForwardCapture(
  tabId: number,
  windowId: number,
  messageType: CaptureMessage,
): Promise<PageData | null> {
  const pageCaptureData = await browser.tabs
    .sendMessage(tabId, { type: messageType })
    .catch(() => null);

  if (!pageCaptureData) return null;

  setPendingCapture(pageCaptureData);

  const clearPendingNavigation = await sendMessage(MSG.NAVIGATE_IN_SIDEPANEL, {
    windowId,
    path: NEW_ENTRY_PATH,
  }).catch(() => null);

  if (clearPendingNavigation === true) {
    setPendingNavigation(null);
  }

  const clearPendingCaptureData = await sendMessage(
    MSG.SEND_PAGE_CAPTURE_DATA,
    { windowId, payload: pageCaptureData },
  ).catch(() => null);

  if (clearPendingCaptureData === true) {
    setPendingCapture(null);
  }

  return pageCaptureData;
}

/**
 * Handles context menu item clicks and actions.
 */
export function setupContextMenuActions() {
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab) return;
    // Add browser-specific excluded URLs if needed (like extensions own pages)
    switch (info.menuItemId) {
      case CMI_ID.OPEN_LEXICORA: {
        browser.tabs.create({ url: "https://lexicora.com" });
        break;
      }
      case CMI_ID.CAPTURE_SELECTION_AI_ASSISTED: {
        // TODO: Content script handler for GET_PAGE_SELECTION_ARTICLE needs implementing when this feature is built
        if (!tab?.id) break;
        const pageCaptureData = await sendMessage(
          MSG.GET_PAGE_SELECTION_ARTICLE,
          null,
          { tabId: tab.id },
        );
        if (!pageCaptureData) break;
        // Todo: Future implementation for AI-assisted saving
        //* pageCaptureData.pageHTML -> mozilla readability -> markdown -> Backend(self to AI to self) -> markdown ->

        //* INFO: Debug logs
        if (import.meta.env.DEV) {
          console.log(
            "TEST: \nURL:",
            pageCaptureData.metadata.siteName,
            "\nSelected HTML:",
            pageCaptureData.content,
          );
          //console.log("Readability article:", pageSelectionData);
        }
        //console.log("AI-Assisted save not implemented yet.");
        break;
      }
      case CMI_ID.CAPTURE_SELECTION_AS_IS: {
        setPendingNavigation(NEW_ENTRY_PATH);
        if (import.meta.env.FIREFOX) {
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.open();
        } else {
          browser.sidePanel.open({ windowId: tab.windowId });
        }

        const pageCaptureData = await requestAndForwardCapture(
          tab.id ?? 0,
          tab.windowId,
          MSG.GET_PAGE_SELECTION_DATA,
        );

        //* INFO: Debug logs
        if (import.meta.env.DEV) {
          console.log("Selected Page Data:", pageCaptureData);
          //console.log("Readability article:", pageSelectionData);
        }
        break;
      }
      case CMI_ID.CAPTURE_PAGE_AI_ASSISTED: {
        console.log("AI-Assisted page capture not implemented yet.");
        break;
      }
      case CMI_ID.CAPTURE_PAGE_AS_IS: {
        setPendingNavigation(NEW_ENTRY_PATH);
        if (import.meta.env.FIREFOX) {
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.open();
        } else {
          browser.sidePanel.open({ windowId: tab.windowId });
        }

        const pageCaptureData = await requestAndForwardCapture(
          tab.id ?? 0,
          tab.windowId,
          MSG.GET_PAGE_DATA,
        );

        //* INFO: Debug logs
        if (import.meta.env.DEV) {
          console.log("Page Data:", pageCaptureData);
          //console.log("Readability article:", pageSelectionData);
        }
        break;
      }
      case CMI_ID.CAPTURE_PAGE_BOOKMARK: {
        setPendingNavigation(NEW_ENTRY_PATH);
        if (import.meta.env.FIREFOX) {
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.open();
        } else {
          browser.sidePanel.open({ windowId: tab.windowId });
        }

        const pageCaptureData = await requestAndForwardCapture(
          tab.id ?? 0,
          tab.windowId,
          MSG.GET_PAGE_METADATA,
        );

        //* INFO: Debug logs
        if (import.meta.env.DEV) {
          console.log("Page Data:", pageCaptureData);
        }
        break;
      }
      // case CMI_ID.CAPTURE_FROM_CLIPBOARD: {
      //   // Todo: Implement saving from clipboard (maybe scrap this)
      //   console.log("Save from Clipboard not implemented yet.");
      //   break;
      // }
      default: {
        console.warn("Unknown context menu item clicked:", info.menuItemId);
      }
    }
  });
}

/**
 * Sets up the synchronization between the active tab's URL
 * and the menu item's enabled/disabled state.
 */
export function setupContextMenuStateSync(/*menuId: string*/) {
  const updateUi = async (url?: string) => {
    if (!url) return;

    const isDisabled = UNSUPPORTED_URL_REGEX.test(url);

    try {
      if (FEATURES.AI) {
        await browser.contextMenus.update(
          CMI_ID.CAPTURE_SELECTION_AI_ASSISTED,
          {
            //enabled: !isDisabled, //MAYBE: Use for stuff like, if it is locked, behind a subscription (plus, pro...)
            visible: !isDisabled,
          },
        );

        await browser.contextMenus.update(CMI_ID.CAPTURE_PAGE_AI_ASSISTED, {
          //enabled: !isDisabled,
          visible: !isDisabled,
        });
      }
      await browser.contextMenus.update(CMI_ID.CAPTURE_SELECTION_AS_IS, {
        //enabled: !isDisabled,
        visible: !isDisabled,
      });
      await browser.contextMenus.update(CMI_ID.CAPTURE_PAGE_AS_IS, {
        //enabled: !isDisabled,
        visible: !isDisabled,
      });
      await browser.contextMenus.update(CMI_ID.CAPTURE_PAGE_BOOKMARK, {
        //enabled: !isDisabled,
        visible: !isDisabled,
      });
    } catch (e) {
      // Silently catch errors if the menu item hasn't been created yet
    }
  };

  // 1. Sync when a tab finishes loading or changes URL
  browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    if (changeInfo.url) {
      updateUi(changeInfo.url);
    }
  });

  // 2. Sync when the user switches between existing tabs
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      updateUi(tab.url);
    } catch (e) {
      // Tab might be gone or restricted
    }
  });
}
