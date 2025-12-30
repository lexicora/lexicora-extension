import { onMessage, sendMessage } from "webext-bridge/background";
import { type Message, MSG } from "@/types/messaging";
import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/types/context-menu-items";
import { pageData } from "@/types/page-selection-data.types";
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

    // NOTE: This should be the default, but setting explicitly might be unnecessary
    if (import.meta.env.FIREFOX) {
      // @ts-ignore: sidebarAction is a Firefox-specific API
      browser.sidebarAction.setPanel({
        panel: browser.runtime.getURL("/sidepanel.html"),
      });
    } else {
      browser.sidePanel.setOptions({
        path: "sidepanel.html",
        enabled: true,
      });
    }
  });

  // Context menu click handler
  contextMenuHandler();
});
