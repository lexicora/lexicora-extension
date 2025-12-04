import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { pageSelectionData } from "@/types/page-selection-data.types";

/**
 * Handles context menu item clicks and actions.
 */
export function contextMenuHandler() {
    browser.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
      case CMI_ID.OPEN_LEXICORA:
        browser.tabs.create({ url: "https://lexicora.com" });
        break;
      case CMI_ID.SAVE_SELECTION_AI_ASSISTED:
        const pageSelectionDataAssisted = await sendMessage<pageSelectionData>(MSG.GET_PAGE_SELECTION_DATA, {}, "content-script@" + tab?.id);
        // Todo: Future implementation for AI-assisted saving
        //* pageSelectionData.pageHTML -> mozillia readabilty -> markdown -> Backend(self to AI to self) -> markdown -> 
        if (import.meta.env.DEV) {
          console.log("TEST: \nURL:", pageSelectionDataAssisted.pageBaseUri, "\nSelected HTML:", pageSelectionDataAssisted.pageHTML);
        }
        //console.log("AI-Assisted save not implemented yet.");
        break;
      case CMI_ID.SAVE_SELECTION_AS_IS:
        //let st = info.selectionText || "";
        const pageSelectionData = await sendMessage<pageSelectionData>(MSG.GET_PAGE_SELECTION_DATA, {}, "content-script@" + tab?.id);
        // Todo: Save selectedHtml to markdown
        //* pageSelectionData.pageHTML -> mozillia readabilty -> markdown 
        if (import.meta.env.DEV) {
          console.log("TEST: \nURL:", pageSelectionData.pageBaseUri, "\nSelected HTML:", pageSelectionData.pageHTML);
        }
        break;
      case CMI_ID.SAVE_FROM_CLIPBOARD:
        // Todo: Implement saving from clipboard
        console.log("Save from Clipboard not implemented yet.");
        break;
      default:
        console.warn("Unknown context menu item clicked:", info.menuItemId);
    }
  });
};