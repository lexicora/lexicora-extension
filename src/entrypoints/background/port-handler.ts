import { sidePanelStateStorage } from "@/lib/utils/storage/settings";

/**
 * Sets up message handlers for pending data and navigation requests
 */
export function setupPortHandlers() {
  if (import.meta.env.CHROME) {
    // Set access level on chrome to allow getting storage items
    browser.storage.session.setAccessLevel({
      accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
    });
  }

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
