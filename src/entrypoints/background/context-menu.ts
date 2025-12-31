import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { pageData } from "@/types/page-selection-data.types";
import { Readability } from "@mozilla/readability";
import { Article } from "@/types/mozilla-article.types";
import turndownService from "@/lib/turndown";
import { Braces } from "lucide-react";
import { setPendingScrape, setPendingNavigation } from "./messaging-handler";

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
        if (import.meta.env.FIREFOX) {
          // // @ts-ignore: sidebarAction is a Firefox-specific API
          // browser.sidebarAction.setPanel({
          //   tabId: tab.id,
          //   panel: browser.runtime.getURL("/sidepanel.html#/entries/new"),
          // });
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.open();
        } else {
          // browser.sidePanel.setOptions({
          //   tabId: tab.id, // NOTE: {tabId: tab.id} For some reason unnecessary for Chrome
          //   path: "sidepanel.html#/entries/new",
          //   enabled: true,
          // });
          browser.sidePanel.open({ windowId: tab.windowId });
        }

        // 2. Request page selection data from content script
        const pageSelectionData = await sendMessage<pageData | null>(
          MSG.GET_PAGE_SELECTION_DATA,
          {},
          "content-script@" + tab?.id,
        );

        if (pageSelectionData) {
          // Store for pull logic in side panel
          setPendingScrape(pageSelectionData);

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

          // setTimeout(() => {
          //   sendMessage(
          //     MSG.SEND_PAGE_SELECTION_DATA,
          //     pageSelectionData, //TODO: Handle null case in sidepanel editor component.
          //     "popup",
          //   ).catch(() => {});
          // }, 50);
        }

        // Reset side panel to main entries page after a delay
        // if (import.meta.env.FIREFOX) {
        //   // @ts-ignore: sidebarAction is a Firefox-specific API
        //   browser.sidebarAction.setPanel({
        //     tabId: tab.id, // NOTE: For some reason necessary for Firefox
        //     panel: browser.runtime.getURL("/sidepanel.html"),
        //   });
        // } else {
        //   browser.sidePanel.setOptions({
        //     // NOTE: {tabId: tab.id} For some reason unnecessary for Chrome
        //     path: "sidepanel.html",
        //     enabled: true,
        //   });
        // }

        // let selectionDataExists = pageSelectionData != null;

        // if (!selectionDataExists) {
        //   console.warn("No page selection data received.");
        // }

        // //const timeoutDurationInitialTest = import.meta.env.FIREFOX ? 50 : 50;
        // const timeoutDurationInitial = import.meta.env.FIREFOX ? 100 : 75; //NOTE: Firefox seems to need a bit more time.

        // // 3. Send two separate, decoupled messages.
        // setTimeout(() => {
        //   sendMessage(
        //     MSG.NAVIGATE_IN_SIDEPANEL,
        //     { path: "/entries/new" },
        //     "popup",
        //   );
        // }, timeoutDurationInitial); //TODO MAYBE: Adjust delay if needed. (lower is better)

        // //const timeoutDurationTest = import.meta.env.FIREFOX ? 150 : 100;
        // // Fastest working was 125ms in Chrome, 200ms in Firefox
        // const timeoutDuration = import.meta.env.FIREFOX ? 225 : 150; //NOTE: Firefox seems to need a bit more time.

        // setTimeout(() => {
        //   if (selectionDataExists) {
        //     sendMessage(
        //       MSG.SEND_PAGE_SELECTION_DATA,
        //       pageSelectionData, //TODO: Handle null case in sidepanel editor component.
        //       "popup",
        //     );
        //   }
        // }, timeoutDuration); //TODO MAYBE: Adjust delay if needed. (lower is better)

        // Todo: Save selectedHtml to markdown
        //* pageSelectionData.pageHTML -> mozilla readability(leave out) -> markdown
        //const markdown = turndownService.turndown(pageSelectionData.pageHTML);

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
