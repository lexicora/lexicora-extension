import {
  CMI_ID,
  CONTEXT_MENU_ITEMS,
  CONTEXT_MENU_ITEMS_AI,
  CONTEXT_MENU_ITEMS_NO_WEBSITE,
  CONTEXT_MENU_ITEMS_WEBSITE,
  NON_EXTENSION_PATTERN_CHAIN,
  type ContextMenuCreateProps,
} from "@/constants/context-menu-items";
import { FEATURES } from "@/constants/features";
import {
  setupContextMenuActions,
  setupContextMenuStateSync,
} from "./context-menu";
import { setupMessagingHandlers } from "./messaging-handler";
import { setupCommands } from "./commands";
import { setupPortHandlers } from "./port-handler";

/**
 * Creates one menu item, stepping down its URL patterns if the browser
 * refuses them.
 *
 * Only the side-panel item needs this. It names each browser's internal
 * scheme so it can appear on those pages, and a browser refuses the whole
 * item over a single scheme it does not know — losing the item on internal
 * pages beats losing it everywhere. Every other item asks for the web alone,
 * which nothing refuses.
 */
function createContextMenuItem(item: ContextMenuCreateProps): void {
  const chain =
    item.id === CMI_ID.TOGGLE_SIDE_PANEL ? NON_EXTENSION_PATTERN_CHAIN : null;

  const attempt = (step: number): void => {
    const patterns = chain?.[step];
    const candidate = patterns
      ? { ...item, documentUrlPatterns: [...patterns] }
      : item;

    try {
      browser.contextMenus.create(candidate, () => {
        const error = browser.runtime.lastError;
        if (!error) return;
        if (import.meta.env.DEV) {
          console.warn("Context menu item refused:", item.id, error.message);
        }
        if (chain && step + 1 < chain.length) attempt(step + 1);
      });
    } catch {
      if (chain && step + 1 < chain.length) attempt(step + 1);
    }
  };

  attempt(0);
}

export default defineBackground(() => {
  //console.log("Hello background!", { id: browser.runtime.id });
  browser.runtime.onInstalled.addListener(() => {
    //console.log("Extension installed");
    //browser.contextMenus.removeAll();

    // Create context menu items from the imported constants
    for (const contextMenuItem of CONTEXT_MENU_ITEMS) {
      const id = contextMenuItem?.id as string;
      if (!FEATURES.AI && CONTEXT_MENU_ITEMS_AI.includes(id)) continue;
      if (!FEATURES.WEBSITE && CONTEXT_MENU_ITEMS_WEBSITE.includes(id)) continue;
      if (FEATURES.WEBSITE && CONTEXT_MENU_ITEMS_NO_WEBSITE.includes(id)) continue;
      createContextMenuItem(contextMenuItem);
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

  // Browser-wide keyboard shortcuts
  setupCommands();

  // Port handlers
  //* NOTE: Feature parity discrepancy: Firefox does not support stuff related to the unsupported capture suggestions feature.
  if (!import.meta.env.FIREFOX) {
    setupPortHandlers();
  }
});
