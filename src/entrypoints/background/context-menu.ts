import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { pageData } from "@/types/page-selection-data.types";
import { Readability } from "@mozilla/readability";
import { Article } from "@/types/mozilla-article.types";
import turndownService from "@/lib/turndown";
import { Braces } from "lucide-react";
import { setPendingCapture, setPendingNavigation } from "./messaging-handler";

//TODO: Rewrite messaging to include pulling instead of pushing from the side panel, to avoid timing issues. (Create git branch for this)

/**
 * Handles context menu item clicks and actions.
 */
export function contextMenuHandler() {
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab) return;

    switch (info.menuItemId) {
      case CMI_ID.OPEN_LEXICORA: {
        browser.tabs.create({ url: "https://lexicora.com" });
        break;
      }
      case CMI_ID.CAPTURE_SELECTION_AI_ASSISTED: {
        const pageSelectionArticle = await sendMessage<Article>(
          MSG.GET_PAGE_SELECTION_ARTICLE,
          {},
          "content-script@" + tab?.id,
        );
        if (!pageSelectionArticle) break;
        // Todo: Future implementation for AI-assisted saving
        //* pageSelectionData.pageHTML -> mozilla readability -> markdown -> Backend(self to AI to self) -> markdown ->

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
        const pageSelectionData = await sendMessage<pageData | null>(
          MSG.GET_PAGE_SELECTION_DATA,
          {},
          "content-script@" + tab?.id,
        );

        if (pageSelectionData) {
          // Store for pull logic in side panel
          setPendingCapture(pageSelectionData);

          // Push logic if side panel is already open
          sendMessage(
            MSG.NAVIGATE_IN_SIDEPANEL,
            { path: "/entries/new" },
            "popup",
          ).catch(() => {});

          // Small wait to ensure page and editor have mounted
          sendMessage(
            MSG.SEND_PAGE_SELECTION_DATA,
            pageSelectionData, //TODO: Handle null case in sidepanel editor component.
            "popup",
          ).catch(() => {});
        }

        // Debug logs
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
      case CMI_ID.CAPTURE_FROM_CLIPBOARD: {
        // Todo: Implement saving from clipboard
        console.log("Save from Clipboard not implemented yet.");
        break;
      }
      default: {
        console.warn("Unknown context menu item clicked:", info.menuItemId);
      }
    }
  });
}
