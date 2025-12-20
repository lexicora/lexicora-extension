import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { pageData } from "@/types/page-selection-data.types";
import { Readability } from "@mozilla/readability";
import { Article } from "@/types/mozilla-article.types";
import turndownService from "@/lib/turndown";
import { Braces } from "lucide-react";

/**
 * Handles context menu item clicks and actions.
 */
export function contextMenuHandler() {
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
      case CMI_ID.OPEN_LEXICORA: {
        browser.tabs.create({ url: "https://lexicora.com" });
        break;
      }
      case CMI_ID.SAVE_SELECTION_AI_ASSISTED: {
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
      case CMI_ID.SAVE_SELECTION_AS_IS: {
        if (!tab) break;
        if (import.meta.env.FIREFOX) {
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.setPanel({
            tabId: tab.id,
            panel: browser.runtime.getURL("/sidepanel.html#/entries/new"),
          });
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.open();
        } else {
          browser.sidePanel.setOptions({
            tabId: tab.id,
            path: "sidepanel.html#/entries/new",
            enabled: true,
          });
          browser.sidePanel.open({ windowId: tab.windowId });
        }

        // browser.sidePanel.setOptions({
        //   tabId: tab.id,
        //   path: "sidepanel.html#/entries/new",
        //   enabled: true,
        // });
        // browser.sidePanel.open({ windowId: tab.windowId });
        //let st = info.selectionText || "";
        //const pageSelectionArticle = await sendMessage<Article>(MSG.GET_PAGE_SELECTION_ARTICLE, {}, "content-script@" + tab?.id);
        const pageSelectionData = await sendMessage<pageData | null>(
          MSG.GET_PAGE_SELECTION_DATA,
          {},
          "content-script@" + tab?.id,
        );
        let selectionDataExists = pageSelectionData != null;

        if (!selectionDataExists) {
          console.warn("No page selection data received.");
        }

        // 3. Send two separate, decoupled messages.
        setTimeout(() => {
          sendMessage(
            MSG.NAVIGATE_IN_SIDEPANEL,
            { path: "/entries/new" },
            "popup",
          );
        }, 50); //TODO MAYBE: Adjust delay if needed. (lower is better)

        const timeoutDuration = import.meta.env.FIREFOX ? 150 : 100; //NOTE: Firefox seems to need a bit more time.

        setTimeout(() => {
          if (selectionDataExists) {
            sendMessage(
              MSG.SEND_PAGE_SELECTION_DATA,
              pageSelectionData, //TODO: Handle null case in sidepanel editor component.
              "popup",
            );
          }
        }, timeoutDuration); //TODO MAYBE: Adjust delay if needed. (lower is better)

        //INFO: This executes before the above, due to js async nature.
        // Reset side panel to main entries page after a delay
        if (import.meta.env.FIREFOX) {
          // @ts-ignore: sidebarAction is a Firefox-specific API
          browser.sidebarAction.setPanel({
            tabId: tab.id,
            panel: browser.runtime.getURL("/sidepanel.html"),
          });
        } else {
          browser.sidePanel.setOptions({
            tabId: tab.id,
            path: "sidepanel.html",
            enabled: true,
          });
        }

        // Todo: Save selectedHtml to markdown
        //* pageSelectionData.pageHTML -> mozilla readability(leave out) -> markdown
        //const markdown = turndownService.turndown(pageSelectionData.pageHTML);

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
      case CMI_ID.SAVE_FROM_CLIPBOARD: {
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
