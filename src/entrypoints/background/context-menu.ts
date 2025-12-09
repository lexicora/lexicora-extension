import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { pageSelectionData } from "@/types/page-selection-data.types";
import { Readability } from "@mozilla/readability";
import { Article } from "@/types/mozilla-article.types";
import turndownService from "@/lib/turndown";

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
        const pageSelectionArticle = await sendMessage<Article>(MSG.GET_PAGE_SELECTION_ARTICLE, {}, "content-script@" + tab?.id);
        if (!pageSelectionArticle) break;
        // Todo: Future implementation for AI-assisted saving
        //* pageSelectionData.pageHTML -> mozilla readability -> markdown -> Backend(self to AI to self) -> markdown -> 
        
        if (import.meta.env.DEV) {
          console.log("TEST: \nURL:", pageSelectionArticle.siteName, "\nSelected HTML:", pageSelectionArticle.content);
          //console.log("Readability article:", pageSelectionArticle);
        }
        //console.log("AI-Assisted save not implemented yet.");
        break;
      }
      case CMI_ID.SAVE_SELECTION_AS_IS: {
        //let st = info.selectionText || "";
        //const pageSelectionArticle = await sendMessage<Article>(MSG.GET_PAGE_SELECTION_ARTICLE, {}, "content-script@" + tab?.id);
        const pageSelectionData = await sendMessage<pageSelectionData | null>(MSG.GET_PAGE_SELECTION_DATA, {}, "content-script@" + tab?.id);
        if (!pageSelectionData) break;
        // Todo: Save selectedHtml to markdown
        //* pageSelectionData.pageHTML -> mozilla readability(leave out) -> markdown 
        //const markdown = turndownService.turndown(pageSelectionData.pageHTML);

        if (import.meta.env.DEV) {
          console.log("TEST: \nURL:", pageSelectionData.pageBaseUri, "\nSelected HTML:", pageSelectionData.pageHTML);
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
};