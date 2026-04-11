import { sidePanelStateStorage } from "@/lib/utils/storage/settings";

/**
 * Sets up message handlers for pending data and navigation requests
 */
export function setupPortHandlers() {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === "lexicora-sidepanel") {
      // Panel opened
      sidePanelStateStorage.setValue(true);
    }

    port.onDisconnect.addListener(() => {
      // Read the error to suppress the "Unchecked runtime.lastError" warning
      const _error = browser.runtime.lastError;

      // Optional: Log it for debugging, but just evaluating it suppresses the unchecked warning
      // if (error && error.message?.includes("back/forward cache")) {
      //   // Ignore normally
      // }

      // Panel closed
      if (port.name === "lexicora-sidepanel") {
        sidePanelStateStorage.setValue(false);
      }
    });
  });
}
