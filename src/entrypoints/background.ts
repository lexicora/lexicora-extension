import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/contextMenuItems";
import { pageSelectionData } from "@/types/pageSelectionData";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");

    //browser.contextMenus.removeAll();

    // Create context menu items from the imported constants
    for (const contextMenuItem of CONTEXT_MENU_ITEMS) {
      browser.contextMenus.create(contextMenuItem);
    }
  });

  // Context menu click handler
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
      case CMI_ID.SAVE_SELECTION_AS_IS:
        //let st = info.selectionText || "";
        const selectedHtml = await sendMessage<pageSelectionData>(MSG.GET_PAGE_SELECTION_DATA_AS_IS, {}, "content-script@" + tab?.id);
        console.log("TEST: \nURL:", selectedHtml.pageBaseUri, "\nSelected HTML:", selectedHtml.pageHTML);
        // Todo: Save selectedHtml to markdown
        break;
      case CMI_ID.SAVE_SELECTION_AI_ASSISTED:
        if (info.selectionText) {
          // Todo: Future implementation for AI-assisted saving
          console.log("AI-Assisted save not implemented yet.");
        }
        break;
      case CMI_ID.OPEN_LEXICORA:
        browser.tabs.create({ url: "https://lexicora.com" });
        break;
      case CMI_ID.SAVE_FROM_CLIPBOARD:
        // Todo: Implement saving from clipboard
        console.log("Save from Clipboard not implemented yet.");
        break;
      default:
        console.warn("Unknown context menu item clicked:", info.menuItemId);
    }
  });
});
