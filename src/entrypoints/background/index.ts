import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { pageSelectionData } from "@/types/page-selection-data.types";
import { contextMenuHandler } from "./context-menu";

export default defineBackground(() => {
  //console.log("Hello background!", { id: browser.runtime.id });
  browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    //browser.contextMenus.removeAll();

    // Create context menu items from the imported constants
    for (const contextMenuItem of CONTEXT_MENU_ITEMS) {
      browser.contextMenus.create(contextMenuItem);
    }
  });

  // Context menu click handler
  contextMenuHandler();
});
