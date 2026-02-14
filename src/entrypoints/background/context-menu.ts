import { onMessage, sendMessage } from "webext-bridge/background";
import { MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { PageData } from "@/types/page-selection-data.types";
import { Readability } from "@mozilla/readability";
import { Article } from "@/types/mozilla-article.types";
import turndownService from "@/lib/turndown";
import { Braces } from "lucide-react";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";

// TODO: Add messages for users (if exceptions occur, e.g., no selection made)

//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)/i; // Currently excludes: *.pdf*
const UNSUPPORTED_URL_REGEX =
  /\.pdf(\?|$)|chrome\.google\.com\/webstore|chromewebstore\.google\.com|addons\.mozilla\.org/i;
//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)|^(about|chrome|edge|browser|resource):/i;

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
        // @ts-ignore: Article does not satisfy JsonValue
        const pageSelectionArticle = await sendMessage(
          MSG.GET_PAGE_SELECTION_ARTICLE,
          null,
          "content-script@" + tab?.id,
        );
        if (!pageSelectionArticle) break;
        // Todo: Future implementation for AI-assisted saving
        //* pageSelectionData.pageHTML -> mozilla readability -> markdown -> Backend(self to AI to self) -> markdown ->

        //* INFO: Debug logs
        if (import.meta.env.DEV) {
          console.log(
            "TEST: \nURL:",
            pageSelectionArticle.siteName,
            "\nSelected HTML:",
            pageSelectionArticle.content,
          );
          //console.log("Readability article:", pageSelectionArticle);
        }
        //console.log("AI-Assisted save not implemented yet.");
        break;
      }
      case CMI_ID.CAPTURE_SELECTION_AS_IS: {
        setPendingNavigation("/entries/new");
        // TODO: Update panel scope to tab scope if needed
        if (import.meta.env.FIREFOX) {
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.open();
        } else {
          browser.sidePanel.open({ windowId: tab.windowId });
        }

        // Request page selection data from content script
        const pageSelectionData = await sendMessage(
          MSG.GET_PAGE_SELECTION_DATA,
          null,
          "content-script@" + tab?.id,
        );

        if (pageSelectionData) {
          // Store for pull logic in side panel
          setPendingCapture(pageSelectionData);

          // Push logic if side panel is already open
          const clearPendingNavigation = await sendMessage(
            MSG.NAVIGATE_IN_SIDEPANEL,
            { path: "/entries/new" },
            "side-panel@" + tab.windowId,
          ).catch(() => {});

          if (clearPendingNavigation === true) {
            setPendingNavigation(null);
          }

          // Push logic if side panel is already open
          const clearPendingCaptureData = await sendMessage(
            MSG.SEND_PAGE_SELECTION_DATA,
            pageSelectionData, //TODO: Handle null case in sidepanel editor component.
            "side-panel@" + tab.windowId,
          ).catch(() => {});

          if (clearPendingCaptureData === true) {
            setPendingCapture(null);
          }
        }

        //* INFO: Debug logs
        if (import.meta.env.DEV) {
          console.log(
            "TEST: \nURL:",
            pageSelectionData?.baseUri,
            "\nSelected HTML:",
            pageSelectionData?.HTML,
          );
          // Updated console log to new pageData structure
          console.log("Selected Page Data:", pageSelectionData);
          //console.log("Readability article:", pageSelectionData);
        }
        break;
      }
      case CMI_ID.CAPTURE_PAGE_AI_ASSISTED: {
        console.log("AI-Assisted page capture not implemented yet.");
        break;
      }
      case CMI_ID.CAPTURE_PAGE_AS_IS: {
        console.log("Page capture not implemented yet.");
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
      await browser.contextMenus.update(CMI_ID.CAPTURE_SELECTION_AI_ASSISTED, {
        //enabled: !isDisabled, //MAYBE: Use for stuff like, if it is locked, behind a subscription (plus, pro...)
        visible: !isDisabled,
      });
      await browser.contextMenus.update(CMI_ID.CAPTURE_SELECTION_AS_IS, {
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
