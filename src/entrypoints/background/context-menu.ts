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
        // Todo: Future implementation for AI-assisted saving
        console.log("AI-Assisted save not implemented yet.");
        break;
      case CMI_ID.SAVE_SELECTION_AS_IS:
        //let st = info.selectionText || "";
        const pageSelectionData = await sendMessage<pageSelectionData>(MSG.GET_PAGE_SELECTION_DATA_AS_IS, {}, "content-script@" + tab?.id);
        console.log("TEST: \nURL:", pageSelectionData.pageBaseUri, "\nSelected HTML:", pageSelectionData.pageHTML);
        // Todo: Save selectedHtml to markdown
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