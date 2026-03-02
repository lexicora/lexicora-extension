import { sidePanelStateStorage } from "@/lib/utils/storage/settings";

/**
 * Sets up message handlers for pending data and navigation requests
 */
export function setupPortHandlers() {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === "lexicora-sidepanel") {
      // Panel opened
      sidePanelStateStorage.setValue(true);

      // Panel closed
      port.onDisconnect.addListener(() => {
        sidePanelStateStorage.setValue(false);
      });
    }
  });
}
