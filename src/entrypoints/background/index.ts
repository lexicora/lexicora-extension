import { CONTEXT_MENU_ITEMS, CMI_ID } from "@/constants/context-menu-items";
import { PageData } from "@/types/page-data.types";
import {
  setupContextMenuActions,
  setupContextMenuStateSync,
} from "./context-menu";
import { setupMessagingHandlers } from "./messaging-handler";
import { setupPortHandlers } from "./port-handler";

export default defineBackground(() => {
  //console.log("Hello background!", { id: browser.runtime.id });
  browser.runtime.onInstalled.addListener(() => {
    //console.log("Extension installed");
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

  if (import.meta.env.CHROME) {
    // Set access level on chrome to allow getting storage items from the content-script context.
    browser.storage.session.setAccessLevel({
      accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
    });
  }

  // Context menu action/click handler
  setupContextMenuActions();
  setupContextMenuStateSync();

  // Messaging handlers
  setupMessagingHandlers();

  // Port handlers
  //* NOTE: Feature parity discrepancy: Firefox does not support stuff related to the unsupported capture suggestions feature.
  if (!import.meta.env.FIREFOX) {
    setupPortHandlers();
  }
});
